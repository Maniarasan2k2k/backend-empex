const SecurityLog = require("../models/SecurityLog");

const detectDevice = (userAgent = "") => {
    if (/mobile/i.test(userAgent)) return "Mobile";
    return "Desktop";
};

const logSecurityEvent = async ({
    req = null,
    user = null,
    email = null,
    action,
    status,
    metadata = {},
}) => {
    try {
        if (!action || !status) {
            console.error("SecurityLog Missing action/status");
            return;
        }

        const userAgent = req?.headers?.["user-agent"] || "UNKNOWN";

        await SecurityLog.create({
            userId: user?._id || null,
            email: email || user?.email || null,
            role: user?.userRole || (user?.role?.key ? user.role.key : (typeof user?.role === 'string' ? user.role : null)),
            action,
            status,
            ipAddress:
                req?.ip ||
                req?.headers?.["x-forwarded-for"] ||
                "UNKNOWN",
            userAgent,
            device: detectDevice(userAgent),
            metadata,
        });

    } catch (err) {
        console.error("Security Log Error:", err);
    }
};

module.exports = { logSecurityEvent };
