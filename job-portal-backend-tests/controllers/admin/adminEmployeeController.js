const EmployeeUser = require("../../models/EmployeeUser");
const AuditLog = require("../../models/AuditLog");
const mongoose = require("mongoose");

/**
 * ===============================
 * HELPER → CREATE AUDIT LOG
 * ===============================
 */
const createAuditLog = async ({
    userId,
    module,
    action,
    status = "SUCCESS",
    description = "",
    refLink = null,
    beforeData = null,
    afterData = null,
    ip,
    device
}) => {
    try {
        await AuditLog.create({
            user: userId ? new mongoose.Types.ObjectId(userId) : null,
            performedBy: userId ? new mongoose.Types.ObjectId(userId) : null,
            module,
            action,
            status,
            description,
            userEmail: "admin@vnm.com",
            userRole: "ADMIN",
            entity: module,
            entityId: "SYSTEM",
            timestamp: new Date()
        });
    } catch (err) {
        console.error("Audit Log Error:", err.message);
    }
};

/**
 * ===============================
 * GET ALL EMPLOYEES
 * ===============================
 */
const getAllEmployees = async (req, res) => {
    try {
        const { role, isVerified, search } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (isVerified !== undefined) filter.isVerified = isVerified === "true";
        if (search) {
            filter.$or = [
                { empname: { $regex: search, $options: "i" } },
                { empemail: { $regex: search, $options: "i" } },
                { empphone: { $regex: search, $options: "i" } }
            ];
        }

        const employees = await EmployeeUser.find(filter)
            .select("empname empemail empphone role isVerified profilePicture createdAt")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: employees.length, data: employees });
    } catch (error) {
        console.error("Fetch employees error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch employees" });
    }
};

/**
 * ===============================
 * GET SINGLE EMPLOYEE
 * ===============================
 */
const getEmployeeById = async (req, res) => {
    try {
        const employee = await EmployeeUser.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json({ success: true, data: employee });
    } catch (error) {
        console.error("Fetch employee error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch employee" });
    }
};

/**
 * ===============================
 * EDIT / UPDATE EMPLOYEE
 * ===============================
 */
const updateEmployee = async (req, res) => {
    try {
        const employee = await EmployeeUser.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const allowedUpdates = ["empname", "empemail", "empphone", "role"];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) employee[field] = req.body[field];
        });

        await employee.save();

        res.json({ success: true, message: "Employee updated", data: employee });
    } catch (error) {
        console.error("Update employee error:", error);
        res.status(500).json({ success: false, message: "Failed to update employee" });
    }
};

/**
 * ===============================
 * TOGGLE EMPLOYEE STATUS
 * ===============================
 */
const toggleEmployeeStatus = async (req, res) => {
    try {
        const employee = await EmployeeUser.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        employee.isVerified = req.body.isVerified;
        await employee.save();

        res.json({ success: true, message: "Employee status updated", isVerified: employee.isVerified });
    } catch (error) {
        console.error("Toggle status error:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
};

/**
 * ===============================
 * DELETE EMPLOYEE
 * ===============================
 */
const deleteEmployee = async (req, res) => {
    try {
        const employee = await EmployeeUser.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        await employee.deleteOne();

        res.json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
        console.error("Delete employee error:", error);
        res.status(500).json({ success: false, message: "Failed to delete employee" });
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee,
};
