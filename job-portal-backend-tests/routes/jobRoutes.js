const express = require("express");
const router = express.Router();
const { protect } = require('../utils/authMiddleware');
// 🟢 NEW: Import the centralized filter constants
const { JOB_FILTERS } = require('../utils/filterConstants');

// 1. Import Job Controllers
const {
    postJob,
    getAllJobs,
    getJobById,
    getMyJobs,
    getJobsByDistrict,
    extendJobDeadline,
    createGovJob,
    getCentralJobs,
    getGovernmentJobs,
    getJobFilters
} = require("../controllers/jobController");

// 2. 🟢 Import Recommendation Controller
let getRecommendedJobs, saveJobPreferences, getJobPreferences;
try {
    const recController = require('../controllers/recommendationController');
    getRecommendedJobs = recController.getRecommendedJobs;
    saveJobPreferences = recController.saveJobPreferences;
    getJobPreferences = recController.getJobPreferences;
    console.log('[jobRoutes] Successfully loaded recommendation functions');
} catch (error) {
    console.error('[jobRoutes] Error loading recommendationController:', error.message);
    getRecommendedJobs = (req, res) => res.status(500).json({ error: 'Recommendation service unavailable' });
    saveJobPreferences = (req, res) => res.status(500).json({ error: 'Preferences service unavailable' });
    getJobPreferences = (req, res) => res.status(500).json({ error: 'Preferences service unavailable' });
}

// ==============================
// 🌍 PUBLIC ROUTES
// ==============================

// 🟢 NEW: Get Centralized Filters for Web and APK
// This allows both frontends to stay synced with backend enums
router.get("/filters", (req, res) => {
    res.json({
        success: true,
        data: JOB_FILTERS
    });
});
router.get("/filters", getJobFilters);
router.get("/central", getCentralJobs);
router.get("/government", getGovernmentJobs);
router.get("/all", getAllJobs);
router.get("/district/:district", getJobsByDistrict);

// Quick Home Page API for Android Team (Keep this above dynamic routes)
router.get('/home-stats', async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            stats: {
                activeJobs: 26160,  // Fake number for now
                companies: 612      // Fake number for now
            },
            categories: ["IT", "BPO", "Banking", "Engineering"],
            recentJobs: [] // Send empty list for now
        }
    });
});

// ==============================
// 🔒 PROTECTED ROUTES
// ==============================

// 🟢 NEW: Recommended Jobs (Must be BEFORE /:id)
if (getRecommendedJobs) {
    router.get('/recommended', protect, getRecommendedJobs);
}

router.post("/create", protect, postJob);
router.post("/gov/create", protect, createGovJob);
router.get("/my-jobs", protect, getMyJobs);
router.patch("/:id/extend", protect, extendJobDeadline);

// ==============================
// 🆔 WILDCARD ROUTE (ALWAYS LAST)
// ==============================
router.get("/:id", getJobById);

module.exports = router;