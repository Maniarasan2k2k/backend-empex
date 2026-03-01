const express = require('express');
const router = express.Router();
const mobileController = require('../controllers/mobileController');

// 🟢 FIX: Change path from '../middleware/...' to '../utils/...'
const { protect } = require('../utils/authMiddleware');

router.get('/profile', protect, mobileController.getMobileProfile);
router.get('/interviews', protect, mobileController.getMobileInterviews);

module.exports = router;