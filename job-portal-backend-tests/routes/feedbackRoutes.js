const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect } = require('../utils/authMiddleware');

// POST /api/feedback/submit
// Protected so we know which candidate is sending the feedback
router.post('/submit', protect, submitFeedback);

// GET /api/feedback/all
// Optional: For admin panel use later
router.get('/all', protect, getAllFeedback);

module.exports = router;