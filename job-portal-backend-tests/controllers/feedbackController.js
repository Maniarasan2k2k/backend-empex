const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
    try {
        const { title, message } = req.body;
        const userId = req.user.id;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            });
        }

        const newFeedback = new Feedback({
            userId,
            title,
            message
        });

        await newFeedback.save();

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully. Thank you!"
        });

    } catch (error) {
        console.error("Feedback Submission Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
            error: error.message
        });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        // This would be for an admin panel later
        const feedbacks = await Feedback.find().populate('userId', 'name email');
        res.json({ success: true, data: feedbacks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};