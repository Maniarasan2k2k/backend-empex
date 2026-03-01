const express = require("express");
const {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole,
    assignPermissions
} = require("../../controllers/admin/roleController");
const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ROLES), getRoles);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ROLES), getRoleById);
router.post("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ROLES), createRole);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ROLES), updateRole);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ROLES), deleteRole);
router.put("/:roleId/permissions", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_ROLES), assignPermissions);

module.exports = router;
