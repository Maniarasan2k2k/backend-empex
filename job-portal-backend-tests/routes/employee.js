const express = require('express');
const router = express.Router();
const { protect } = require('../utils/authMiddleware');
const upload = require("../config/s3Upload");
// 🟢 Controllers
const employeeController = require('../controllers/employeeController');
const authController = require('../controllers/authcontroller');

// ============================
// 1. DASHBOARD & HOME
// ============================
router.get('/dashboard-stats', protect, employeeController.getDashboardStats);

// ============================
// 2. PROFILE MANAGEMENT
// ============================
router.get('/profile', protect, employeeController.getCompanyProfile);

// Unified Logo & Documents Upload
// employee.js route change
router.post('/profile', protect, upload.fields([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'companyDoc', maxCount: 5 } // Field name 'companyDoc'
]), employeeController.saveCompanyProfile);

router.post('/profile/document', protect, upload.single('docFile'), employeeController.saveCompanyDocument);
router.delete('/profile/document/:type', protect, employeeController.deleteCompanyDocument);

// 🟢 Document Validation Routes
router.get('/profile/document/rules', protect, employeeController.getDocumentRules);
router.post('/profile/document/validate', protect, employeeController.validateCompanyDocuments);

// ============================
// 3. CANDIDATE SEARCH
// ============================
router.get('/candidates', protect, employeeController.searchCandidates);
router.get('/candidate/:id', protect, employeeController.getCandidateById);

// ============================
// 4. UNIFIED APPLICATION MANAGEMENT
// ============================

// 🟢 MASTER GET: Use for both Mobile & Web
// Usage: /api/employee/applications?status=Applied
// Usage: /api/employee/applications?status=Shortlisted,Interview Scheduled
router.get('/applications', protect, employeeController.getUnifiedApplications);

// 🟢 MASTER UPDATE: One route for Single Status, Bulk Status, and Interview Scheduling
// Usage: Both Web and Mobile use this for all status/scheduling changes
router.put('/applications/update-status', protect, employeeController.updateUnifiedStatus);

// ============================
// 5. UTILS
// ============================
// Rename to /change-password to avoid confusion with public reset tokens
router.post('/change-password', protect, authController.resetPassword);

module.exports = router;