const AuditLog = require("../models/AuditLog");

/**
 * ===============================
 * AUDIT LOG MIDDLEWARE
 * ===============================
 * Usage in routes:
 *   const { logAudit } = require('../utils/auditLogMiddleware');
 *   router.delete('/jobs/:id', adminAuthMiddleware, logAudit('JOB', 'DELETE'), controller);
 *
 * Note: requires adminAuthMiddleware to run first (for req.user).
 * Note: entity and entityId must be set by the controller:
 *   req.auditEntity = 'JOB'; req.auditEntityId = job._id.toString();
 */
const logAudit = (module, action) => {
    return async (req, res, next) => {
        const originalSend = res.send.bind(res);

        res.send = async (body) => {
            try {
                const statusCode = res.statusCode;
                const status = statusCode >= 200 && statusCode < 300 ? "SUCCESS" : "FAILED";

                const log = new AuditLog({
                    user: req.user?._id || null,
                    performedBy: req.user?._id || null,
                    module,
                    action,
                    status,
                    userEmail: req.user?.email || "unknown",
                    userRole: req.user?.role?.key || "unknown",
                    entity: req.auditEntity || module,
                    entityId: req.auditEntityId || req.params?.id || "unknown",
                    details:
                        typeof body === "string"
                            ? body
                            : body?.message || JSON.stringify(body || {}),
                });

                await log.save();
            } catch (err) {
                console.error("Audit Log Save Error:", err.message);
            }

            originalSend(body);
        };

        next();
    };
};

module.exports = { logAudit };
