const express = require('express');
const router = express.Router();
const { protect } = require('../utils/authMiddleware');

// 🟢 S3 Upload (AWS emp-x-jobs bucket)
const upload = require("../config/s3Upload");
const profileController = require("../controllers/profileController");
const { saveJobPreferences, getJobPreferences } = require('../controllers/recommendationController');

// Visibility Settings
router.get('/visibility-status', protect, profileController.getVisibilityStatus);    // GET current status + dropdown options
router.put('/visibility-status', protect, profileController.updateVisibilityStatus); // UPDATE status

// Candidate Dashboard (stats + completion %)
router.get('/dashboard', protect, profileController.getCandidateDashboard);

// 1. Get Profile
router.get('/me', protect, profileController.getProfile);

// 2. Save Full Profile (JSON Bulk Save)
router.post('/full-profile', protect, profileController.saveFullProfile);

// 3. Save Sections (With AWS S3 File Uploads)
router.post('/personal', protect, upload.single('profilePhoto'), profileController.savePersonalDetails);
router.post('/education', protect, upload.single('caneduCert'), profileController.saveEducation);
router.post('/experience', protect, upload.single('canexpCert'), profileController.saveExperience);
router.post('/internship', protect, upload.single('canintCert'), profileController.saveInternship);
router.post('/project', protect, upload.single('canproDoc'), profileController.saveProject);
router.post('/skill', protect, upload.single('canskiCer'), profileController.saveSkill);
router.post('/language', protect, profileController.saveLanguage);

// 4. Delete Item
router.delete('/:section/:itemId', protect, profileController.deleteSectionItem);

// 5. Job Preferences
router.post('/job-preferences', protect, saveJobPreferences);
router.get('/job-preferences', protect, getJobPreferences);

module.exports = router;