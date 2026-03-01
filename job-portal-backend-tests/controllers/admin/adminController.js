const AdminUser = require("../../models/AdminUser");
const Role = require("../../models/Role");

/**
 * GET ALL ADMINS (SUPER_ADMIN or ADMIN only)
 */
const getAdmins = async (req, res) => {
    try {
        // RBAC check: only SUPER_ADMIN and ADMIN can view other admins
        if (!["SUPER_ADMIN", "ADMIN"].includes(req.user.role?.key)) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Define all admin-type roles
        const ADMIN_ROLE_KEYS = [
            "SUPER_ADMIN",
            "ADMIN",
            "HR_ADMIN",
            "RECRUITER",
            "FINANCIAL_ADMIN",
            "SUPPORT_ADMIN",
            "MODERATOR",
            "AI_ADMIN",
        ];

        // Fetch roles
        const adminRoles = await Role.find({
            key: { $in: ADMIN_ROLE_KEYS },
            isActive: true,
        });

        if (!adminRoles || adminRoles.length === 0) {
            return res.status(404).json({ message: "No admin roles found" });
        }

        const roleIds = adminRoles.map((role) => role._id);

        // Fetch users
        const admins = await AdminUser.find({ role: { $in: roleIds } })
            .populate("role")
            .select("-password -__v");

        res.status(200).json({
            success: true,
            count: admins.length,
            data: admins,
        });
    } catch (error) {
        console.error("GET ADMINS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch admins", error: error.message });
    }
};

module.exports = {
    getAdmins,
};
