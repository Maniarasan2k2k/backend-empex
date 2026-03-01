const mongoose = require("mongoose");

// ==========================================
// Admin User Schema (User.model.js from Admin Dashboard)
// ==========================================
const adminUserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },

        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
        },

        password: { type: String, required: true },

        // Role references the Role model (RBAC)
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },

        isActive: { type: Boolean, default: true },

        isFlagged: {
            type: Boolean,
            default: false,
        },

        otp: { type: String },
        otpExpires: { type: Date },
        isOtpVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AdminUser", adminUserSchema);
