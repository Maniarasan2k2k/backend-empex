const Job = require("../models/Employee/Job");
const GovJob = require("../models/GovJob");
const CompanyProfile = require("../models/Employee/CompanyProfile");
const EmployeeUser = require("../models/EmployeeUser");
const { sendJobPostingPaymentEmail } = require("../utils/sendEmailSES");
// 🟢 NEW: Import centralized filter constants
const { JOB_FILTERS } = require("../utils/filterConstants");

const fs = require('fs');
const path = require('path');



// 🟢 3. HELPER: SIGN URL
const getSignedFileUrl = async (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string') return null;
    return fileUrl;

};

// --- 1. POST A JOB (WITH VALIDATION) ---
exports.postJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const { jobInd, jobTyp, jobMod, eduLvl, expLvl, salTyp, genPref } = req.body;

        // 🟢 NEW: Centralized Validation Check
        // Ensures only strings defined in filterConstants.js are saved
        if (!JOB_FILTERS.sectors.includes(jobInd)) {
            return res.status(400).json({ success: false, message: `Invalid Sector: ${jobInd}` });
        }
        if (!JOB_FILTERS.jobTypes.includes(jobTyp)) {
            return res.status(400).json({ success: false, message: `Invalid Job Type: ${jobTyp}` });
        }
        if (!JOB_FILTERS.workModes.includes(jobMod)) {
            return res.status(400).json({ success: false, message: `Invalid Work Mode: ${jobMod}` });
        }
        if (!JOB_FILTERS.educationLevels.includes(eduLvl)) {
            return res.status(400).json({ success: false, message: `Invalid Education Level: ${eduLvl}` });
        }
        if (!JOB_FILTERS.experienceLevels.includes(expLvl)) {
            return res.status(400).json({ success: false, message: `Invalid Experience Level: ${expLvl}` });
        }

        const companyProfile = await CompanyProfile.findOne({ employeeUserId: userId });

        // Ensure deadline is set to the very end of the day (23:59:59)
        const deadlineDate = new Date(req.body.deadline);
        deadlineDate.setHours(23, 59, 59, 999);

        let newJobData = {
            ...req.body,
            deadline: deadlineDate,
            postedBy: userId,
            status: "active",
            jobState: req.body.jobState || "Tamil Nadu",
            jobCat: req.body.jobCat || "Private",
            jobTime: jobTyp === 'Specific Time' ? req.body.jobTime : null,
            conDur: jobTyp === 'Contract Based' ? req.body.conDur : null,
            ojtDuration: req.body.ojtAvailable ? req.body.ojtDuration : null,
            ojtStipend: req.body.ojtAvailable ? req.body.ojtStipend : null,
        };

        if (companyProfile) {
            newJobData.cmpProfile = companyProfile._id;
            newJobData.cmpName = companyProfile.empcomNam;
            newJobData.cmpLogo = companyProfile.companyLogo;
            newJobData.cmpWeb = companyProfile.empweb;
        }

        const job = await Job.create(newJobData);

        // 🟢 SEND PAYMENT & ACTIVATION EMAIL TO EMPLOYER
        const employer = await EmployeeUser.findById(userId).select('empname empemail');
        if (employer && employer.empemail) {
            sendJobPostingPaymentEmail({
                to: employer.empemail,
                name: employer.empname,
                jobTitle: job.jobTit,
                companyName: job.cmpName || 'Your Company'
            }).catch(err => console.error("Job Payment Email Error:", err.message));
        }

        res.status(201).json({ success: true, message: "Job Posted Successfully!", job });

    } catch (error) {
        console.error("Job Post Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 2. GET ALL JOBS (FILTER ENGINE) ---
exports.getAllJobs = async (req, res) => {
    try {
        // Auto-update expired jobs
        await Job.updateExpiredJobs();

        const {
            page = 1, limit = 10, search,
            jobState, jobDist, jobInd, jobTyp, jobMod,
            expLvl, eduLvl, eduCourse, eduSpec, genPref, salRange, type, skills
        } = req.query;

        // Search for jobs where deadline is today or later
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        let query = {
            status: "active",
            deadline: { $gte: startOfToday }
        };
        const andConditions = [];

        // Text Search
        if (search) {
            andConditions.push({
                $or: [
                    { jobTit: { $regex: search, $options: "i" } },
                    { cmpName: { $regex: search, $options: "i" } },
                    { jobDesc: { $regex: search, $options: "i" } }
                ]
            });
        }

        // Helper: Multi-Value Regex Query
        const multiQuery = (val) => {
            if (!val) return null;
            const values = Array.isArray(val) ? val : val.split(',').map(v => v.trim()).filter(Boolean);
            if (values.length === 0) return null;
            return { $in: values.map(v => new RegExp(`^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")) };
        };

        // Apply Unified Filters
        if (jobState) andConditions.push({ jobState: multiQuery(jobState) });
        if (jobDist) andConditions.push({ jobDist: multiQuery(jobDist) });
        if (jobInd) andConditions.push({ jobInd: multiQuery(jobInd) });
        if (jobMod) andConditions.push({ jobMod: multiQuery(jobMod) });
        if (expLvl) andConditions.push({ expLvl: multiQuery(expLvl) });
        if (eduLvl) andConditions.push({ eduLvl: multiQuery(eduLvl) });
        if (eduCourse) andConditions.push({ eduCourse: multiQuery(eduCourse) });
        if (eduSpec) andConditions.push({ eduSpec: multiQuery(eduSpec) });

        // 🟢 SKILLS FILTER
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillList.length > 0) {
                const skillRegexes = skillList.map(s => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"));
                andConditions.push({
                    $or: [
                        { reqSkills: { $in: skillRegexes } },
                        { addSkills: { $in: skillRegexes } }
                    ]
                });
            }
        }

        // 🟢 PROFESSIONAL GENDER FILTER
        // Logic: If user filters by "Male", they should see jobs for "Male" AND "Any"
        if (genPref) {
            const selected = genPref.split(',').map(g => g.trim()).filter(Boolean);
            if (selected.length > 0) {
                // Always include 'Any' in the search if any gender is selected
                const inclusiveGenders = [...new Set([...selected, 'Any'])];
                andConditions.push({
                    genPref: {
                        $in: inclusiveGenders.map(g => new RegExp(`^${g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"))
                    }
                });
            }
        }

        if (type === 'Internship') {
            andConditions.push({ jobTyp: 'Internship' });
        } else if (jobTyp) {
            andConditions.push({ jobTyp: multiQuery(jobTyp) });
        }

        // 🟢 PROFESSIONAL SALARY RANGE FILTER
        if (salRange) {
            const ranges = salRange.split(',').map(r => r.trim());
            const salaryOr = ranges.map(range => {
                const parts = range.split('-');
                const min = parseInt(parts[0]);
                const max = parseInt(parts[1]);

                if (!isNaN(min) && !isNaN(max)) {
                    // Overlap logic: Job salary overlaps with selected range
                    return {
                        $and: [
                            { salMin: { $lte: max } },
                            { salMax: { $gte: min } }
                        ]
                    };
                }
                return null;
            }).filter(Boolean);

            if (salaryOr.length > 0) {
                andConditions.push({ $or: salaryOr });
            }
        }

        if (andConditions.length > 0) query.$and = andConditions;

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalJobs = await Job.countDocuments(query);

        // Sign Logos
        const jobsWithSignedUrls = await Promise.all(jobs.map(async (job) => {
            if (job.cmpLogo) job.cmpLogo = await getSignedFileUrl(job.cmpLogo);
            return job;
        }));

        res.status(200).json({
            success: true,
            totalJobs,
            totalPages: Math.ceil(totalJobs / limitNum),
            currentPage: pageNum,
            jobs: jobsWithSignedUrls
        });

    } catch (error) {
        console.error("FATAL ERROR IN SEARCH:", error);
        res.status(500).json({ success: false, message: "Database query error." });
    }
};

// --- 3. GET SINGLE JOB ---
// 🟢 UPDATED: Signs Logo
exports.getJobById = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: "Invalid Job ID" });
        }

        // 🟢 Use .lean()
        const job = await Job.findById(req.params.id)
            .populate("postedBy", "name email")
            .lean();

        if (!job) return res.status(404).json({ message: "Job not found" });

        // 🟢 Sign Logo
        if (job.cmpLogo) {
            job.cmpLogo = await getSignedFileUrl(job.cmpLogo);
        }

        res.json({ success: true, job });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. GET MY POSTED JOBS ---
