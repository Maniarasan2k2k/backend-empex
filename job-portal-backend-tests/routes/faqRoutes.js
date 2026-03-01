// routes/faqRoutes.js
// Public routes for FAQ content — no authentication required.

const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// GET /api/faq                          → all FAQs (with optional ?category= and ?search=)
// GET /api/faq?category=candidates      → filtered by category
// GET /api/faq?search=interview         → keyword search across questions & answers
// GET /api/faq?category=employers&search=verify → combined filter
router.get('/', faqController.getFaqs);

// GET /api/faq/categories               → only the categories list (for tab bar)
router.get('/categories', faqController.getCategories);

module.exports = router;
