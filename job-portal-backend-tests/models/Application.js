const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateUser', required: true },
    
    status: {
        type: String,
        // 🟢 FIX: Added 'Viewed' to the list so it doesn't crash
        enum: ['Applied', 'Viewed', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Hired'], 
        default: 'Applied'
    },

    // Interview Fields
    interviewDate: { type: String },
    interviewTime: { type: String },
    interviewMode: { type: String },
    interviewLink: { type: String },
    interviewNotes: { type: String },
    candidateInstructions: { type: String }, 

    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);