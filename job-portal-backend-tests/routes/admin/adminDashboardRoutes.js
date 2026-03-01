const express = require("express");
const { fetchDashboard, getCandidateDashboardAnalytics } = require("../../controllers/admin/adminDashboardController");
const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

// Main Dashboard
router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_REPORTS), fetchDashboard);

// Candidate Specific Analytics
router.get("/candidate-analytics", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_REPORTS), getCandidateDashboardAnalytics);

module.exports = router;
