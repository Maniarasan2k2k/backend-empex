const mongoose = require("mongoose");

const securityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdminUser",
            required: false,
        },
        email: { type: String },
        role: { type: String },
        action: {
            type: String,
            required: true,
            enum: [
                "LOGIN_SUCCESS",
                "LOGIN_FAILED",
                "LOGOUT",
                "OTP_SENT",
                "OTP_VERIFIED",
                "OTP_FAILED",
                "PASSWORD_CHANGED",
                "ROLE_UPDATED",
                "PERMISSION_UPDATED",
                "ADMIN_CREATED",
                "ADMIN_DELETED",
                "UNAUTHORIZED_ACCESS",
            ],
        },
        status: {
            type: String,
            required: true,
            enum: ["SUCCESS", "FAILED"],
        },
        ipAddress: { type: String, required: true },
        userAgent: { type: String },
        device: { type: String }, // Mobile / Desktop
        browser: { type: String },
        os: { type: String },
        location: {
            country: String,
            city: String,
        },
        metadata: { type: Object },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SecurityLog", securityLogSchema);
