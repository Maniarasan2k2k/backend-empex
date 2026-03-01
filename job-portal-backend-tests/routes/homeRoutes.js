const express = require("express");
const router = express.Router();
const { getHomeStats, getAnnouncements } = require("../controllers/homeController");

// The route will be /api/home/stats
router.get("/stats", getHomeStats);
router.get("/announcements", getAnnouncements);

module.exports = router;