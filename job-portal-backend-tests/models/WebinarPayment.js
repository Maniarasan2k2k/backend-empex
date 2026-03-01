const mongoose = require('mongoose');

const WebinarPaymentSchema = new mongoose.Schema({
    // Link to the Student/Candidate who paid
    candidateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CandidateProfile', 
        required: true 
    },
    
    // Link to the specific Webinar/Video
    webinarId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Webinar', 
        required: true 
    },
    
    // Payment Details
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    
    transactionId: { type: String, default: "" }, // ID from Razorpay/Stripe
    
    paymentStatus: { 
        type: String, 
        enum: ['Success', 'Failed', 'Pending'], 
        default: 'Pending' 
    },
    
    paidAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WebinarPayment', WebinarPaymentSchema);