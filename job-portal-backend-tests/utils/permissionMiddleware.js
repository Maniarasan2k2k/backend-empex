/**
 * ===============================
 * RBAC PERMISSION MIDDLEWARE
 * ===============================
 * Usage in routes:
 *   const { allowPermissions } = require('../utils/permissionMiddleware');
 *   const { PERMISSIONS } = require('../constants/permissions');
 *   router.get('/users', adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_USERS), controller);
 *
 * Note: requires adminAuthMiddleware to run first so req.user is populated with role.
 */
const allowPermissions = (...requiredPermissions) => {
    return (req, res, next) => {
        try {
            const role = req.user.role; // already populated by adminAuthMiddleware

            if (!role || !role.isActive) {
                return res.status(403).json({ message: "Role not found or inactive" });
            }

            // SUPER ADMIN → full access (bypasses all permission checks)
            if (role.key === "SUPER_ADMIN") {
                return next();
            }

            const permissions = role.permissions
                .filter((p) => p.isActive)
                .map((p) => p.key);

            const allowed = requiredPermissions.every((perm) =>
                permissions.includes(perm)
            );

            if (!allowed) {
                return res.status(403).json({
                    message: "Permission denied",
                    required: requiredPermissions,
                });
            }

            next();
        } catch (err) {
            console.error("RBAC ERROR:", err);
            res.status(500).json({ message: "RBAC validation failed" });
        }
    };
};

module.exports = { allowPermissions };
