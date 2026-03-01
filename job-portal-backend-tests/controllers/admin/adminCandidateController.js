const CandidateUser = require("../../models/CandidateUser");
const auditService = require("../../services/auditService");
const { sendNotification } = require("../../services/notificationService");
const mongoose = require("mongoose");
const CandidateProfile = require("../../models/Candidate/CandidateProfile");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET ALL CANDIDATES
 */
const getAllCandidates = async (req, res) => {
    try {
        const { search, verified, referredBy, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { canname: { $regex: search, $options: "i" } },
                { canemail: { $regex: search, $options: "i" } },
                { canphone: { $regex: search, $options: "i" } }
            ];
        }

        if (verified !== undefined) query.isVerified = verified === "true";
        if (referredBy) query.referredBy = referredBy;

        const candidates = await CandidateUser.find(query)
            .select("-passwordHash -otp -resetPasswordToken -resetPasswordExpire")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await CandidateUser.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            data: candidates
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch candidates" });
    }
};

/**
 * GET SINGLE CANDIDATE
 */
const getCandidateById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const candidate = await CandidateUser.findById(req.params.id)
            .select("-passwordHash -otp");

        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        res.json({ success: true, data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch candidate" });
    }
};

/**
 * EDIT / UPDATE CANDIDATE
 */
const updateCandidate = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const candidate = await CandidateUser.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        const oldData = JSON.parse(JSON.stringify(candidate));
        const allowedUpdates = ["canname", "canemail", "canphone", "isVerified", "referredBy"];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) candidate[field] = req.body[field];
        });

        const updated = await candidate.save();

        await auditService.auditUpdate(req, "CANDIDATES", candidate._id, "CandidateUser", `Updated candidate: ${candidate.canname}`, oldData, updated);

        res.json({ success: true, message: "Candidate updated", data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update candidate" });
    }
};

/**
 * VERIFY / BLOCK CANDIDATE
 */
const toggleCandidateVerification = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const candidate = await CandidateUser.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        if (candidate.isBlocked) {
            return res.status(400).json({ message: "Blocked candidate cannot be verified" });
        }

        const oldVerified = candidate.isVerified;
        candidate.isVerified = !candidate.isVerified;
        await candidate.save();

        const actionText = candidate.isVerified ? "Verified" : "Unverified";

        await auditService.auditUpdate(req, "CANDIDATES", candidate._id, "CandidateUser", `Verification toggled to ${candidate.isVerified}`, { isVerified: oldVerified }, { isVerified: candidate.isVerified });

        // Notify
        await sendNotification({
            recipient: candidate._id,
            recipientModel: 'CandidateUser',
            title: "Identity Verification Status",
            message: `Your identity verification status has been updated to: ${actionText}`,
            type: "system"
        });

        res.json({ success: true, message: `Candidate ${actionText} successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to toggle verification" });
    }
};

/**
 * DELETE CANDIDATE
 */
const deleteCandidate = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const candidate = await CandidateUser.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        await auditService.auditDelete(req, "CANDIDATES", candidate._id, "CandidateUser", `Deleted candidate: ${candidate.canname}`, candidate);

        await CandidateProfile.deleteOne({ candidateUserId: candidate._id });
        await candidate.deleteOne();

        res.json({ success: true, message: "Candidate and profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete candidate" });
    }
};

/**
 * BLOCK / UNBLOCK CANDIDATE
 */
const toggleCandidateBlockStatus = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const candidate = await CandidateUser.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        const oldBlocked = candidate.isBlocked;
        candidate.isBlocked = !candidate.isBlocked;

        if (candidate.isBlocked) candidate.isVerified = false;

        await candidate.save();

        const actionText = candidate.isBlocked ? "Blocked" : "Unblocked";

        await auditService.auditUpdate(req, "CANDIDATES", candidate._id, "CandidateUser", `Block status toggled to ${candidate.isBlocked}`, { isBlocked: oldBlocked }, { isBlocked: candidate.isBlocked });

        // Notify
        await sendNotification({
            recipient: candidate._id,
            recipientModel: 'CandidateUser',
            title: "Account Status Update",
            message: `Your account has been ${actionText.toLowerCase()} by the administrator.`,
            type: "system"
        });

        res.status(200).json({
            success: true,
            message: `Candidate ${actionText} successfully`,
            data: { id: candidate._id, isBlocked: candidate.isBlocked }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update block status" });
    }
};

/**
 * GET FRAUD FLAGGED USERS
 */
const getFraudFlaggedUsers = async (req, res) => {
    try {
        const users = await CandidateUser.find({ isFlagged: true })
            .select("-passwordHash -otp")
            .sort({ updatedAt: -1 });

        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch fraud users" });
    }
};

/**
 * FLAG / UNFLAG CANDIDATE (FRAUD)
 */
const toggleCandidateFlagStatus = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const candidate = await CandidateUser.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        candidate.isFlagged = !candidate.isFlagged;
        await candidate.save();

        const actionText = candidate.isFlagged ? "Flagged" : "Unflagged";

        await auditService.auditUpdate(req, "CANDIDATES", candidate._id, "CandidateUser", `Fraud flag toggled to ${candidate.isFlagged}`, { isFlagged: !candidate.isFlagged }, { isFlagged: candidate.isFlagged });

        res.json({ success: true, message: `Candidate ${actionText} successfully`, isFlagged: candidate.isFlagged });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update flag status" });
    }
};

module.exports = {
    getAllCandidates,
    getCandidateById,
    getFraudFlaggedUsers,
    updateCandidate,
    toggleCandidateVerification,
    deleteCandidate,
    toggleCandidateBlockStatus,
    toggleCandidateFlagStatus,
};
