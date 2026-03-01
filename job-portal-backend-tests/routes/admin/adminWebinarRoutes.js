const express = require("express");
const {
    getAllWebinars,
    getWebinarById,
    createWebinar,
    updateWebinar,
    updateWebinarStatus,
    toggleWebinarActive,
    deleteWebinar
} = require("../../controllers/admin/adminWebinarController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.WEBINAR_VIEW), getAllWebinars);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.WEBINAR_VIEW), getWebinarById);
router.post("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.WEBINAR_CREATE), createWebinar);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.WEBINAR_EDIT), updateWebinar);
router.patch("/:id/status", adminAuthMiddleware, allowPermissions(PERMISSIONS.WEBINAR_EDIT), updateWebinarStatus);
router.patch("/:id/toggle", adminAuthMiddleware, allowPermissions(PERMISSIONS.WEBINAR_EDIT), toggleWebinarActive);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.WEBINAR_DELETE), deleteWebinar);

module.exports = router;
