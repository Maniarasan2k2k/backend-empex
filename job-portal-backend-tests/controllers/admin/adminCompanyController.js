const Company = require("../../models/Employee/CompanyProfile");
const Job = require("../../models/Employee/Job");
const auditService = require("../../services/auditService");
const { sendNotification } = require("../../services/notificationService");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET ALL COMPANIES
 */
const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });

        const companiesWithJobs = await Promise.all(
            companies.map(async (company) => {
                const jobsCount = await Job.countDocuments({ cmpProfile: company._id });
                return { ...company.toObject(), totalJobs: jobsCount };
            })
        );

        res.json({ success: true, count: companiesWithJobs.length, data: companiesWithJobs });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch companies" });
    }
};

/**
 * GET SINGLE COMPANY
 */
const getCompanyById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: "Company not found" });
        res.json({ success: true, data: company });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * CREATE COMPANY
 */
const createCompany = async (req, res) => {
    try {
        const company = await Company.create({
            ...req.body,
            status: "Pending",
        });

        await auditService.auditCreate(req, "COMPANIES", company._id, "Company", `Created company: ${company.empcomNam}`, company);

        res.status(201).json({ success: true, message: "Company created", data: company });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * UPDATE COMPANY
 */
const updateCompany = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: "Company not found" });

        const oldData = JSON.parse(JSON.stringify(company));
        Object.assign(company, req.body);
        const updated = await company.save();

        await auditService.auditUpdate(req, "COMPANIES", company._id, "Company", "Updated company info", oldData, updated);

        res.json({ success: true, message: "Company updated", data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * VERIFY COMPANY / UPDATE STATUS
 */
const updateCompanyStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: "Company not found" });

        const oldStatus = company.status;
        company.status = status;
        company.isVerified = status === "Verified";
        if (remarks) company.remarks = remarks;

        await company.save();

        await auditService.auditUpdate(req, "COMPANIES", company._id, "Company", `Status updated: ${oldStatus} -> ${status}`, { status: oldStatus }, { status });

        // Notify creator (EmployeeUser)
        if (company.postedBy) {
            await sendNotification({
                recipient: company.postedBy,
                recipientModel: 'EmployeeUser',
                title: "Company Status Updated",
                message: `Your company profile ${company.empcomNam} status has been updated to ${status}`,
                type: "system",
                relatedId: company._id
            });
        }

        res.json({ success: true, message: `Company ${status}`, data: company });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE COMPANY
 */
const deleteCompany = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: "Company not found" });

        await auditService.auditDelete(req, "COMPANIES", company._id, "Company", `Deleted company: ${company.empcomNam}`, company);
        await company.deleteOne();

        res.json({ success: true, message: "Company deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    updateCompanyStatus,
    deleteCompany,
};
