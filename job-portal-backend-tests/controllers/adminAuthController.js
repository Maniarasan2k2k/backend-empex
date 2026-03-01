const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");

const { logSecurityEvent } = require("../utils/securityLogger");
const { sendNotification } = require("../services/notificationService");

// Generate JWT token for admin
const generateAdminToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

/**
 * @desc    Admin Login
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            await logSecurityEvent({ req, email, action: "LOGIN_FAILED", status: "FAILED", metadata: { reason: "Missing email/password" } });
            return res.status(400).json({ message: "Email & password required" });
        }

        const user = await AdminUser.findOne({ email }).populate({
            path: "role",
            populate: { path: "permissions" },
        });

        if (!user) {
            await logSecurityEvent({ req, email, action: "LOGIN_FAILED", status: "FAILED", metadata: { reason: "User not found" } });
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await logSecurityEvent({ req, user, action: "LOGIN_FAILED", status: "FAILED", metadata: { reason: "Wrong password" } });
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isActive) {
            await logSecurityEvent({ req, user, action: "LOGIN_FAILED", status: "FAILED", metadata: { reason: "Account blocked" } });
            return res.status(403).json({ message: "Account blocked. Contact admin." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        user.isOtpVerified = false;
        await user.save();

        await logSecurityEvent({ req, user, action: "OTP_SENT", status: "SUCCESS" });

        console.log(`[AUTH] OTP for ${user.email} is: ${otp}`);

        res.status(200).json({
            success: true,
            message: "OTP generated successfully",
            otp: otp, // Still returning OTP for testing as per existing target logic
            email: user.email,
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

/**
 * @desc    Verify OTP and Login
 * @route   POST /api/admin/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await AdminUser.findOne({ email }).populate({
            path: "role",
            populate: { path: "permissions" },
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
            await logSecurityEvent({ req, user, action: "OTP_FAILED", status: "FAILED" });
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        // Success
        user.isOtpVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = generateAdminToken(user);

        await logSecurityEvent({ req, user, action: "LOGIN_SUCCESS", status: "SUCCESS" });

        // Notify
        await sendNotification({
            recipient: user._id,
            recipientModel: 'AdminUser',
            title: "Login Successful",
            message: `You have successfully logged in as ${user.role?.name}`,
            type: "system"
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: {
                    key: user.role?.key,
                    name: user.role?.name,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

/**
 * @desc    Register Admin User (SUPER_ADMIN only)
 * @route   POST /api/admin/auth/register
 * @access  SUPER_ADMIN
 */
const adminRegister = async (req, res) => {
    try {
        const { name, email, password, roleKey } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" });
        }

        const existingUser = await AdminUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const role = await Role.findOne({
            key: roleKey ? roleKey.toUpperCase() : "USER",
            isActive: true,
        });

        if (!role) {
            return res.status(400).json({ success: false, message: "Invalid or inactive role" });
        }

        // Restrict creating system roles unless SUPER_ADMIN
        if (role.isSystemRole && (!req.user || req.user.role?.key !== "SUPER_ADMIN")) {
            return res.status(403).json({ success: false, message: "You are not allowed to create system users" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await AdminUser.create({
            name,
            email,
            password: hashedPassword,
            role: role._id,
        });

        await logSecurityEvent({ req, user, action: "ADMIN_CREATED", status: "SUCCESS", metadata: { createdBy: req.user?._id } });

        const token = generateAdminToken(user);

        res.status(201).json({
            success: true,
            message: "Admin user registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: { key: role.key, name: role.name },
            },
        });
    } catch (error) {
        console.error("ADMIN REGISTER ERROR:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = { adminLogin, adminRegister, verifyOTP };
