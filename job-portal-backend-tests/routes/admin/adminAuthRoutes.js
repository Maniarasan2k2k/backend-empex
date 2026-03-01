const express = require("express");
const { adminLogin, adminRegister, verifyOTP } = require("../../controllers/adminAuthController");
const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

/**
 * @desc    Admin Login
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
router.post("/login", adminLogin);

/**
 * @desc    Verify OTP
 * @route   POST /api/admin/auth/verify-otp
 * @access  Public
 */
router.post("/verify-otp", verifyOTP);


/**
 * @desc    Register Admin User
 * @route   POST /api/admin/auth/register
 * @access  SUPER_ADMIN
 */
router.post(
    "/register",
    adminAuthMiddleware,
    allowPermissions(PERMISSIONS.MANAGE_ADMINS),
    adminRegister
);

module.exports = router;
