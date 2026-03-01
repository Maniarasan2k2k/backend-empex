const Job = require("../../models/Employee/Job");
const Company = require("../../models/Employee/CompanyProfile");
const AuditLog = require("../../models/AuditLog");

const { auditCreate, auditUpdate, auditToggle, auditDelete, auditError } = require("../../services/auditService");
const { sendNotification } = require("../../services/notificationService");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * HELPER: Audit Log for ADMIN JOB (Legacy wrapper)
 */
const logAdminJobAction = async ({
    req,
    action,
    jobId,
    details,
    status = "SUCCESS",
}) => {
    try {
        await AuditLog.create({
            user: req.user?._id,
            performedBy: req.user?._id,
            userEmail: req.user?.email || "N/A",
            userRole: req.user?.role?.key || req.user?.role || "N/A",
            module: "ADMIN_JOB_MODULE",
            action,
            status,
            entity: "ADMIN_JOB",
            entityId: jobId?.toString(),
            details: details || "",
            timestamp: new Date(),
        });
    } catch (err) {
        console.error("ADMIN JOB AUDIT LOG ERROR:", err.message);
    }
};

/**
 * GET ALL JOBS (ADMIN)
 */
const getAllJobs = async (req, res) => {
    try {
        await Job.updateExpiredJobs();

        const { status, search } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (search) filter.$text = { $search: search };

        const jobs = await Job.find(filter)
            .populate("postedBy", "empname empemail")
            .populate("cmpProfile", "empcomNam")
            .sort({ createdAt: -1 });

        logAdminJobAction({
            req,
            action: "FETCH_ADMIN_JOBS",
            jobId: "ALL",
            details: "Fetched all admin jobs",
        });

        res.json({
            success: true,
            count: jobs.length,
            data: jobs,
        });
    } catch (err) {
        logAdminJobAction({
            req,
            action: "FETCH_ADMIN_JOBS",
            jobId: "ALL",
            details: err.message,
            status: "FAILED",
        });
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET SINGLE JOB
 */
const getJobById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid Job ID" });

        const job = await Job.findById(req.params.id)
            .populate("postedBy", "empname empemail")
            .populate("cmpProfile", "empcomNam");

        if (!job) return res.status(404).json({ message: "Job not found" });

        logAdminJobAction({
            req,
            action: "FETCH_ADMIN_JOB",
            jobId: job._id,
            details: `Viewed job: ${job.jobTit}`,
        });

        res.json({ success: true, data: job });
    } catch (err) {
        logAdminJobAction({
            req,
            action: "FETCH_ADMIN_JOB",
            jobId: req.params.id,
            details: err.message,
            status: "FAILED",
        });
        res.status(500).json({ message: err.message });
    }
};

/**
 * CREATE JOB (ADMIN)
 */
const createJob = async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();

        await auditCreate(req, "JOBS", job._id, "Job", `Admin created job: ${job.jobTit}`, job);

        res.status(201).json({ success: true, message: "Job created", data: job });
    } catch (err) {
        auditError(req, "JOBS", "CREATE", "Job", "Failed to create job", err.message);
        res.status(500).json({ message: err.message });
    }
};

/**
 * UPDATE JOB DETAILS (ADMIN)
 */
const updateJob = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const oldData = JSON.parse(JSON.stringify(job));
        Object.assign(job, req.body);
        await job.save();

        await auditUpdate(req, "JOBS", job._id, "Job", `Updated job: ${job.jobTit}`, oldData, job);

        res.json({ success: true, message: "Job updated", data: job });
    } catch (err) {
        auditError(req, "JOBS", "UPDATE", "Job", "Failed to update job", err.message);
        res.status(500).json({ message: err.message });
    }
};

/**
 * TOGGLE JOB VISIBILITY (HIDE/UNHIDE)
 */
const toggleJobVisibility = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const oldVal = job.isHidden;
        job.isHidden = !oldVal;
        await job.save();

        await auditToggle(req, "JOBS", job._id, "Job", `Job visibility toggled to ${job.isHidden}`, oldVal, job.isHidden);

        res.json({ success: true, isHidden: job.isHidden });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * TOGGLE ACTIVE / INACTIVE
 */
const toggleJobStatus = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const oldStatus = job.status;
        const newStatus = oldStatus === "active" ? "inactive" : "active";
        job.status = newStatus;
        await job.save();

        await auditUpdate(req, "JOBS", job._id, "Job", `Status changed: ${oldStatus} -> ${newStatus}`, { status: oldStatus }, { status: newStatus });

        res.json({ success: true, message: `Job ${job.status}`, status: job.status });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * UPDATE JOB STATUS (BLOCK / EXPIRE)
 */
const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["active", "inactive", "blocked", "expired"];
        if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const oldStatus = job.status;
        job.status = status;
        await job.save();

        await auditUpdate(req, "JOBS", job._id, "Job", `Status updated: ${oldStatus} -> ${status}`, { status: oldStatus }, { status });

        res.json({ success: true, message: "Status updated", data: job });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * DELETE JOB
 */
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        await auditDelete(req, "JOBS", job._id, "Job", `Deleted job: ${job.jobTit}`, job);
        await job.deleteOne();

        res.json({ success: true, message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET JOB STATISTICS (ADMIN)
 */
const getJobStats = async (req, res) => {
    try {
        const stats = await Job.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllJobs,
    getJobById,
    getJobStats,
    createJob,
    updateJob,
    toggleJobVisibility,
    toggleJobStatus,
    updateJobStatus,
    deleteJob,
};
