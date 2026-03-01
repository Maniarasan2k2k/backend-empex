const express = require('express');
const router = express.Router();
const { protect } = require('../utils/authMiddleware');
const { getAllWebinars, createWebinar, enrollWebinar, getMyWebinars } = require('../controllers/webinarController');

// Public: View all
router.get('/', getAllWebinars);

// Protected: Candidate Actions
router.post('/enroll', protect, enrollWebinar);
router.get('/my-webinars', protect, getMyWebinars);

// Admin: Create (Ideally protect this with admin middleware later)
router.post('/create', createWebinar);

module.exports = router;