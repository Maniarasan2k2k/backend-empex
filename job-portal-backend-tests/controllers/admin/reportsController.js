const reportService = require("../../services/reportsService");

/* ================================
   Dashboard
================================ */
const getDashboardSummary = async (req, res) => {
    try {
        const data = await reportService.getDashboardSummaryService();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================================
   Application Report
================================ */
const getApplicationReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await reportService.getApplicationReportService(startDate, endDate);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================================
   Job Performance
================================ */
const getJobPerformance = async (req, res) => {
    try {
        const data = await reportService.getJobPerformanceService();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================================
   Company Performance
================================ */
const getCompanyPerformance = async (req, res) => {
    try {
        const data = await reportService.getCompanyPerformanceService();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardSummary,
    getApplicationReport,
    getJobPerformance,
    getCompanyPerformance,
};
