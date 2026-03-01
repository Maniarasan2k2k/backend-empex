const Tutorial = require("../../models/Tutorial");
const AuditLog = require("../../models/AuditLog");

/**
 * 🔥 AUDIT LOGGER HELPER
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
            module: "TUTORIAL",
            userEmail: req.user.email,
            userRole: req.user.role?.key || "ADMIN",
            action,
            status,
            entity: "TUTORIAL",
            entityId: entityId?.toString() || "N/A",
            details: details || "",
            timestamp: new Date(),
        });
    } catch (err) {
        console.error("AUDIT LOG ERROR:", err.message);
    }
};

/**
 * GET ALL TUTORIALS
 */
const getAllTutorials = async (req, res) => {
    try {
        const tutorials = await Tutorial.find().sort({ createdAt: -1 });

        await createAuditEntry({
            req,
            action: "FETCH_ALL_TUTORIALS",
            entityId: "ALL",
            details: "Fetched all tutorials",
        });

        res.json({ success: true, count: tutorials.length, data: tutorials });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch tutorials" });
    }
};

/**
 * GET SINGLE
 */
const getTutorialById = async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id);

        if (!tutorial) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        res.json({ success: true, data: tutorial });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch tutorial" });
    }
};

/**
 * CREATE
 */
const createTutorial = async (req, res) => {
    try {
        const tutorial = new Tutorial(req.body);
        await tutorial.save();

        await createAuditEntry({
            req,
            action: "CREATE_TUTORIAL",
            entityId: tutorial._id,
            details: `Created tutorial ${tutorial.title}`,
        });

        res.status(201).json({ success: true, data: tutorial });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to create tutorial" });
    }
};

/**
 * UPDATE
 */
const updateTutorial = async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id);

        if (!tutorial) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        const oldTitle = tutorial.title;

        Object.assign(tutorial, req.body);
        await tutorial.save();

        await createAuditEntry({
            req,
            action: "UPDATE_TUTORIAL",
            entityId: tutorial._id,
            details: `Updated tutorial from "${oldTitle}"`,
        });

        res.json({ success: true, data: tutorial });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update tutorial" });
    }
};

/**
 * TOGGLE ACTIVE
 */
const toggleTutorialStatus = async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id);

        if (!tutorial) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        tutorial.isActive = !tutorial.isActive;
        await tutorial.save();

        res.json({ success: true, data: tutorial });
    } catch (err) {
        res.status(500).json({ success: false, message: "Toggle failed" });
    }
};

/**
 * UPDATE STATUS
 */
const updateTutorialStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const tutorial = await Tutorial.findById(req.params.id);

        if (!tutorial) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        tutorial.status = status;
        await tutorial.save();

        res.json({ success: true, data: tutorial });
    } catch (err) {
        res.status(500).json({ success: false, message: "Status update failed" });
    }
};

/**
 * DELETE
 */
const deleteTutorial = async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id);

        if (!tutorial) {
            return res.status(404).json({ message: "Tutorial not found" });
        }

        await tutorial.deleteOne();

        await createAuditEntry({
            req,
            action: "DELETE_TUTORIAL",
            entityId: tutorial._id,
            details: `Deleted tutorial ${tutorial.title}`,
        });

        res.json({ success: true, message: "Tutorial deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllTutorials,
    getTutorialById,
    createTutorial,
    updateTutorial,
    toggleTutorialStatus,
    updateTutorialStatus,
    deleteTutorial,
};