// 🟢 UPDATED: Signs Logo
exports.getMyJobs = async (req, res) => {
    try {
        // Auto-update expired jobs
        await Job.updateExpiredJobs();

        // 🟢 Use .lean()
        const jobs = await Job.find({ postedBy: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        // 🟢 Sign Logos
        const signedJobs = await Promise.all(jobs.map(async (job) => {
            if (job.cmpLogo) job.cmpLogo = await getSignedFileUrl(job.cmpLogo);
            return job;
        }));

        res.json({ success: true, count: signedJobs.length, jobs: signedJobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 5. GET JOBS BY DISTRICT ---
// 🟢 UPDATED: Signs Logo
exports.getJobsByDistrict = async (req, res) => {
    try {
        // Auto-update expired jobs
        await Job.updateExpiredJobs();

        const { district } = req.params;
        // 🟢 Use .lean()
        const jobs = await Job.find({
            jobDist: { $regex: new RegExp(district, "i") },
            status: "active"
        }).sort({ createdAt: -1 }).lean();

        // 🟢 Sign Logos
        const signedJobs = await Promise.all(jobs.map(async (job) => {
            if (job.cmpLogo) job.cmpLogo = await getSignedFileUrl(job.cmpLogo);
            return job;
        }));

        res.json({ success: true, count: signedJobs.length, jobs: signedJobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 🏛 SECTION 2: GOVERNMENT JOBS
// ==========================================

exports.createGovJob = async (req, res) => {
    try {
        const newGovJob = await GovJob.create({ ...req.body, postedBy: req.user.id });
        res.status(201).json({ success: true, message: "Govt Job Posted!", job: newGovJob });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 🟢 UPDATED: Signs 'jobImage'
exports.getCentralJobs = async (req, res) => {
    try {
        // Auto-update expired jobs
        await GovJob.updateExpiredJobs();

        // 🟢 Use .lean()
        const jobs = await GovJob.find({ jobCat: "Central Government", status: "active" })
            .sort({ createdAt: -1 })
            .lean();

        // 🟢 Sign Images
        const signedJobs = await Promise.all(jobs.map(async (job) => {
            if (job.jobImage) job.jobImage = await getSignedFileUrl(job.jobImage);
            return job;
        }));

        res.json({ success: true, count: signedJobs.length, jobs: signedJobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 UPDATED: Signs 'jobImage'
exports.getGovernmentJobs = async (req, res) => {
    try {
        // Auto-update expired jobs
        await GovJob.updateExpiredJobs();

        // 🟢 Use .lean()
        const jobs = await GovJob.find({ jobCat: "State Government", status: "active" })
            .sort({ createdAt: -1 })
            .lean();

        // 🟢 Sign Images
        const signedJobs = await Promise.all(jobs.map(async (job) => {
            if (job.jobImage) job.jobImage = await getSignedFileUrl(job.jobImage);
            return job;
        }));

        res.json({ success: true, count: signedJobs.length, jobs: signedJobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// ⚙ SECTION 3: UPDATE
// ==========================================

// --- ⚙️ EXTEND & REACTIVATE JOB (Bump to New Post) ---
exports.extendJobDeadline = async (req, res) => {
    try {
        const { id } = req.params;
        const { deadline } = req.body;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // Check ownership
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: "Not authorized to modify this job" });
        }

        // Update Job: 
        // 1. Set the new future deadline (End of day)
        // 2. Refresh createdAt so it gets the [NEW] badge and moves to the top
        const newDeadline = new Date(deadline);
        newDeadline.setHours(23, 59, 59, 999);

        // 🔥 PROFESSIONAL FIX: Force update the createdAt field.
        // We use findByIdAndUpdate with { timestamps: false } to prevent 
        // Mongoose from overriding our manual timestamp change.
        const updatedJob = await Job.findByIdAndUpdate(
            id,
            {
                $set: {
                    deadline: newDeadline,
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            },
            { new: true, timestamps: false }
        );

        res.json({
            success: true,
            message: "Job extended successfully! The posted date has been refreshed to today.",
            job: updatedJob
        });

    } catch (error) {
        console.error("Extend Job Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET MY POSTED INTERNSHIPS ---
// 🟢 UPDATED: Signs Logo
exports.getMyInternships = async (req, res) => {
    try {
        // Auto-update expired jobs
        await Job.updateExpiredJobs();

        // 🟢 Use .lean()
        const internships = await Job.find({
            postedBy: req.user.id,
            $or: [
                { jobTyp: "Internship" },
                { type: "Internship" }
            ]
        }).sort({ createdAt: -1 }).lean();

        // 🟢 Sign Logos
        const signedData = await Promise.all(internships.map(async (job) => {
            if (job.cmpLogo) job.cmpLogo = await getSignedFileUrl(job.cmpLogo);
            return job;
        }));

        res.json({ success: true, count: signedData.length, data: signedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// --- GET ALL FILTER OPTIONS ---
exports.getJobFilters = async (req, res) => {
    try {
        // You can also fetch unique values from the DB if they aren't in constants
        // const districts = await Job.distinct("jobDist"); 

        const filters = {
            sectors: JOB_FILTERS.sectors,
            jobTypes: JOB_FILTERS.jobTypes,
            workModes: JOB_FILTERS.workModes,
            educationLevels: JOB_FILTERS.educationLevels,
            experienceLevels: JOB_FILTERS.experienceLevels,
            salaryRanges: [
                "0-10000", "10000-25000", "25000-50000", "50000-100000", "100000-500000"
            ],
            genderPreferences: ["Male", "Female", "Any"]
        };

        res.status(200).json({
            success: true,
            data: filters
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};