const mongoose = require('mongoose');
const CompanyProfile = require('../models/Employee/CompanyProfile');
const Job = require('../models/Employee/Job');
const Application = require('../models/Application');
const User = require('../models/CandidateUser');
const CandidateProfile = require('../models/Candidate/CandidateProfile');
const Notification = require('../models/Notification');
const { JOB_FILTERS } = require('../utils/filterConstants');
const { validateDocumentsArray, validateDocumentNumber, DOC_RULES } = require('../utils/documentValidator');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// ── S3 Client ─────────────────────────────────────────────────────────────────
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// ======================================================
// 0. HELPERS (S3 Upload Logic)
// ======================================================

// 🟢 Helper: Extract S3 URL from multer-s3 upload (req.file.location)
const getFileUrl = (file) => {
    if (!file) return null;
    // multer-s3 sets file.location = full S3 public HTTPS URL
    return file.location || null;
};

// 🟢 Helper: Return URL as-is (S3 URLs are already public)
const getSignedFileUrl = async (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string') return null;
    return fileUrl;
};

// ======================================================
// 1. DASHBOARD & PROFILE
// ======================================================
exports.getDashboardStats = async (req, res) => {
    try {
        const employeeId = req.user.id;

        // 🟢 Auto-update expired jobs so the 'active' count is accurate
        await Job.updateExpiredJobs();

        const myJobs = await Job.find({ postedBy: employeeId }).select('_id status');
        const myJobIds = myJobs.map(job => job._id);

        res.json({
            success: true,
            stats: {
                activeJobs: myJobs.filter(j => j.status === 'active').length,
                totalApplications: await Application.countDocuments({ jobId: { $in: myJobIds } }),
                shortlisted: await Application.countDocuments({ jobId: { $in: myJobIds }, status: 'Shortlisted' }),
                hired: await Application.countDocuments({ jobId: { $in: myJobIds }, status: { $in: ['Hired', 'Selected'] } }),
                pendingReview: await Application.countDocuments({ jobId: { $in: myJobIds }, status: 'Applied' })
            }
        });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.getCompanyProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ employeeUserId: req.user.id }).lean();
        if (!profile) return res.json({ success: true, data: null });
        if (profile.companyLogo) profile.companyLogo = await getSignedFileUrl(profile.companyLogo);
        res.status(200).json({ success: true, data: profile });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.saveCompanyProfile = async (req, res) => {
    try {
        // 1. Destructure data from req.body
        let { documents, ...updateData } = req.body;
        const employeeId = req.user.id;

        // 🟢 Logic 1: Handle Company Logo
        if (req.files?.companyLogo) {
            updateData.companyLogo = getFileUrl(req.files.companyLogo[0]);
        }

        // 🟢 Logic 2: Handle Multiple Company Documents (PAN/GST)
        // Intha array structure correct-ah schema-oda match aaganum
        let docArray = [];
        if (req.files?.companyDoc) {
            docArray = req.files.companyDoc.map((file, index) => {
                const types = ['pan', 'gst', 'udyam', 'cin'];
                return {
                    type: req.body.docTypes ? req.body.docTypes[index] : (types[index] || 'others'),
                    number: req.body.docNumbers ? req.body.docNumbers[index] : 'PENDING',
                    fileUrl: getFileUrl(file),
                    fileName: file.originalname
                };
            });
        }

        // 🟢 Logic 3: Unified Update
        // Inga dhaan thappu nadandhadhu. Objects-ah merge panni ore save-la mudikkanum.
        const finalUpdate = { $set: updateData };

        // Documents upload aagi irundha mattum array-ah replace pannuvom
        if (docArray.length > 0) {
            finalUpdate.$set.documents = docArray;
        }

        const profile = await CompanyProfile.findOneAndUpdate(
            { employeeUserId: employeeId },
            finalUpdate,
            { new: true, upsert: true } // Upsert: Profile illana create pannum
        );

        // 🟢 Logic 4: Sync branding to active jobs
        await Job.updateMany(
            { postedBy: employeeId, status: 'active' },
            { $set: { cmpName: profile.empcomNam, cmpLogo: profile.companyLogo, cmpWeb: profile.empweb } }
        );

        res.status(200).json({
            success: true,
            message: "Profile and Documents Saved Successfully!",
            data: profile
        });

    } catch (error) {
        console.error("❌ Save Company Profile Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUnifiedApplications = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        // 1. Get Employer's Job IDs
        const jobs = await Job.find({ postedBy: employerId }).select('_id jobTit jobCity');
        const jobIds = jobs.map(j => j._id);

        const statusFilter = status ? status.split(',') : ['Applied', 'Shortlisted', 'Interview Scheduled', 'Hired'];

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // 2. Fetch Applications (Filtered by Employer's Jobs)
        const applications = await Application.find({
            jobId: { $in: jobIds },
            status: { $in: statusFilter }
        })
            .populate('candidateId', 'canname canemail canphone profileImg')
            .populate('jobId', 'jobTit jobCity')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalApplications = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: { $in: statusFilter }
        });

        // 🟢 FIX Step 1: Filter out applications where Job or Candidate record is missing (DELETED from DB)
        const validApplications = applications.filter(app => app.jobId && app.candidateId);

        // 3. Enriched with Resume Data
        const enrichedApps = await Promise.all(validApplications.map(async (app) => {
            const profile = await CandidateProfile.findOne({ candidateUserId: app.candidateId._id })
                .select('education experience skills personal languages projects internships');

            app.resumeData = profile || {};
            return app;
        }));

        // 🟢 FIX Step 2: Grouping Logic with strict ID check
        const groupedApplications = enrichedApps.reduce((acc, currentApp) => {
            const jobId = currentApp.jobId._id.toString();

            if (acc[jobId]) {
                acc[jobId].candidates.push(currentApp);
            } else {
                acc[jobId] = {
                    _id: currentApp.jobId._id,
                    jobTit: currentApp.jobId.jobTit || "Unknown Title",
                    jobCity: currentApp.jobId.jobCity || "",
                    candidates: [currentApp]
                };
            }
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            total: totalApplications,
            currentPage: pageNum,
            totalPages: Math.ceil(totalApplications / limitNum),
            applications: Object.values(groupedApplications)
        });

    } catch (error) {
        console.error("❌ Get Unified Applications Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 UPDATE UNIFIED: One route for Single Status, Bulk Status, and Interview Scheduling
// Both Web and Mobile call: PUT /api/employee/applications/update-status
// Accepts EITHER:
//   - applicationId: "abc123"          (single string  — for Shortlisted / Hired / Rejected)
//   - applicationIds: ["abc", "def"]   (array          — for bulk / interview scheduling)
exports.updateUnifiedStatus = async (req, res) => {
    try {
        const { applicationId, applicationIds, status, ...interviewData } = req.body;

        // Normalize: accept single string OR array
        let ids;
        if (applicationId && typeof applicationId === 'string') {
            ids = [applicationId];                         // single string → wrap into array
        } else if (Array.isArray(applicationIds) && applicationIds.length > 0) {
            ids = applicationIds;                          // array → use as-is
        } else {
            return res.status(400).json({
                success: false,
                message: "Provide either 'applicationId' (string) or 'applicationIds' (array)."
            });
        }

        if (!status) {
            return res.status(400).json({ success: false, message: "'status' is required." });
        }

        // 1. Update Database
        await Application.updateMany(
            { _id: { $in: ids } },
            { $set: { status, ...interviewData } }
        );

        // 2. Trigger Notifications & Socket Pings
        const io = req.app.get('socketio');
        const apps = await Application.find({ _id: { $in: ids } }).populate('jobId', 'jobTit');

        for (let app of apps) {
            const notification = await Notification.create({
                recipient: app.candidateId,
                recipientModel: 'CandidateUser',
                sender: req.user.id,
                senderModel: 'EmployeeUser',
                type: 'system',
                title: 'Application Update',
                message: `Your application for "${app.jobId.jobTit}" is now: ${status}.`,
                relatedId: app._id
            });

            if (io) io.to(app.candidateId.toString()).emit('new_ping', notification);
        }

        res.status(200).json({ success: true, message: `Updated ${ids.length} application(s) to ${status}` });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// ======================================================
// 3. SEARCH & CANDIDATES
// ======================================================
// employeeController.js replacement function
exports.searchCandidates = async (req, res) => {
    try {
        const {
            skill, location, district, education, gender, status,
            page = 1, limit = 10
        } = req.query;

        // Base query: Visibility true-ah irukavanga mattum dhaan search-la varanum
        let query = { 'personal.profileVisibility': true };
        const andConditions = [];

        // 🟢 Filters logic
        if (skill) {
            const skillList = skill.split(',').map(s => s.trim());
            andConditions.push({ 'skills.canskicou': { $in: skillList.map(s => new RegExp(s, 'i')) } });
        }
        if (location) andConditions.push({ 'personal.canstate': new RegExp(location, 'i') });
        if (district) andConditions.push({ 'personal.candist': new RegExp(district, 'i') });
        if (education) andConditions.push({ 'education.caneduQual': education });
        if (gender) andConditions.push({ 'personal.cangen': gender });
        if (status) andConditions.push({ 'personal.jobSearchStatus': status });

        if (andConditions.length > 0) query.$and = andConditions;

        // 🟢 Pagination logic
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const candidates = await CandidateProfile.find(query)
            .populate('candidateUserId', 'canname canemail canphone profilePicture')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await CandidateProfile.countDocuments(query);

        res.json({
            success: true,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            candidates
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCandidateById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').lean();
        if (!user) return res.status(404).json({ success: false, message: "Not found" });
        const profile = await CandidateProfile.findOne({ candidateUserId: user._id });
        res.json({ success: true, candidate: { ...user, profileDetails: profile || {} } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
// ======================================================
// 4. DOCUMENTS — Validate / Save / Delete
// ======================================================

// 🟢 VALIDATE COMPANY DOCUMENTS
// POST /api/employee/profile/document/validate
// Body: { documents: [{ type: 'pan', number: 'ABCDE1234F' }, ...] }
exports.validateCompanyDocuments = async (req, res) => {
    try {
        const { documents } = req.body;

        // ── Single document shorthand: { type, number } ─────────────────
        if (!documents && req.body.type && req.body.number) {
            const result = validateDocumentNumber(req.body.type, req.body.number);
            return res.status(result.valid ? 200 : 422).json({
                success: result.valid,
                type: req.body.type,
                number: req.body.number,
                message: result.message
            });
        }

        // ── Array mode: validate multiple documents at once ───────────────
        const { isValid, errors } = validateDocumentsArray(documents);

        if (!isValid) {
            return res.status(422).json({
                success: false,
                message: 'Document validation failed',
                errors
            });
        }

        res.status(200).json({
            success: true,
            message: 'All documents are valid',
            validated: documents.length
        });

    } catch (err) {
        console.error('❌ Validate Document Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 🟢 GET DOCUMENT FORMAT RULES (so mobile app can show hints)
// GET /api/employee/profile/document/rules
exports.getDocumentRules = async (req, res) => {
    try {
        const rules = Object.entries(DOC_RULES).map(([key, rule]) => ({
            type: key,
            label: rule.label,
            example: rule.example,
            hint: rule.hint
        }));
        res.status(200).json({ success: true, data: rules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.saveCompanyDocument = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { docName } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No document file uploaded" });
        }

        // 🟢 Calculate Localized URL
        const docUrl = getFileUrl(req.file, req);

        const newDoc = {
            docName: docName || req.file.originalname,
            docUrl: docUrl,
            uploadedAt: new Date()
        };

        // 🟢 Push to Database Array
        const profile = await CompanyProfile.findOneAndUpdate(
            { employeeUserId: employerId },
            { $push: { documents: newDoc } }, // Unga schema-la 'documents' array irukku
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: "Document saved to 120GB production disk",
            data: profile.documents
        });

    } catch (err) {
        console.error("Save Document Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteCompanyDocument = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { documentId, documentUrl } = req.body; // itemId and URL renduமே venum da

        // 🟢 1. S3 Cleanup — delete file from bucket
        if (documentUrl && documentUrl.includes('amazonaws.com')) {
            try {
                const urlObj = new URL(documentUrl);
                const s3Key = urlObj.pathname.replace(/^\//, '');
                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: s3Key,
                }));
                console.log(`🗑️ S3 Document Deleted: ${s3Key}`);
            } catch (s3Err) {
                console.error('S3 Cleanup Warning:', s3Err.message);
            }
        }

        // 🟢 2. Database Cleanup ($pull specific document from array)
        const updatedProfile = await CompanyProfile.findOneAndUpdate(
            { employeeUserId: employerId },
            { $pull: { documents: { _id: documentId } } }, // Unga schema-la 'documents' nu irundha idhu work aagum
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Document deleted from server and profile",
            data: updatedProfile
        });

    } catch (err) {
        console.error("Delete Document Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
// ── End of employeeController.js ───────────────────────────────────────────