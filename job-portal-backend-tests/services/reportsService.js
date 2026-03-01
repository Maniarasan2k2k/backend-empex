const Application = require("../models/Application");
const CandidateUser = require("../models/CandidateUser");
const Job = require("../models/Employee/Job");
const CompanyProfile = require("../models/Employee/CompanyProfile");
const EmployeeUser = require("../models/EmployeeUser");
const { buildDateFilter } = require("../utils/reportFilter");

/**
 * 1. DASHBOARD SUMMARY
 */
const getDashboardSummaryService = async () => {
    const [
        totalCandidates,
        totalEmployees,
        totalJobs,
        totalApplications,
        totalCompanies,
    ] = await Promise.all([
        CandidateUser.countDocuments(),
        EmployeeUser.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
        CompanyProfile.countDocuments(),
    ]);

    return {
        totalCandidates,
        totalEmployees,
        totalJobs,
        totalApplications,
        totalCompanies,
    };
};

/**
 * 2. APPLICATION REPORT
 */
const getApplicationReportService = async (startDate, endDate) => {
    const dateFilter = buildDateFilter(startDate, endDate);

    const statusWise = await Application.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: "$status",
                total: { $sum: 1 },
            },
        },
    ]);

    const monthlyTrend = await Application.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: { month: { $month: "$createdAt" } },
                total: { $sum: 1 },
            },
        },
        { $sort: { "_id.month": 1 } },
    ]);

    return { statusWise, monthlyTrend };
};

/**
 * 3. JOB PERFORMANCE REPORT
 */
const getJobPerformanceService = async () => {
    return await Job.aggregate([
        {
            $lookup: {
                from: "applications",
                localField: "_id",
                foreignField: "jobId",
                as: "applications",
            },
        },
        {
            $project: {
                jobTit: 1,
                status: 1,
                totalApplications: { $size: "$applications" },
            },
        },
    ]);
};

/**
 * 4. COMPANY PERFORMANCE REPORT
 */
const getCompanyPerformanceService = async () => {
    return await CompanyProfile.aggregate([
        {
            $lookup: {
                from: "jobpostings", // Note: verified from Job.js model - third argument to model()
                localField: "_id",
                foreignField: "cmpProfile",
                as: "jobs",
            },
        },
        {
            $project: {
                empcomNam: 1,
                totalJobs: { $size: "$jobs" },
            },
        },
    ]);
};

/**
 * 5. USER GROWTH REPORT
 */
const getUserGrowthService = async () => {
    return await CandidateUser.aggregate([
        {
            $group: {
                _id: { month: { $month: "$createdAt" } },
                totalUsers: { $sum: 1 },
            },
        },
        { $sort: { "_id.month": 1 } },
    ]);
};

module.exports = {
    getDashboardSummaryService,
    getApplicationReportService,
    getJobPerformanceService,
    getCompanyPerformanceService,
    getUserGrowthService,
};
