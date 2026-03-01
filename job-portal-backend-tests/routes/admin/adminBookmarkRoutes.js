const express = require("express");
const { getAllBookmarksAdmin } = require("../../controllers/admin/adminBookmarkController");
const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_CANDIDATE_PROFILES), getAllBookmarksAdmin);

module.exports = router;
