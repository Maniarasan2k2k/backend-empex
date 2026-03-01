const CandidateProfile = require("../../models/Candidate/CandidateProfile");
const CandidateUser = require("../../models/CandidateUser");
const AuditLog = require("../../models/AuditLog");
const mongoose = require("mongoose");

/**
 * HELPER → CREATE AUDIT LOG
 */
const createAuditLog = async ({
    userId,
    module,
    action,
    status = "SUCCESS",
    description = "",
    refLink = null,
    beforeData = null,
    afterData = null,
    ip,
    device
}) => {
    try {
        await AuditLog.create({
            user: userId ? new mongoose.Types.ObjectId(userId) : null,
            performedBy: userId ? new mongoose.Types.ObjectId(userId) : null,
            module,
            action,
            status,
            description,
            userEmail: "admin@vnm.com",
            userRole: "ADMIN",
            entity: module,
            entityId: "SYSTEM",
            timestamp: new Date()
        });
    } catch (err) {
        console.error("Audit Log Error:", err.message);
    }
};

/**
 * GET ALL CANDIDATE PROFILES
 */
const getAllCandidateProfiles = async (req, res) => {
    try {
        const { search, jobSearchStatus, skill, location } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { "personal.canname": { $regex: search, $options: "i" } },
                { "personal.canemail": { $regex: search, $options: "i" } },
            ];
        }

        if (jobSearchStatus) filter["personal.jobSearchStatus"] = jobSearchStatus;

        if (skill) {
            filter.skills = { $elemMatch: { canskicou: { $regex: skill, $options: "i" } } };
        }

        if (location) filter["personal.canstate"] = { $regex: location, $options: "i" };

        const profiles = await CandidateProfile.find(filter)
            .populate("candidateUserId", "canemail canphone isVerified")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: profiles.length, data: profiles });
    } catch (error) {
        console.error("Fetch profile error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch candidate profiles" });
    }
};

/**
 * GET SINGLE CANDIDATE PROFILE
 */
const getCandidateProfileById = async (req, res) => {
    try {
        const profile = await CandidateProfile.findById(req.params.id)
            .populate("candidateUserId", "canemail canphone isVerified");

        if (!profile) {
            return res.status(404).json({ message: "Candidate profile not found" });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};

/**
 * TOGGLE PROFILE VISIBILITY
 */
const toggleProfileVisibility = async (req, res) => {
    try {
        const profile = await CandidateProfile.findById(req.params.id);

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        profile.personal.profileVisibility = !profile.personal.profileVisibility;
        await profile.save();

        res.json({
            success: true,
            message: "Profile visibility updated",
            visibility: profile.personal.profileVisibility
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update visibility" });
    }
};

/**
 * EDIT / UPDATE PROFILE
 */
const updateCandidateProfile = async (req, res) => {
    try {
        const profile = await CandidateProfile.findById(req.params.id);

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        // Allow updates (example: personal info + skills)
        const allowedFields = ["personal", "skills", "experience", "education"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) profile[field] = req.body[field];
        });

        await profile.save();

        res.json({ success: true, message: "Profile updated", data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

/**
 * DELETE PROFILE
 */
const deleteCandidateProfile = async (req, res) => {
    try {
        const profile = await CandidateProfile.findById(req.params.id);

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        await profile.deleteOne();

        res.json({ success: true, message: "Candidate profile deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

module.exports = {
    getAllCandidateProfiles,
    getCandidateProfileById,
    toggleProfileVisibility,
    updateCandidateProfile,
    deleteCandidateProfile,
};
