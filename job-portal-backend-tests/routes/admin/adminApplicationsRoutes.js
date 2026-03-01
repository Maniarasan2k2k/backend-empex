const express = require("express");
const {
    getAllApplications,
    getApplicationById,
    updateApplication,
    updateApplicationStatus,
    scheduleInterview,
    deleteApplication
} = require("../../controllers/admin/adminApplicationsController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_APPLICATIONS), getAllApplications);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_APPLICATIONS), getApplicationById);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_APPLICATIONS), updateApplication);
router.put("/:id/status", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_APPLICATIONS), updateApplicationStatus);
router.post("/:id/schedule-interview", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ATS), scheduleInterview);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ATS), deleteApplication);

module.exports = router;
