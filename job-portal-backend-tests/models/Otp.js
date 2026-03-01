const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '10m' } } // Auto-delete after 10 mins
});

module.exports = mongoose.model('Otp', otpSchema);