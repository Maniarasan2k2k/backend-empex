const mongoose = require('mongoose');

const WebinarSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
        type: String,
        required: true,
        enum: ['IT', 'Non-IT', 'Soft Skills']
    },

    // Time & Date
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: String, default: "60 mins" },

    // Details
    price: { type: Number, default: 0 },

    // 🟢 DUAL PURPOSE FIELDS
    meetingLink: { type: String, default: "" }, // For LIVE sessions (Zoom/Meet)
    videoUrl: { type: String, default: "" },    // For RECORDED sessions (YouTube/S3)

    status: {
        type: String,
        enum: ['Upcoming', 'Live', 'Completed'],
        default: 'Upcoming'
    },

    // 🟢 ADMIN FIELDS
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeUser",
    },
    isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Webinar', WebinarSchema);