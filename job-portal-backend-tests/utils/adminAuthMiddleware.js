const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

/**
 * ===============================
 * ADMIN AUTH MIDDLEWARE
 * ===============================
 * Verifies JWT and loads the admin user with role + permissions populated.
 * Only works for AdminUser model (admin panel users).
 */
const adminAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await AdminUser.findById(decoded.id)
            .select("-password")
            .populate({
                path: "role",
                populate: { path: "permissions" },
            });

        if (!user) {
            return res.status(401).json({ message: "Admin user not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Admin account is disabled" });
        }

        req.user = user;

        console.log("ADMIN AUTH OK:", user.email, user.role?.key);

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = { adminAuthMiddleware };
