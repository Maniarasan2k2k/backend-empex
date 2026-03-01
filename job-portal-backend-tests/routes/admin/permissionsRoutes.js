const express = require("express");
const { createPermission, getPermissions } = require("../../controllers/admin/permissionController");
const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ROLES), getPermissions);
router.post("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ROLES), createPermission);

module.exports = router;
