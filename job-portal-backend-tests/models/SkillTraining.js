const mongoose = require("mongoose");

const SkillTrainingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        shortTag: {
            type: String, // "SOFT SKILLS"
            default: "SKILL TRAINING",
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            enum: ["Soft Skills", "IT", "Non-IT", "Career"],
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        time: {
            type: String, // "6:00 PM"
            required: true,
        },

        durationMinutes: {
            type: Number, // 90
            required: true,
        },

        language: {
            type: [String], // ["English", "Hindi"]
            default: [],
        },

        price: {
            type: Number,
            default: 0,
        },

        isFree: {
            type: Boolean,
            default: true,
        },

        benefits: [
            {
                type: String, // Lifetime recording, Certificate
            },
        ],

        curriculum: [
            {
                type: String,
            },
        ],

        instructor: {
            name: String,
            photo: String,
            designation: String,
        },

        enrolledCount: {
            type: Number,
            default: 0,
        },

        maxSeats: {
            type: Number,
            default: 500,
        },

        status: {
            type: String,
            enum: ["DRAFT", "PUBLISHED", "CANCELLED"],
            default: "DRAFT",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdminUser", // Admin
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SkillTraining", SkillTrainingSchema);
