const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CandidateUser', // Ensure this matches your Candidate User model name
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate bookmarks (Same candidate cannot save same job twice)
bookmarkSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);