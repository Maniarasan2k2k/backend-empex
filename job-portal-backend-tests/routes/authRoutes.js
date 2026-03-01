const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginEmail,
    loginMobile,
    resetPassword,      // This is the authenticated one (Change Password)
    fixDatabaseIndexes,

    // 🟢 Import new functions
    forgotPassword,
    resetPasswordWithToken,
    googleLogin,
    googleRequestOTP,
    googleFinish,
    deleteAccount
} = require('../controllers/authcontroller');

const { protect } = require('../utils/authMiddleware');

// ==========================
// 1. THIRD-PARTY AUTH
// ==========================
router.post('/google-login', googleLogin);
router.post('/google-request-otp', googleRequestOTP);
router.post('/google-finish', googleFinish);

// ==========================
// 2. REGISTRATION
// ==========================
router.post('/register', registerUser);

// ==========================
// 2. EMAIL LOGIN
// ==========================
router.post('/login-email', loginEmail);

// ==========================
// 3. MOBILE LOGIN
// ==========================
router.post('/login-mobile', loginMobile);

// ==========================
// 4. FORGOT PASSWORD (Public)
// ==========================
// In routes/authRoutes.js
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPasswordWithToken);

// ==========================
// 5. UTILITIES (Protected)
// ==========================
// This is "Change Password" for logged-in users
router.post('/reset-password', protect, resetPassword);
router.get('/fix-db', fixDatabaseIndexes);

// ==========================
// 6. DELETE ACCOUNT (Protected — Permanent)
// ==========================
// Works for both candidate and employee — role is inferred from the JWT token
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;