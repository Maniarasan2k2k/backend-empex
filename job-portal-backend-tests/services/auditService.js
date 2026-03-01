/**
 * ============================================
 * CENTRALIZED AUDIT LOGGING SERVICE
 * ============================================
 */

const AuditLog = require("../models/AuditLog");

/**
 * Extract client IP address from request
 */
function getClientIp(req) {
    if (!req) return "UNKNOWN";
    return (
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.headers["x-real-ip"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        "UNKNOWN"
    );
}

/**
 * Main audit logging function
 */
const logAudit = async ({
    req,
    action,
    module,
    targetId = null,
    targetType = null,
    description,
    oldData = null,
    newData = null,
    status = "SUCCESS",
    error = null,
}) => {
    try {
        // Extract user info from request context
        const userId = req?.user?._id;
        const userEmail = req?.user?.email || "UNKNOWN";
        const userName = req?.user?.name || req?.user?.email || "UNKNOWN";
        const userRole = req?.user?.role?.key || req?.user?.role || "UNKNOWN";

        // Extract request metadata
        const ipAddress = getClientIp(req);
        const userAgent = req?.headers ? req.headers["user-agent"] : "UNKNOWN";

        // Create audit log document
        const auditLog = await AuditLog.create({
            user: userId,
            performedBy: userId || null,
            userEmail,
            userName,
            userRole,
            action,
            module,
            entityId: targetId ? targetId.toString() : "N/A",
            entity: targetType || "N/A",
            details: description,
            oldData,
            newData,
            ipAddress,
            userAgent,
            status,
            error,
            timestamp: new Date(),
        });

        return auditLog;
    } catch (err) {
        console.error("❌ Audit Log Error (non-blocking):", err.message);
        return null;
    }
};

/**
 * Helpers
 */
const auditCreate = async (req, module, targetId, targetType, description, newData) => {
    return logAudit({ req, action: "CREATE", module, targetId, targetType, description, newData });
};

const auditUpdate = async (req, module, targetId, targetType, description, oldData, newData) => {
    return logAudit({ req, action: "UPDATE", module, targetId, targetType, description, oldData, newData });
};

const auditDelete = async (req, module, targetId, targetType, description, oldData) => {
    return logAudit({ req, action: "DELETE", module, targetId, targetType, description, oldData });
};

const auditError = async (req, module, action, targetType, description, errorMessage) => {
    return logAudit({
        req,
        action,
        module,
        targetType,
        description: `${description} - ERROR: ${errorMessage}`,
        status: "FAILED",
        error: errorMessage,
    });
};

module.exports = {
    logAudit,
    auditCreate,
    auditUpdate,
    auditDelete,
    auditError,
};
