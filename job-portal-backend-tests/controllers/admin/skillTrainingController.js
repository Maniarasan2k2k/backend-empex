const SkillTraining = require("../../models/SkillTraining");
const AuditLog = require("../../models/AuditLog");

/**
 * 🔥 COMMON AUDIT LOGGER
 */
const createAuditEntry = async ({
    req,
    action,
    entityId,
    details,
    status = "SUCCESS",
}) => {
    try {
        await AuditLog.create({
            user: req.user._id,
            performedBy: req.user._id,
            module: "SKILL_TRAINING",
            userEmail: req.user.email,
            userRole: req.user.role?.key || "ADMIN",
            action,
            status,
            entity: "SKILL_TRAINING",
            entityId: entityId?.toString() || "N/A",
            details: details || "",
            timestamp: new Date(),
        });
    } catch (err) {
        console.error("AUDIT LOG ERROR:", err.message);
    }
};

/* ================= CREATE ================= */
const createSkillTraining = async (req, res) => {
    try {
        const training = await SkillTraining.create({
            ...req.body,
            createdBy: req.user._id,
        });

        await createAuditEntry({
            req,
            action: "CREATE_SKILL_TRAINING",
            entityId: training._id,
            details: `Created training: ${training.title || training._id}`,
        });

        res.status(201).json({
            success: true,
            message: "Skill training created",
            data: training,
        });
    } catch (err) {
        await createAuditEntry({
            req,
            action: "CREATE_SKILL_TRAINING",
            entityId: "NEW",
            status: "FAILED",
            details: err.message,
        });

        res.status(500).json({ message: err.message });
    }
};

/* ================= ADMIN LIST ================= */
const getAllSkillTrainingsAdmin = async (req, res) => {
    try {
        const trainings = await SkillTraining.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email");

        await createAuditEntry({
            req,
            action: "FETCH_ALL_SKILL_TRAININGS",
            entityId: "ALL",
            details: "Admin fetched all skill trainings",
        });

        res.json({ success: true, data: trainings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= UPDATE ================= */
const updateSkillTraining = async (req, res) => {
    try {
        const training = await SkillTraining.findById(req.params.id);

        if (!training) {
            return res.status(404).json({ message: "Training not found" });
        }

        Object.assign(training, req.body);
        await training.save();

        await createAuditEntry({
            req,
            action: "UPDATE_SKILL_TRAINING",
            entityId: training._id,
            details: `Updated training ${training.title || training._id}`,
        });

        res.json({
            success: true,
            message: "Updated successfully",
            data: training,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= PUBLISH ================= */
const publishSkillTraining = async (req, res) => {
    try {
        const training = await SkillTraining.findById(req.params.id);

        if (!training) {
            return res.status(404).json({ message: "Training not found" });
        }

        training.status = "PUBLISHED";
        await training.save();

        await createAuditEntry({
            req,
            action: "PUBLISH_SKILL_TRAINING",
            entityId: training._id,
            details: `Published training ${training.title || training._id}`,
        });

        res.json({
            success: true,
            message: "Published successfully",
            data: training,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= DELETE ================= */
const deleteSkillTraining = async (req, res) => {
    try {
        const training = await SkillTraining.findById(req.params.id);

        if (!training) {
            return res.status(404).json({ message: "Training not found" });
        }

        await training.deleteOne();

        await createAuditEntry({
            req,
            action: "DELETE_SKILL_TRAINING",
            entityId: training._id,
            details: `Deleted training ${training.title || training._id}`,
        });

        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createSkillTraining,
    getAllSkillTrainingsAdmin,
    updateSkillTraining,
    publishSkillTraining,
    deleteSkillTraining,
};
