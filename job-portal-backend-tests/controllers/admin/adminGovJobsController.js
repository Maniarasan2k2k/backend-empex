const GovJob = require("../../models/GovJob");
const auditService = require("../../services/auditService");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET ALL GOVT JOBS
 */
const getAllGovJobs = async (req, res) => {
    try {
        await GovJob.updateExpiredJobs();

        const jobs = await GovJob.find()
            .populate("postedBy", "empname empemail")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            data: jobs,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET SINGLE GOVT JOB
 */
const getGovJobById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const job = await GovJob.findById(req.params.id)
            .populate("postedBy", "empname empemail");

        if (!job) return res.status(404).json({ message: "Gov job not found" });

        res.json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * CREATE GOVT JOB (ADMIN)
 */
const createGovJob = async (req, res) => {
    try {
        const job = new GovJob({
            ...req.body,
            postedBy: req.user?._id
        });
        await job.save();

        await auditService.auditCreate(req, "GOV_JOBS", job._id, "GovJob", `Created gov job: ${job.jobTit}`, job);

        res.status(201).json({ success: true, message: "Job created", data: job });
    } catch (err) {
        auditService.auditError(req, "GOV_JOBS", "CREATE", "GovJob", "Failed to create gov job", err.message);
        res.status(500).json({ message: err.message });
    }
};

/**
 * UPDATE GOVT JOB
 */
const updateGovJob = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const job = await GovJob.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const oldData = JSON.parse(JSON.stringify(job));
        Object.assign(job, req.body);
        const updated = await job.save();

        await auditService.auditUpdate(req, "GOV_JOBS", updated._id, "GovJob", `Updated gov job: ${updated.jobTit}`, oldData, updated);

        res.json({ success: true, message: "Job updated", data: updated });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * ACTIVATE / DEACTIVATE JOB
 */
const toggleGovJobStatus = async (req, res) => {
    try {
        const job = await GovJob.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const oldStatus = job.status;
        const newStatus = oldStatus === "active" ? "inactive" : "active";
        job.status = newStatus;
        await job.save();

        await auditService.auditUpdate(req, "GOV_JOBS", job._id, "GovJob", `Status toggled to ${newStatus}`, { status: oldStatus }, { status: newStatus });

        res.json({ success: true, message: `Job ${job.status}`, status: job.status });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * DELETE GOVT JOB
 */
const deleteGovJob = async (req, res) => {
    try {
        const job = await GovJob.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        await auditService.auditDelete(req, "GOV_JOBS", job._id, "GovJob", `Deleted gov job: ${job.jobTit}`, job);
        await job.deleteOne();

        res.json({ success: true, message: "Job deleted permanently" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllGovJobs,
    getGovJobById,
    createGovJob,
    updateGovJob,
    toggleGovJobStatus,
    deleteGovJob,
};
