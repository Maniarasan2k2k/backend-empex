const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            // ex: SUPER_ADMIN, HR_ADMIN
        },

        name: {
            type: String,
            required: true,
            trim: true,
            // ex: Super Admin, HR Admin
        },

        description: {
            type: String,
            trim: true,
        },

        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Permission",
            },
        ],

        isSystemRole: {
            type: Boolean,
            default: false,
            // SUPER_ADMIN, ADMIN → true
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
