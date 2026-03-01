const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            // ex: CREATE_JOB, VIEW_USERS
        },

        name: {
            type: String,
            required: true,
            trim: true,
            // ex: Create Job, View Users
        },

        description: {
            type: String,
            trim: true,
        },

        module: {
            type: String,
            required: true,
            trim: true,
            // ex: JOB, USER, ADMIN, BILLING
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
