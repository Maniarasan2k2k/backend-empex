const express = require('express');
const router = express.Router();
const { 
    applyForJob, 
    getMyApplications, 
    toggleBookmark, 
    getBookmarkedJobs,
    getBookmarkedJobIds,
    checkJobStatus,          
    getAllUserInteractions   
} = require('../controllers/applicationController');

const { protect } = require('../utils/authMiddleware'); 

// ==========================================
// 1. CANDIDATE JOB ACTIONS
// ==========================================

// 🟢 POST /api/application/apply
// Action: Candidate applies for a specific job
router.post('/apply', protect, applyForJob);

// 🟢 GET /api/application/my-applications
// Action: Candidate views their own application history
router.get('/my-applications', protect, getMyApplications);

// ==========================================
// 2. BOOKMARK / SAVED JOBS
// ==========================================

// 🟢 POST /api/application/bookmark
// Action: Toggle (save/unsave) a job for the candidate
router.post('/bookmark', protect, toggleBookmark);

// 🟢 GET /api/application/bookmarked-jobs
// Action: Get full details of all jobs saved by the candidate
router.get('/bookmarked-jobs', protect, getBookmarkedJobs);

// 🟢 GET /api/application/bookmarked-ids
// Action: Get just the IDs of saved jobs (useful for UI icon status)
router.get('/bookmarked-ids', protect, getBookmarkedJobIds);

// ==========================================
// 3. UI UTILITIES (For Job Details & Home Page)
// ==========================================

// 🟢 GET /api/application/check-status/:jobId
// Action: Check if the current candidate has already applied or bookmarked a specific job
router.get('/check-status/:jobId', protect, checkJobStatus);

// 🟢 GET /api/application/interactions
// Action: Fetch all job IDs the candidate has interacted with (applied or saved)
router.get('/interactions', protect, getAllUserInteractions);

module.exports = router;