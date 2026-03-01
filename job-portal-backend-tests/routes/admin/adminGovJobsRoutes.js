const express = require("express");
const {
    getAllGovJobs,
    getGovJobById,
    createGovJob,
    updateGovJob,
    toggleGovJobStatus,
    deleteGovJob
} = require("../../controllers/admin/adminGovJobsController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_JOBS), getAllGovJobs);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_JOBS), getGovJobById);
router.post("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_JOBS), createGovJob);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_JOBS), updateGovJob);
router.patch("/:id/toggle", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_JOBS), toggleGovJobStatus);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.JOB_DELETE), deleteGovJob);

module.exports = router;
