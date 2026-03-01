const CandidateProfile = require("../models/Candidate/CandidateProfile");
const mongoose = require("mongoose");
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// ── S3 Client (for delete operations) ────────────────────────────────────────
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// 1. Helper: Return S3 URL as-is (already a public HTTPS URL)
const getSignedFileUrl = async (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string') return null;
    if (fileUrl.includes('undefined')) return '';
    return fileUrl;
};

// 2. Helper: Extract S3 public URL from multer-s3 upload result
const getFileUrl = (req) => {
    if (!req.file) return null;
    // multer-s3 sets req.file.location = full S3 HTTPS URL automatically
    return req.file.location || null;
};


// 🟢 NEW HELPER: Calculate Experience Duration
const calculateExperienceString = (stYr, stMo, edYr, edMo, isCurr) => {
    if (!stYr || !stMo) return "";

    const monthsMap = {
        "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
        "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };

    const start = new Date(parseInt(stYr), monthsMap[stMo] || 0);
    let end = new Date(); // Default to today for "Current"

    if (!isCurr && edYr && edMo) {
        end = new Date(parseInt(edYr), monthsMap[edMo] || 0);
    }

    // Calculate difference in months
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    // Ensure no negative values (if start date is in future)
    if (months < 0) months = 0;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let result = "";
    if (years > 0) result += `${years} Year${years > 1 ? 's' : ''} `;
    if (remainingMonths > 0) result += `${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;

    return result.trim() || "0 Months";
};

// ======================================================
// 1. GET PROFILE
// ======================================================
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await CandidateProfile.findOne({ candidateUserId: userId });

        if (!profile) {
            return res.json({
                success: true,
                data: {
                    canname: '', canfatNam: '', candob: '', cangen: '',
                    canphone: '', canemail: '', canstreet: '', canarea: '',
                    canareaTp: '', canstate: '', candist: '', cannation: '',
                    canpin: '', canabout: '', profilePhoto: '',
                    education: [], experience: [], internships: [],
                    projects: [], skills: [], languages: [],
                    profileVisibility: true,
                    jobSearchStatus: "Actively Looking"
                }
            });
        }

        let profileObj = profile.toObject({ virtuals: true });

        // Sign Images
        if (profileObj.personal?.profilePhoto) {
            profileObj.personal.profilePhoto = await getSignedFileUrl(profileObj.personal.profilePhoto);
        }
        if (profileObj.education) {
            profileObj.education = await Promise.all(profileObj.education.map(async item => ({
                ...item,
                caneduCert: await getSignedFileUrl(item.caneduCert)
            })));
        }
        if (profileObj.experience) {
            profileObj.experience = await Promise.all(profileObj.experience.map(async item => ({
                ...item,
                canexpCert: await getSignedFileUrl(item.canexpCert)
            })));
        }
        if (profileObj.internships) {
            profileObj.internships = await Promise.all(profileObj.internships.map(async item => ({
                ...item,
                canintCert: await getSignedFileUrl(item.canintCert)
            })));
        }
        if (profileObj.projects) {
            profileObj.projects = await Promise.all(profileObj.projects.map(async item => ({
                ...item,
                canproDoc: await getSignedFileUrl(item.canproDoc)
            })));
        }
        if (profileObj.skills) {
            profileObj.skills = await Promise.all(profileObj.skills.map(async item => ({
                ...item,
                canskiCer: await getSignedFileUrl(item.canskiCer)
            })));
        }

        const flattenedProfile = {
            ...profileObj,
            ...(profileObj.personal || {}),
        };
        delete flattenedProfile.personal;

        res.json({ success: true, data: flattenedProfile });

    } catch (err) {
        console.error("Get Profile Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ======================================================
// 2. SAVE PERSONAL DETAILS
// ======================================================
exports.savePersonalDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            canname, canfatNam, candob, cangen, canphone, canemail,
            canstreet, canarea, canareaTp, canstate, candist, cannation,
            canpin, canabout, profileVisibility, jobSearchStatus
        } = req.body;

        const existingProfile = await CandidateProfile.findOne({ candidateUserId: userId });
        let profilePhotoUrl = existingProfile?.personal?.profilePhoto || '';

        const newFile = getFileUrl(req);
        if (newFile) {
            profilePhotoUrl = newFile;
        }

        const personalData = {
            canname, canfatNam, candob, cangen, canphone, canemail,
            canstreet, canarea, canareaTp, canstate, candist, cannation,
            canpin, canabout,
            profileVisibility: profileVisibility !== undefined
                ? profileVisibility
                : (existingProfile?.personal?.profileVisibility ?? true),
            jobSearchStatus: jobSearchStatus
                || (existingProfile?.personal?.jobSearchStatus || "Actively Looking")
        };

        if (profilePhotoUrl && !profilePhotoUrl.includes('undefined')) {
            personalData.profilePhoto = profilePhotoUrl;
        }

        const profile = await CandidateProfile.findOneAndUpdate(
            { candidateUserId: userId },
            { $set: { personal: personalData } },
            { new: true, upsert: true }
        );

        const profileObj = profile.toObject({ virtuals: true });
        const flattenedProfile = {
            ...profileObj,
            ...(profileObj.personal || {}),
        };
        delete flattenedProfile.personal;

        res.json({ success: true, message: "Personal Details Updated", data: flattenedProfile });

    } catch (err) {
        console.error("❌ Save Personal Details Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ======================================================
// 3. GENERIC SAVE HELPER
// ======================================================
const saveListItem = async (req, res, section, fileField, data) => {
    try {
        const userId = req.user.id;
        const itemId = data._id || req.body._id;

        const fileUrl = getFileUrl(req);
        if (fileUrl && fileField) {
            data[fileField] = fileUrl;
        }

        let profile;

        if (itemId && mongoose.Types.ObjectId.isValid(itemId)) {
            // Update Existing
            if (!fileUrl && fileField) {
                const existing = await CandidateProfile.findOne(
                    { candidateUserId: userId },
                    { [section]: { $elemMatch: { _id: itemId } } }
                );
                const oldItem = existing?.[section]?.[0];
                if (oldItem && oldItem[fileField]) {
                    data[fileField] = oldItem[fileField];
                }
            }

            const updateData = { ...data };
            delete updateData._id;

            const updateObj = {};
            for (let key in updateData) {
                updateObj[`${section}.$.${key}`] = updateData[key];
            }

            profile = await CandidateProfile.findOneAndUpdate(
                { candidateUserId: userId, [`${section}._id`]: itemId },
                { $set: updateObj },
                { new: true }
            );
        } else {
            // Add New
            const pushData = { ...data };
            if (pushData._id === '' || pushData._id === null) delete pushData._id;

            profile = await CandidateProfile.findOneAndUpdate(
                { candidateUserId: userId },
                { $push: { [section]: pushData } },
                { new: true, upsert: true }
            );
        }

        res.json({ success: true, message: "Saved Successfully", data: profile });

    } catch (err) {
        console.error(`❌ Save ${section} Error:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ======================================================
// 🟢 4. SECTION HANDLERS (UPDATED EXPERIENCE LOGIC)
// ======================================================

// A. Experience (Calculates Duration Automatically)
exports.saveExperience = async (req, res) => {
    try {
        const data = { ...req.body };

        // 🟢 FIX: Force Calculation of Total Experience
        const isCurrent = data.canexpCurr === 'true' || data.canexpCurr === true;

        // Calculate the string (e.g. "2 Years 4 Months")
        const calculatedDuration = calculateExperienceString(
            data.canexpStYr,
            data.canexpStMo,
            data.canexpEdYr,
            data.canexpEdMo,
            isCurrent
        );

        // Save it to the database field 'canexpTot'
        data.canexpTot = calculatedDuration;

        console.log(`✅ Calculated Experience: ${calculatedDuration} (Current: ${isCurrent})`);

        // Proceed to save
        await saveListItem(req, res, 'experience', 'canexpCert', data);

    } catch (error) {
        console.error("Save Experience Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.saveEducation = (req, res) => saveListItem(req, res, 'education', 'caneduCert', req.body);
exports.saveInternship = (req, res) => saveListItem(req, res, 'internships', 'canintCert', req.body);
exports.saveProject = (req, res) => saveListItem(req, res, 'projects', 'canproDoc', req.body);
exports.saveSkill = (req, res) => saveListItem(req, res, 'skills', 'canskiCer', req.body);
exports.saveLanguage = (req, res) => saveListItem(req, res, 'languages', null, req.body);

// ======================================================
// 5. ENHANCED DELETE FUNCTION (Localized Disk Cleanup)
// ======================================================
exports.deleteSectionItem = async (req, res) => {
    try {
        const userId = req.user.id;
        let { section, itemId } = req.params;

        const sectionMap = {
            'skill': 'skills',
            'project': 'projects',
            'internship': 'internships',
            'language': 'languages',
            'education': 'education',
            'experience': 'experience'
        };

        const dbSection = sectionMap[section] || section;
        if (!dbSection) return res.status(400).json({ success: false, message: "Invalid Section" });

        // 🟢 1. Item-ah thedi andha file URL-ah edukurom
        const profileData = await CandidateProfile.findOne(
            { candidateUserId: userId },
            { [dbSection]: { $elemMatch: { _id: itemId } } }
        );

        const itemToDelete = profileData?.[dbSection]?.[0];

        // 🟢 2. S3 Cleanup — delete file from bucket if URL is an S3 link
        const fileFields = ['caneduCert', 'canexpCert', 'canintCert', 'canproDoc', 'canskiCer'];
        const fileUrl = fileFields.reduce((found, field) => found || itemToDelete?.[field], null);

        if (fileUrl && fileUrl.includes('amazonaws.com')) {
            try {
                // Extract S3 key from full URL:
                // e.g. https://emp-x-jobs.s3.ap-south-1.amazonaws.com/photos/id-123.jpg → photos/id-123.jpg
                const urlObj = new URL(fileUrl);
                const s3Key = urlObj.pathname.replace(/^\//, '');

                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: s3Key,
                }));
                console.log(`🗑️ S3 Object Deleted: ${s3Key}`);
            } catch (s3Err) {
                console.error('S3 Cleanup Warning:', s3Err.message);
            }
        }

        // 🟢 3. MongoDB-la irundha record-ah thookurom
        const updatedProfile = await CandidateProfile.findOneAndUpdate(
            { candidateUserId: userId },
            { $pull: { [dbSection]: { _id: itemId } } },
            { new: true }
        );

        res.json({
            success: true,
            message: "Item and associated file deleted from S3",
            data: updatedProfile
        });

    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ======================================================
// 6. SAVE FULL PROFILE (Bulk JSON Update)
// ======================================================
exports.saveFullProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileData = req.body;

        delete profileData.candidateUserId;
        delete profileData._id;

        const profile = await CandidateProfile.findOneAndUpdate(
            { candidateUserId: userId },
            { $set: profileData },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: "Full Profile Updated", data: profile });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ======================================================
// 7. QUICK UPDATE: VISIBILITY & STATUS
// ======================================================
exports.updateVisibilityStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profileVisibility, jobSearchStatus } = req.body;

        const updateFields = {};

        if (profileVisibility !== undefined) {
            updateFields["personal.profileVisibility"] = profileVisibility;
        }

        if (jobSearchStatus) {
            updateFields["personal.jobSearchStatus"] = jobSearchStatus;
            if (jobSearchStatus === "Not Looking (Hired)" || jobSearchStatus === "Not Looking") {
                updateFields["personal.profileVisibility"] = false;
            } else {
                updateFields["personal.profileVisibility"] = true;
            }
        }

        const profile = await CandidateProfile.findOneAndUpdate(
            { candidateUserId: userId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Status Updated",
            data: {
                profileVisibility: profile.personal.profileVisibility,
                jobSearchStatus: profile.personal.jobSearchStatus
            }
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ======================================================
// 8. GET VISIBILITY STATUS (Read-only)
// GET /api/candidate/visibility-status
// ======================================================
exports.getVisibilityStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await CandidateProfile.findOne(
            { candidateUserId: userId },
            { 'personal.profileVisibility': 1, 'personal.jobSearchStatus': 1 }
        );

        const visibility = profile?.personal?.profileVisibility ?? true;
        const jobSearchStatus = profile?.personal?.jobSearchStatus ?? 'Actively Looking';

        // Map status to a human-readable description shown in the UI
        const statusDescriptions = {
            'Actively Looking': 'Visible to all employers, prioritized in search',
            'Open to Opportunities': 'Visible but indicates you\'re currently employed',
            'Not Looking (Hired)': 'Hidden from employer searches',
            'Not Looking': 'Hidden from employer searches',
        };

        res.json({
            success: true,
            data: {
                profileVisibility: visibility,
                jobSearchStatus,
                description: statusDescriptions[jobSearchStatus] || '',
                // All available options for the "Change Status" dropdown
                options: [
                    {
                        value: 'Actively Looking',
                        label: 'Actively Looking',
                        description: 'Visible to all employers, prioritized in search',
                        isCurrent: jobSearchStatus === 'Actively Looking'
                    },
                    {
                        value: 'Open to Opportunities',
                        label: 'Open to Opportunities',
                        description: 'Visible but indicates you\'re currently employed',
                        isCurrent: jobSearchStatus === 'Open to Opportunities'
                    },
                    {
                        value: 'Not Looking (Hired)',
                        label: 'Not Looking (Hired)',
                        description: 'Hidden from employer searches',
                        isCurrent: jobSearchStatus === 'Not Looking (Hired)'
                    }
                ]
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ======================================================
// 9. CANDIDATE DASHBOARD STATS
// GET /api/candidate/dashboard
// Returns: profileCompletion%, appliedJobs, shortlisted/interviews
// ======================================================
exports.getCandidateDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const Application = require('../models/Application');
        const Bookmark = require('../models/Bookmark');

        // ── Fetch profile + counts in parallel ───────────────────────────────
        const [profile, appliedCount, shortlistedCount, bookmarkCount] = await Promise.all([
            CandidateProfile.findOne({ candidateUserId: userId }),
            Application.countDocuments({ candidateId: userId }),
            Application.countDocuments({
                candidateId: userId,
                status: { $in: ['Shortlisted', 'Interview Scheduled', 'Selected'] }
            }),
            require('../models/Bookmark').countDocuments({ candidateId: userId })
        ]);

        // ── Profile Completion Score ──────────────────────────────────────────
        // Each section contributes a weight. Total = 100%
        const sections = [
            { name: 'personalDetails', weight: 20, filled: !!(profile?.personal?.canname && profile?.personal?.canphone) },
            { name: 'profilePhoto', weight: 10, filled: !!(profile?.personal?.profilePhoto) },
            { name: 'about', weight: 10, filled: !!(profile?.personal?.canabout) },
            { name: 'education', weight: 15, filled: (profile?.education?.length > 0) },
            { name: 'experience', weight: 15, filled: (profile?.experience?.length > 0) },
            { name: 'skills', weight: 15, filled: (profile?.skills?.length > 0) },
            { name: 'jobPreferences', weight: 10, filled: !!(profile?.jobPreferences?.preferredRoles?.length > 0) },
            { name: 'resume', weight: 5, filled: !!(profile?.personal?.resume) },
        ];

        const profileCompletion = sections.reduce(
            (total, s) => total + (s.filled ? s.weight : 0), 0
        );

        // ── Sections still incomplete (hints for the frontend) ───────────────
        const incompleteSections = sections
            .filter(s => !s.filled)
            .map(s => ({ name: s.name, weight: s.weight }));

        res.json({
            success: true,
            data: {
                // Dashboard stat cards
                profileCompletion,          // e.g. 80  (percentage)
                appliedJobs: appliedCount,
                shortlisted: shortlistedCount,  // includes shortlisted + interview + selected
                savedJobs: bookmarkCount,

                // Visibility status (for the "Job Seeking Status" card)
                jobSearchStatus: profile?.personal?.jobSearchStatus ?? 'Actively Looking',
                profileVisibility: profile?.personal?.profileVisibility ?? true,

                // Profile hints
                incompleteSections
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
