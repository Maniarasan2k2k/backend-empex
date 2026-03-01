const express = require("express");
const {
    getAllJobs,
    getJobById,
    getJobStats,
    createJob,
    updateJob,
    toggleJobVisibility,
    toggleJobStatus,
    updateJobStatus,
    deleteJob
} = require("../../controllers/admin/adminJobsController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_JOBS), getAllJobs);
router.get("/stats", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_JOBS), getJobStats);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_JOBS), getJobById);
router.post("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_JOBS), createJob);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_JOBS), updateJob);
router.patch("/:id/hide", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_JOBS), toggleJobVisibility);
router.patch("/:id/toggle", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_JOBS), toggleJobStatus);
router.put("/:id/status", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_JOBS), updateJobStatus);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.JOB_DELETE), deleteJob);

module.exports = router;
