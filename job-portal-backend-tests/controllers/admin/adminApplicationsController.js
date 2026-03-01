const Application = require("../../models/Application");
const Job = require("../../models/Employee/Job");
const CandidateUser = require("../../models/CandidateUser");
const auditService = require("../../services/auditService");
const { sendNotification } = require("../../services/notificationService");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * ===============================
 * GET ALL APPLICATIONS (ADMIN)
 * ===============================
 */
const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate("candidateId", "canname canemail canphone profilePicture")
            .populate({
                path: "jobId",
                select: "jobTit",
                populate: { path: "cmpProfile", select: "cmpcomNam" },
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            data: applications,
        });
    } catch (err) {
        console.error("Fetch all apps error:", err);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
};

/**
 * ===============================
 * GET SINGLE APPLICATION
 * ===============================
 */
const getApplicationById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const app = await Application.findById(req.params.id)
            .populate("candidateId")
            .populate("jobId");

        if (!app) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json({ success: true, data: app });
    } catch (err) {
        res.status(500).json({ message: "Error fetching application" });
    }
};

/**
 * ===============================
 * UPDATE APPLICATION (PARTIAL)
 * ===============================
 */
const updateApplication = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        const oldData = JSON.parse(JSON.stringify(app));
        Object.assign(app, req.body);
        const updated = await app.save();

        await auditService.auditUpdate(req, "APPLICATIONS", app._id, "Application", `Updated application for job: ${app.jobId}`, oldData, updated);

        res.json({ success: true, message: "Application updated", data: updated });
    } catch (err) {
        res.status(500).json({ message: "Failed to update application" });
    }
};

/**
 * ===============================
 * UPDATE APPLICATION STATUS
 * ===============================
 */
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        const oldStatus = app.status;
        app.status = status;
        await app.save();

        await auditService.auditUpdate(req, "APPLICATIONS", app._id, "Application", `Status changed: ${oldStatus} -> ${status}`, { status: oldStatus }, { status });

        // Notify candidate
        await sendNotification({
            recipient: app.candidateId,
            recipientModel: 'CandidateUser',
            title: "Application Status Updated",
            message: `Your application status for job ID ${app.jobId} has been updated to ${status}`,
            type: "system",
            relatedId: app._id
        });

        res.json({ success: true, message: "Application status updated", data: app });
    } catch (err) {
        res.status(500).json({ message: "Failed to update status" });
    }
};

/**
 * ===============================
 * SCHEDULE INTERVIEW
 * ===============================
 */
const scheduleInterview = async (req, res) => {
    try {
        const {
            interviewDate,
            interviewTime,
            interviewMode,
            interviewLink,
            interviewNotes,
            candidateInstructions,
        } = req.body;

        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        const oldData = { status: app.status, interviewDate: app.interviewDate };

        app.status = "Interview Scheduled";
        app.interviewDate = interviewDate;
        app.interviewTime = interviewTime;
        app.interviewMode = interviewMode;
        app.interviewLink = interviewLink;
        app.interviewNotes = interviewNotes;
        app.candidateInstructions = candidateInstructions;

        await app.save();

        await auditService.auditUpdate(req, "APPLICATIONS", app._id, "Application", "Interview scheduled", oldData, { status: app.status, interviewDate });

        // Notify
        await sendNotification({
            recipient: app.candidateId,
            recipientModel: 'CandidateUser',
            title: "Interview Scheduled",
            message: `An interview has been scheduled for your application. Mode: ${interviewMode}, Date: ${interviewDate}`,
            type: "interview_scheduled",
            relatedId: app._id
        });

        res.json({ success: true, message: "Interview scheduled successfully", data: app });
    } catch (err) {
        res.status(500).json({ message: "Interview scheduling failed" });
    }
};

/**
 * ===============================
 * DELETE APPLICATION (ADMIN)
 * ===============================
 */
const deleteApplication = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        await auditService.auditDelete(req, "APPLICATIONS", app._id, "Application", `Deleted application from candidate ${app.candidateId}`, app);
        await app.deleteOne();

        res.json({ success: true, message: "Application deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};

module.exports = {
    getAllApplications,
    getApplicationById,
    updateApplication,
    updateApplicationStatus,
    scheduleInterview,
    deleteApplication,
};
