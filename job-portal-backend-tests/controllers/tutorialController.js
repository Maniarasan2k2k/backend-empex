const Tutorial = require("../models/Tutorial");

// GET ALL TUTORIALS (Search/List Page)
exports.getAllTutorials = async (req, res) => {
    try {
        const tutorials = await Tutorial.find().sort({ createdAt: 1 });
        res.status(200).json({ success: true, tutorials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET SINGLE TUTORIAL (Detail Page)
exports.getTutorialById = async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id);
        if (!tutorial) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, tutorial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};