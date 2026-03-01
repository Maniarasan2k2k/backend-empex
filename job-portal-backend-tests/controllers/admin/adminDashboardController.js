const { getAdminDashboardData } = require("../../services/adminDashboardService");
const CandidateUser = require("../../models/CandidateUser");
const Application = require("../../models/Application");
const Bookmark = require("../../models/Bookmark");

/**
 * FETCH MAIN DASHBOARD DATA
 */
const fetchDashboard = async (req, res) => {
    try {
        const data = await getAdminDashboardData(req.user, req.query);

        res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data,
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
        });
    }
};

/**
 * FETCH CANDIDATE ANALYTICS
 */
const getCandidateDashboardAnalytics = async (req, res) => {
    try {
        const totalUsers = await CandidateUser.countDocuments();
        const totalCandidates = await CandidateUser.countDocuments({ role: "candidate" });
        const blockedCandidates = await CandidateUser.countDocuments({ role: "candidate", isBlocked: true });
        const totalAppliedJobs = await Application.countDocuments();
        const appliedCandidates = await Application.distinct("candidateId");
        const totalCandidatesApplied = appliedCandidates.length;
        const totalBookmarkedJobs = await Bookmark.countDocuments();
        const bookmarkedCandidates = await Bookmark.distinct("candidateId");
        const totalCandidatesBookmarked = bookmarkedCandidates.length;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalCandidates,
                blockedCandidates,
                totalAppliedJobs,
                totalCandidatesApplied,
                totalBookmarkedJobs,
                totalCandidatesBookmarked,
            },
        });
    } catch (error) {
        console.error("Candidate Dashboard Analytics Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch candidate dashboard analytics",
        });
    }
};

/**
 * FETCH GROWTH STATS (CANDIDATES vs EMPLOYEES)
 */
const getGrowthStats = async (req, res) => {
    try {
        const candidateGrowth = await CandidateUser.aggregate([
            { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json({ success: true, data: { candidateGrowth } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * FETCH STATUS STATS (JOBS & APPLICATIONS)
 */
const getStatusStats = async (req, res) => {
    try {
        const jobStats = await Job.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const appStats = await Application.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.json({ success: true, data: { jobStats, appStats } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    fetchDashboard,
    getCandidateDashboardAnalytics,
    getGrowthStats,
    getStatusStats,
};
