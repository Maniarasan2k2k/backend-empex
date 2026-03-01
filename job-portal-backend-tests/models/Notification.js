const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // 🟢 FIX: Dynamic Ref allows linking to both collections
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['CandidateUser', 'EmployeeUser', 'AdminUser']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        enum: ['CandidateUser', 'EmployeeUser', 'AdminUser']
    },
    type: {
        type: String,
        enum: ['new_application', 'invitation', 'system', 'interview_scheduled'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);