const express = require("express");
const {
    getAuditLogs,
    getAuditLogDetail,
    getAuditStats,
    getSecurityLogs
} = require("../../controllers/admin/adminAuditController");
const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_AUDIT_LOGS), getAuditLogs);
router.get("/security", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_AUDIT_LOGS), getSecurityLogs);
router.get("/stats", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_AUDIT_LOGS), getAuditStats);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_AUDIT_LOGS), getAuditLogDetail);

module.exports = router;
