const express = require("express");
const {
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee
} = require("../../controllers/admin/adminEmployeeController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_USERS), getAllEmployees);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_USERS), getEmployeeById);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.EDIT_USERS), updateEmployee);
router.patch("/:id/status", adminAuthMiddleware, allowPermissions(PERMISSIONS.BLOCK_USERS), toggleEmployeeStatus);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.BLOCK_USERS), deleteEmployee);

module.exports = router;
