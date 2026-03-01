// routes/legalRoutes.js
// Public routes for legal content — no authentication required.
// These endpoints serve the Privacy Policy and Terms of Service as structured JSON
// so that the web frontend and Flutter mobile apps can both consume them.

const express = require('express');
const router = express.Router();
const legalController = require('../controllers/legalController');

// GET /api/legal/privacy-policy
router.get('/privacy-policy', legalController.getPrivacyPolicy);

// GET /api/legal/terms-of-service
router.get('/terms-of-service', legalController.getTermsOfService);

// GET /api/legal/refund-policy
router.get('/refund-policy', legalController.getRefundPolicy);

// GET /api/legal/trust-and-safety
router.get('/trust-and-safety', legalController.getTrustAndSafety);

module.exports = router;
