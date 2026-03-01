const Notification = require('../models/Notification');

/**
 * Send Notification
 * @param {Object} params - Notification parameters
 */
const sendNotification = async ({ recipient, recipientModel, title, message, type, relatedId }) => {
    try {
        const notification = new Notification({
            recipient,
            recipientModel: recipientModel || 'CandidateUser', // Default or logical choice
            title,
            message,
            type,
            relatedId,
        });

        await notification.save();
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
};

module.exports = { sendNotification };
