const Webinar = require("../../models/Webinar");

/**
 * ===============================
 * GET ALL WEBINARS (ADMIN)
 * ===============================
 */
const getAllWebinars = async (req, res) => {
    try {
        const { status, category, isActive } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const webinars = await Webinar.find(filter)
            .populate("createdBy", "empname empemail role")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: webinars.length,
            data: webinars,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to load webinars" });
    }
};

/**
 * ===============================
 * GET SINGLE WEBINAR
 * ===============================
 */
const getWebinarById = async (req, res) => {
    try {
        const webinar = await Webinar.findById(req.params.id).populate(
            "createdBy",
            "empname empemail"
        );

        if (!webinar) {
            return res.status(404).json({ message: "Webinar not found" });
        }

        res.json({ success: true, data: webinar });
    } catch (err) {
        res.status(500).json({ message: "Failed to load webinar" });
    }
};

/**
 * ===============================
 * CREATE WEBINAR (ADMIN)
 * ===============================
 */
const createWebinar = async (req, res) => {
    try {
        const webinar = await Webinar.create({
            ...req.body,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Webinar created",
            data: webinar,
        });
    } catch (err) {
        res.status(400).json({ message: "Webinar creation failed" });
    }
};

/**
 * ===============================
 * UPDATE WEBINAR
 * ===============================
 */
const updateWebinar = async (req, res) => {
    try {
        const webinar = await Webinar.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!webinar) {
            return res.status(404).json({ message: "Webinar not found" });
        }

        res.json({
            success: true,
            message: "Webinar updated",
            data: webinar,
        });
    } catch (err) {
        res.status(400).json({ message: "Update failed" });
    }
};

/**
 * ===============================
 * CHANGE STATUS (Upcoming / Live / Completed)
 * ===============================
 */
const updateWebinarStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const webinar = await Webinar.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!webinar) {
            return res.status(404).json({ message: "Webinar not found" });
        }

        res.json({
            success: true,
            message: "Status updated",
            data: webinar,
        });
    } catch (err) {
        console.error("Status Error:", err);
        res.status(500).json({
            message: "Status update failed",
            error: err.message,
        });
    }
};

/**
 * ===============================
 * ACTIVATE / DEACTIVATE
 * ===============================
 */
const toggleWebinarActive = async (req, res) => {
    try {
        const webinar = await Webinar.findById(req.params.id);

        if (!webinar) {
            return res.status(404).json({ message: "Webinar not found" });
        }

        webinar.isActive = !webinar.isActive;
        await webinar.save();

        res.json({
            success: true,
            message: `Webinar ${webinar.isActive ? "activated" : "deactivated"}`,
            data: webinar,
        });
    } catch (err) {
        console.error("Toggle Error:", err);
        res.status(500).json({
            message: "Toggle failed",
            error: err.message,
        });
    }
};

/**
 * ===============================
 * DELETE WEBINAR
 * ===============================
 */
const deleteWebinar = async (req, res) => {
    try {
        const webinar = await Webinar.findByIdAndDelete(req.params.id);

        if (!webinar) {
            return res.status(404).json({ message: "Webinar not found" });
        }

        res.json({
            success: true,
            message: "Webinar deleted permanently",
        });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};

module.exports = {
    getAllWebinars,
    getWebinarById,
    createWebinar,
    updateWebinar,
    updateWebinarStatus,
    toggleWebinarActive,
    deleteWebinar,
};
