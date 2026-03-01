const express = require("express");
const {
    getAllMeetings,
    getMeetingById,
    updateMeetingStatus,
    deleteMeeting,
    toggleMeetingBlock
} = require("../../controllers/admin/adminMeetingsController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.MEETING_VIEW), getAllMeetings);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MEETING_VIEW), getMeetingById);
router.put("/:id/status", adminAuthMiddleware, allowPermissions(PERMISSIONS.MEETING_MANAGE), updateMeetingStatus);
router.patch("/:id/toggle-block", adminAuthMiddleware, allowPermissions(PERMISSIONS.MEETING_MANAGE), toggleMeetingBlock);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MEETING_DELETE), deleteMeeting);

module.exports = router;
