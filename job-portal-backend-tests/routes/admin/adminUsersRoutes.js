const express = require("express");
const { getAdmins } = require("../../controllers/admin/adminController");
const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_ADMINS), getAdmins);

module.exports = router;
