/**
 * ===============================
 * ROLES (System Level)
 * ===============================
 * Used for RBAC in admin panel
 */
const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",         // Full system access
    ADMIN: "ADMIN",                     // Platform admin
    HR_ADMIN: "HR_ADMIN",               // Company & job management
    FINANCIAL_ADMIN: "FINANCIAL_ADMIN", // Billing & revenue
    SUPPORT_ADMIN: "SUPPORT_ADMIN",     // Support team
    MODERATOR: "MODERATOR",             // Content moderation
    AI_ADMIN: "AI_ADMIN",               // AI features management
    USER: "USER",                       // Normal user (lowest level)
};

module.exports = { ROLES };
