const AuditLog = require("../../models/AuditLog");
const SecurityLog = require("../../models/SecurityLog");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * ========================================
 * GET AUDIT LOGS (WITH ADVANCED FILTERING)
 * ========================================
 */
const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const { module, action, targetType, search, startDate, endDate } = req.query;

        const query = {};
        if (module) query.module = module;
        if (action) query.action = action;
        if (targetType) query.targetType = targetType;

        if (search) {
            query.$or = [
                { userEmail: { $regex: search, $options: "i" } },
                { userName: { $regex: search, $options: "i" } },
                { details: { $regex: search, $options: "i" } },
            ];
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.timestamp.$lte = end;
            }
        }

        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .populate("user", "name email role")
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: logs,
        });
    } catch (err) {
        console.error("Get Audit Logs Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET AUDIT LOG DETAIL
 */
const getAuditLogDetail = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const log = await AuditLog.findById(req.params.id).populate("user", "name email role");
        if (!log) return res.status(404).json({ message: "Log not found" });

        res.json({ success: true, data: log });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET AUDIT STATISTICS
 */
const getAuditStats = async (req, res) => {
    try {
        const stats = await AuditLog.aggregate([
            {
                $facet: {
                    actionCounts: [{ $group: { _id: "$action", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
                    moduleCounts: [{ $group: { _id: "$module", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
                    statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
                    totalLogs: [{ $count: "count" }],
                },
            },
        ]);

        res.json({ success: true, data: stats[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET SECURITY LOGS
 */
const getSecurityLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, action, email } = req.query;

        const query = {};
        if (status) query.status = status;
        if (action) query.action = action;
        if (email) query.email = { $regex: email, $options: "i" };

        const total = await SecurityLog.countDocuments(query);
        const logs = await SecurityLog.find(query)
            .populate("userId", "name email role")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            total,
            page,
            data: logs,
        });
    } catch (err) {
        console.error("Get Security Logs Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAuditLogs,
    getAuditLogDetail,
    getAuditStats,
    getSecurityLogs,
};
