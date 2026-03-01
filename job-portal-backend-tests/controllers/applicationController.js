const Application = require('../models/Application');
const Job = require('../models/Employee/Job');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');

// ==========================================
// 1. JOB APPLICATION LOGIC
// ==========================================

// --- APPLY FOR A JOB ---
exports.applyForJob = async (req, res) => {
    try {
        const { jobId } = req.body;
        const candidateId = req.user.id;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        const existingApplication = await Application.findOne({ jobId, candidateId });
        if (existingApplication) {
            return res.status(400).json({ success: false, message: "You have already applied for this job." });
        }

        const newApplication = new Application({
            jobId,
            candidateId,
            status: 'Applied'
        });

        await newApplication.save();

        // 🟢 TRIGGER NOTIFICATION FOR EMPLOYER
        const notification = await Notification.create({
            recipient: job.postedBy,
            recipientModel: 'EmployeeUser', // Point to correct collection
            sender: candidateId,
            senderModel: 'CandidateUser',
            type: 'new_application',
            title: 'New Application Received',
            message: `${req.user.name || "A candidate"} applied for your "${job.jobTit}" position.`,
            relatedId: newApplication._id
        });

        // 🟢 EMIT REAL-TIME SOCKET EVENT
        const io = req.app.get('socketio');
        if (io) {
            io.to(job.postedBy.toString()).emit('new_ping', notification);
        }

        res.status(201).json({ success: true, message: "Application submitted successfully!" });

    } catch (error) {
        console.error("Apply Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// --- GET MY APPLIED JOBS (For Candidate History) ---
exports.getMyApplications = async (req, res) => {
    try {
        const candidateId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Application.countDocuments({ candidateId });

        const applications = await Application.find({ candidateId })
            .populate('jobId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            total,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ==========================================
// 2. BOOKMARK / SAVED JOBS
// ==========================================

// --- TOGGLE BOOKMARK ---
exports.toggleBookmark = async (req, res) => {
    try {
        const { jobId } = req.body;
        const candidateId = req.user.id;

        const existing = await Bookmark.findOne({ jobId, candidateId });

        if (existing) {
            await Bookmark.findByIdAndDelete(existing._id);
            return res.json({ success: true, message: "Removed from Saved Jobs", isBookmarked: false });
        } else {
            const newBookmark = new Bookmark({ jobId, candidateId });
            await newBookmark.save();
            return res.json({ success: true, message: "Job Saved Successfully", isBookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET BOOKMARKED JOBS (Full Details with Pagination) ---
// GET /api/application/bookmarked-jobs?page=1&limit=10
exports.getBookmarkedJobs = async (req, res) => {
    try {
        const candidateId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        // Total count (for totalPages calculation)
        const totalBookmarks = await Bookmark.countDocuments({ candidateId });

        // Paginated fetch
        const bookmarks = await Bookmark.find({ candidateId })
            .populate('jobId')
            .sort({ savedAt: -1 })
            .skip(skip)
            .limit(limit);

        // Filter out bookmarks where the job was deleted
        const validBookmarks = bookmarks.filter(b => b.jobId);

        res.json({
            success: true,
            totalBookmarks,
            totalPages: Math.ceil(totalBookmarks / limit),
            currentPage: page,
            count: validBookmarks.length,
            bookmarks: validBookmarks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET BOOKMARKED IDs (For UI Icons) ---
exports.getBookmarkedJobIds = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ candidateId: req.user.id }).select('jobId');
        res.json({ success: true, ids: bookmarks.map(b => b.jobId) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. UI UTILITIES (Applied & Bookmarked Status)
// ==========================================

// --- CHECK STATUS FOR ONE SPECIFIC JOB ---
exports.checkJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const candidateId = req.user.id;

        const isApplied = await Application.exists({ jobId, candidateId });
        const isBookmarked = await Bookmark.exists({ jobId, candidateId });

        res.json({
            success: true,
            hasApplied: !!isApplied,
            isBookmarked: !!isBookmarked
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET ALL INTERACTIONS (For Home Feed Highlights) ---
exports.getAllUserInteractions = async (req, res) => {
    try {
        const candidateId = req.user.id;

        const [bookmarks, applications] = await Promise.all([
            Bookmark.find({ candidateId }).select('jobId'),
            Application.find({ candidateId }).select('jobId')
        ]);

        res.json({
            success: true,
            bookmarkedIds: bookmarks.map(b => b.jobId),
            appliedIds: applications.map(a => a.jobId)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};