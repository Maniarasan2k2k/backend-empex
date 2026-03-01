const express = require('express');
const router = express.Router();
const { protect } = require('../utils/authMiddleware'); 

// 🟢 IMPORT THE FILE YOU JUST CREATED
const { 
    createMeeting, 
    getMyMeetings, 
    getAllMeetings, 
    deleteMeeting 
} = require('../controllers/meetingController');

// Routes
router.post('/create', protect, createMeeting);
router.get('/my-meetings', protect, getMyMeetings);
router.get('/all', getAllMeetings);
router.delete('/:id', protect, deleteMeeting);

module.exports = router;