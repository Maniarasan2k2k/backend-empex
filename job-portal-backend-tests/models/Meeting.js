const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeUser',
        required: true
    },
    companyName: { type: String }, // Snapshot of Company Name
    companyLogo: { type: String }, // Snapshot of Company Logo
    title: { type: String, required: true },
    topic: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    link: { type: String, required: true },

    // 🟢 ADMIN FIELDS: Status management
    status: {
        type: String,
        enum: ['UPCOMING', 'COMPLETED', 'CANCELLED', 'BLOCKED'],
        default: 'UPCOMING',
    },
    blockedReason: { type: String },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser', // admin user
    },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);