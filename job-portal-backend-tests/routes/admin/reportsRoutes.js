const express = require("express");
const {
    getDashboardSummary,
    getApplicationReport,
    getJobPerformance,
    getCompanyPerformance
} = require("../../controllers/admin/reportsController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/summary", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_REPORTS), getDashboardSummary);
router.get("/applications", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_REPORTS), getApplicationReport);
router.get("/jobs", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_REPORTS), getJobPerformance);
router.get("/companies", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_REPORTS), getCompanyPerformance);

module.exports = router;
