const AdminUser = require("../models/AdminUser");
const EmployeeUser = require("../models/EmployeeUser");
const CompanyProfile = require("../models/Employee/CompanyProfile");
const Application = require("../models/Application");
const AdminJob = require("../models/Employee/Job");
const AuditLog = require("../models/AuditLog");
const CandidateProfile = require("../models/Candidate/CandidateProfile");
const CandidateUser = require("../models/CandidateUser");
const Bookmark = require("../models/Bookmark");

const DEFAULT_MONTH_RANGE = 6;

/**
 * KPI SECTION
 */
const getKPIs = async (dateFilter) => {
    const filter = dateFilter?.createdAt ? dateFilter : {};

    const [
        totalAdmins,
        flaggedUsers,
        totalEmployers,
        employerVerified,
        totalCompanies,
        noOfVerification,
        totalJobpost,
        activeJobs,
        totalApplications,
        appliedCandidates,
        shotlistedCandidates,
        interviewShedules,
        hiredCandidates,
        totalCandiUsers,
        totalCandiProfiles,
        blockedCandidates,
        bookmarkJobs,
        totalEmployeeUsers,
    ] = await Promise.all([
        // ================= ADMIN =================
        AdminUser.countDocuments(filter),
        AdminUser.countDocuments({ ...filter, isFlagged: true }),

        // ================= EMPLOYER =================
        EmployeeUser.countDocuments({ ...filter, role: "EMPLOYER" }),
        EmployeeUser.countDocuments({
            ...filter,
            role: "EMPLOYER",
            isVerified: true,
        }),

        // ================= COMPANY =================
        CompanyProfile.countDocuments(filter),
        CompanyProfile.countDocuments({ ...filter, status: "Pending" }),

        // ================= JOB =================
        AdminJob.countDocuments(filter),
        AdminJob.countDocuments({ ...filter, status: "ACTIVE" }),

        // ================= APPLICATION =================
        Application.countDocuments(filter),
        Application.countDocuments({ ...filter, status: "Applied" }),
        Application.countDocuments({ ...filter, status: "Shortlisted" }),
        Application.countDocuments({ ...filter, status: "Interview Scheduled" }),
        Application.countDocuments({ ...filter, status: "Hired" }),

        // ================= CANDIDATE =================
        CandidateUser.countDocuments(filter),
        CandidateProfile.countDocuments(filter),
        CandidateUser.countDocuments({ ...filter, isBlocked: true }),

        // ================= BOOKMARK =================
        Bookmark.countDocuments(filter),

        // ================= EMPLOYEE USERS =================
        EmployeeUser.countDocuments(filter),
    ]);

    const TotalUsers = totalAdmins + totalEmployeeUsers + totalCandiUsers;

    return {
        totalAdmins,
        flaggedUsers,
        totalEmployers,
        employerVerified,
        totalCompanies,
        noOfVerification,
        totalJobpost,
        activeJobs,
        totalApplications,
        totalAppliedJobs: appliedCandidates,
        AppliedCandidates: appliedCandidates,
        shotlistedCandidates,
        interviewShedules,
        hiredCandidates,
        totalCandiUsers,
        totalCandiProfiles,
        blockedCandidates,
        bookmarkJobs,
        totalEmployeeUsers,
        TotalUsers,
        employersUser: totalEmployers,
    };
};

/**
 * ATS PIPELINE BREAKDOWN
 */
const getATSPipeline = async (dateFilter) => {
    return Application.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);
};

/**
 * APPLICATION TREND
 */
const getApplicationTrend = async (months) => {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - months);

    return Application.aggregate([
        {
            $match: {
                createdAt: { $gte: fromDate },
            },
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                },
                total: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
};

/**
 * COMPANY STATUS BREAKDOWN
 */
const getCompanyStatusBreakdown = async () => {
    return CompanyProfile.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);
};

/**
 * JOB STATUS BREAKDOWN
 */
const getJobStatusBreakdown = async () => {
    return AdminJob.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);
};

/**
 * USER GROWTH
 */
const getUserGrowth = async () => {
    return EmployeeUser.aggregate([
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
};

/**
 * RECENT AUDIT LOGS
 */
const getRecentAuditLogs = async () => {
    return AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("performedBy", "email");
};

/**
 * MAIN DASHBOARD SERVICE
 */
const getAdminDashboardData = async (user, query) => {
    const { startDate, endDate } = query;

    const dateFilter =
        startDate && endDate
            ? {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
                },
            }
            : {};

    const [
        kpis,
        atsPipeline,
        applicationTrend,
        companyBreakdown,
        jobBreakdown,
        userGrowth,
        recentActivities,
    ] = await Promise.all([
        getKPIs(dateFilter),
        getATSPipeline(dateFilter),
        getApplicationTrend(DEFAULT_MONTH_RANGE),
        getCompanyStatusBreakdown(),
        getJobStatusBreakdown(),
        getUserGrowth(),
        getRecentAuditLogs(),
    ]);

    return {
        kpis,
        atsPipeline,
        applicationTrend,
        companyBreakdown,
        jobBreakdown,
        userGrowth,
        recentActivities,
    };
};

module.exports = {
    getAdminDashboardData,
};
