const express = require('express');
const router = express.Router();
const { 
    getMyNotifications, 
    markAsRead, 
    sendInvite 
} = require('../controllers/notificationController');
const { protect } = require('../utils/authMiddleware'); 

// ==========================================
// 1. FETCH NOTIFICATIONS
// ==========================================
// 🟢 Unified GET: Works for both Candidate and Employer
// Logic: Uses req.user.id from the token to find relevant notifications
router.get('/', protect, getMyNotifications);

// ==========================================
// 2. ACTIONS
// ==========================================
// 🟢 PUT: Mark a specific notification as read
router.put('/:id/read', protect, markAsRead);

// 🟢 POST: Employer sends an invitation to a candidate
// This triggers the socket ping and creates the DB record
router.post('/send-invite', protect, sendInvite);

module.exports = router;