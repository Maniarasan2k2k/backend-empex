const express = require("express");
const SkillTraining = require("../models/SkillTraining");

const router = express.Router();

// GET all published skill trainings
router.get("/", async (req, res) => {
    try {
        const trainings = await SkillTraining.find({
            status: "PUBLISHED",
        }).sort({ date: 1 });

        res.json({ success: true, data: trainings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single skill training
router.get("/:id", async (req, res) => {
    try {
        const training = await SkillTraining.findById(req.params.id);
        if (!training) return res.status(404).json({ message: "Training not found" });
        res.json({ success: true, data: training });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
