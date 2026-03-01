const CandidateUser = require("../models/CandidateUser");
const EmployeeUser = require("../models/EmployeeUser");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require('google-auth-library');
const CandidateProfile = require("../models/Candidate/CandidateProfile");
const CompanyProfile = require("../models/Employee/CompanyProfile");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {
    sendOtpEmail,
    sendWelcomeEmail,
    sendForgotPasswordEmail,
    sendEmployerOtpEmail,
    sendEmployerWelcomeEmail
} = require('../utils/sendEmailSES');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ======================================================
// 0. LOCAL IMAGE HELPER (Replacing uploadImageFromUrl)
// ======================================================
const saveImageLocally = async (url, userId) => {
    try {
        const folderPath = path.join(__dirname, '../uploads/photos');
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

        const filename = `google-${userId}-${Date.now()}.jpg`;
        const filePath = path.join(folderPath, filename);

        const response = await axios({ url, responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(`/uploads/photos/${filename}`));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error("❌ Image Sync Error:", error.message);
        return url; // Fallback to Google URL if local save fails
    }
};

const resolveRole = (shortRole) => {
    if (shortRole === 'cand') return 'candidate';
    if (shortRole === 'cmp') return 'employee';
    return shortRole || 'candidate';
};

// 🟢 GOOGLE STEP 1: VERIFY & CHECK EXISTENCE
exports.googleLogin = async (req, res) => {
    try {
        const { idToken, role } = req.body;

        if (!idToken || !role) {
            return res.status(400).json({ success: false, message: "ID Token and Role are required" });
        }

        const dbRole = resolveRole(role);

        // 1. Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // 2. Search for existing user
        let user;
        if (dbRole === 'employee') {
            user = await EmployeeUser.findOne({ empemail: email });
        } else {
            user = await CandidateUser.findOne({ canemail: email });
        }

        // 3. If User NOT Found -> Send data back to Frontend for Step 2
        if (!user) {
            return res.json({
                success: true,
                needsPhone: true,
                googlePayload: { email, name, picture, googleId, role: dbRole }
            });
        }

        // 4. Handle Profile Picture Sync if needed
        let finalPicture = user.profilePicture || picture;
        if (picture && !user.profilePicture) {
            const localUrl = await saveImageLocally(picture, user._id.toString());
            user.profilePicture = localUrl;
            await user.save();
            finalPicture = localUrl;

            if (dbRole === 'candidate') {
                await CandidateProfile.findOneAndUpdate({ candidateUserId: user._id }, { $set: { "personal.profilePhoto": localUrl } });
            } else {
                await CompanyProfile.findOneAndUpdate({ employeeUserId: user._id }, { $set: { companyLogo: localUrl } });
            }
        }

        // 5. If User Exists -> Standard Login
        const token = jwt.sign(
            { id: user._id, role: dbRole },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                role: dbRole,
                name: dbRole === 'employee' ? user.empname : user.canname,
                email: dbRole === 'employee' ? user.empemail : user.canemail,
                phone: dbRole === 'employee' ? user.empphone : user.canphone,
                picture: finalPicture
            }
        });

    } catch (error) {
        console.error("Google Login Step 1 Error:", error);
        res.status(401).json({ success: false, message: "Verification failed" });
    }
};

// 🟢 GOOGLE STEP 2: REQUEST OTP FOR PHONE
exports.googleRequestOTP = async (req, res) => {
    try {
        const { phone, role, email, name } = req.body;

        if (!phone || !role) {
            return res.status(400).json({ success: false, message: "Phone and role are required" });
        }

        // 1. Check if phone is already registered
        let existing;
        if (role === 'employee') {
            existing = await EmployeeUser.findOne({ empphone: phone });
        } else {
            existing = await CandidateUser.findOne({ canphone: phone });
        }

        if (existing) {
            return res.status(400).json({ success: false, message: "This phone number is already registered. Please Login." });
        }

        // 2. Generate and Save OTP
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        await Otp.findOneAndUpdate(
            { phone },
            { otp: newOtp },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`\n📧 GOOGLE REGISTER OTP for ${phone}: ${newOtp}\n`);

        // 3. Send OTP via Email (if email available from Google payload)
        if (email) {
            if (role === 'employee') {
                await sendEmployerOtpEmail({ to: email, name: name || 'Employer', otp: newOtp });
            } else {
                await sendOtpEmail({ to: email, name: name || 'Candidate', otp: newOtp });
            }
        }

        res.json({ success: true, message: "OTP sent successfully" });

    } catch (error) {
        console.error("Google Request OTP Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 GOOGLE STEP 3: FINALIZE REGISTRATION WITH OTP VERIFICATION
exports.googleFinish = async (req, res) => {
    try {
        const { email, name, googleId, phone, role, picture, otp, referredBy, referrerName, referrerPhone } = req.body;

        if (!email || !name || !googleId || !phone || !role || !otp) {
            return res.status(400).json({ success: false, message: "All fields including OTP are required" });
        }

        // 1. Verify OTP
        const otpRecord = await Otp.findOne({ phone, otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // 2. Final check for collisions (just in case)
        let existing;
        if (role === 'employee') {
            existing = await EmployeeUser.findOne({ empphone: phone });
        } else {
            existing = await CandidateUser.findOne({ canemail: email });
        }

        if (existing) {
            return res.status(400).json({ success: false, message: "User already registered" });
        }

        // 3. Create the User
        let user;
        const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

        if (role === 'employee') {
            user = await EmployeeUser.create({
                empname: name,
                empemail: email,
                empphone: phone,
                passwordHash,
                role: 'employee',
                isVerified: true,
                googleId,
                profilePicture: picture,
                referredBy: referredBy || "None",
                referrerName: referrerName || null,
                referrerPhone: referrerPhone || null
            });
        } else {
            user = await CandidateUser.create({
                canname: name,
                canemail: email,
                canphone: phone,
                passwordHash,
                role: 'candidate',
                isVerified: true,
                googleId,
                profilePicture: picture,
                referredBy: referredBy || "None",
                referrerName: referrerName || null,
                referrerPhone: referrerPhone || null
            });
        }

        // 4. Handle Profile Picture Upload to S3
        let localPicUrl = picture;
        if (picture) {
            localPicUrl = await saveImageLocally(picture, user._id.toString());
            user.profilePicture = localPicUrl;
            await user.save();
        }

        // 5. Pre-fill Profile with name, email, phone and picture
        if (role === 'candidate') {
            await CandidateProfile.findOneAndUpdate(
                { candidateUserId: user._id },
                {
                    $set: {
                        personal: {
                            canname: name,
                            canemail: email,
                            canphone: phone,
                            profilePhoto: localPicUrl || picture,
                            jobSearchStatus: "Actively Looking",
                            profileVisibility: true
                        }
                    }
                },
                { upsert: true }
            );
        } else {
            await CompanyProfile.findOneAndUpdate(
                { employeeUserId: user._id },
                {
                    $set: {
                        empcomNam: name,
                        empemail: email,
                        empphone: phone,
                        companyLogo: localPicUrl || picture,
                    }
                },
                { upsert: true }
            );
        }

        // 6. Delete the OTP record after success
        await Otp.deleteOne({ _id: otpRecord._id });

        // 7. Auth Token
        const token = jwt.sign(
            { id: user._id, role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "30d" }
        );

        // 8. Send Welcome Email
        if (role === 'employee') {
            sendEmployerWelcomeEmail({ to: email, name }).catch(err =>
                console.error('Welcome email error (googleFinish - employer):', err.message)
            );
        } else {
            sendWelcomeEmail({ to: email, name }).catch(err =>
                console.error('Welcome email error (googleFinish):', err.message)
            );
        }

        res.status(201).json({
            success: true,
            message: "Registration Complete",
            token,
            user: {
                id: user._id,
                role: role,
                name: name,
                email: email,
                phone: phone,
                picture: localPicUrl || picture
            }
        });

    } catch (error) {
        console.error("Google Login Step 3 Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



// ==========================================
// 1. SMART REGISTER (Handles Both OTP Send & Verification)
// ==========================================
exports.registerUser = async (req, res) => {
    try {
        const { role, password, otp, referredBy, referrerName, referrerPhone } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, message: "Role is required" });
        }

        const dbRole = resolveRole(role);

        // -----------------------------------------------------
        // MODE 1: VERIFY OTP & FINALIZE REGISTRATION
        // (Runs if 'otp' is provided in the request)
        // -----------------------------------------------------
        if (otp) {
            let user;
            const { canemail, empemail } = req.body;
            const email = dbRole === 'employee' ? empemail : canemail;

            if (!email) return res.status(400).json({ success: false, message: "Email is required for verification" });

            // Find User
            if (dbRole === 'employee') {
                user = await EmployeeUser.findOne({ empemail: email });
            } else {
                user = await CandidateUser.findOne({ canemail: email });
            }

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found. Please request OTP first." });
            }

            // Verify OTP
            if (user.otp !== otp) {
                return res.status(400).json({ success: false, message: "Invalid OTP" });
            }

            // Mark Verified & Log In
            user.isVerified = true;
            user.otp = null;
            await user.save();

            const token = jwt.sign(
                { id: user._id, role: dbRole },
                process.env.JWT_SECRET || "secret",
                { expiresIn: "30d" }
            );

            // Send Welcome Email after successful verification
            const verifiedName = dbRole === 'employee' ? user.empname : user.canname;
            const verifiedEmail = dbRole === 'employee' ? user.empemail : user.canemail;

            if (dbRole === 'employee') {
                sendEmployerWelcomeEmail({ to: verifiedEmail, name: verifiedName }).catch(err =>
                    console.error('Welcome email error (registerUser verify - employer):', err.message)
                );
            } else {
                sendWelcomeEmail({ to: verifiedEmail, name: verifiedName }).catch(err =>
                    console.error('Welcome email error (registerUser verify):', err.message)
                );
            }

            return res.json({
                success: true,
                message: "Registration Successful & Verified",
                token,
                user: {
                    id: user._id,
                    role: dbRole,
                    name: verifiedName,
                    email: verifiedEmail,
                    phone: dbRole === 'employee' ? user.empphone : user.canphone
                }
            });
        }

        // -----------------------------------------------------
        // MODE 2: SAVE DETAILS & SEND OTP
        // (Runs if 'otp' is NOT provided)
        // -----------------------------------------------------
        else {
            if (!password) {
                return res.status(400).json({ success: false, message: "Password is required" });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            let user;
            let email;

            // 🅰️ EMPLOYEE
            if (dbRole === "employee") {
                const { empname, empemail, empphone } = req.body;
                email = empemail;

                if (!empname || !empemail || !empphone) {
                    return res.status(400).json({ success: false, message: "All fields are required" });
                }

                user = await EmployeeUser.findOne({ $or: [{ empemail }, { empphone }] });

                if (user && user.isVerified) {
                    return res.status(400).json({ success: false, message: "User already exists. Please Login." });
                }

                if (!user) {
                    user = new EmployeeUser({
                        empname, empemail, empphone, passwordHash, role: "employee", isVerified: false, referredBy: referredBy || "None", referrerName: referrerName || null, referrerPhone: referrerPhone || null
                    });
                } else {
                    // Update existing unverified user
                    user.empname = empname;
                    user.empphone = empphone;
                    user.passwordHash = passwordHash;
                    if (referredBy) user.referredBy = referredBy;
                    if (referrerName) user.referrerName = referrerName;
                    if (referrerPhone) user.referrerPhone = referrerPhone;
                }
            }
            // 🅱️ CANDIDATE
            else {
                const { canname, canemail, canphone } = req.body;
                email = canemail;

                if (!canname || !canemail || !canphone) {
                    return res.status(400).json({ success: false, message: "All fields are required" });
                }

                user = await CandidateUser.findOne({ $or: [{ canemail }, { canphone }] });

                if (user && user.isVerified) {
                    return res.status(400).json({ success: false, message: "User already exists. Please Login." });
                }

                if (!user) {
                    user = new CandidateUser({
                        canname, canemail, canphone, passwordHash, role: "candidate", isVerified: false, referredBy: referredBy || "None", referrerName: referrerName || null, referrerPhone: referrerPhone || null
                    });
                } else {
                    // Update existing unverified user
                    user.canname = canname;
                    user.canphone = canphone;
                    user.passwordHash = passwordHash;
                    if (referredBy) user.referredBy = referredBy;
                    if (referrerName) user.referrerName = referrerName;
                    if (referrerPhone) user.referrerPhone = referrerPhone;
                }
            }

            // Generate OTP
            const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            user.otp = newOtp;
            await user.save();

            console.log(`\n📧 REGISTER OTP for ${email}: ${newOtp}\n`);

            // Send OTP via Email (real-time AWS SES)
            if (dbRole === 'employee') {
                await sendEmployerOtpEmail({
                    to: email,
                    name: user.empname,
                    otp: newOtp
                });
            } else {
                await sendOtpEmail({
                    to: email,
                    name: user.canname,
                    otp: newOtp
                });
            }

            return res.json({
                success: true,
                message: `Registration started. OTP sent to ${email}`
            });
        }

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. EMAIL LOGIN (STANDARD: EMAIL + PASSWORD)
// ==========================================
exports.loginEmail = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: "Email, Password, and Role are required" });
        }

        const dbRole = resolveRole(role);
        let user;

        if (dbRole === 'employee') {
            user = await EmployeeUser.findOne({ empemail: email });
        } else {
            user = await CandidateUser.findOne({ canemail: email });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if verified (Optional security step)
        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: "Account not verified. Please complete registration." });
        }

        // ✅ Check Password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect Password" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: dbRole },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                role: dbRole,
                name: dbRole === 'employee' ? user.empname : user.canname,
                email: dbRole === 'employee' ? user.empemail : user.canemail,
                phone: dbRole === 'employee' ? user.empphone : user.canphone,
                picture: user.profilePicture
            }
        });

    } catch (error) {
        console.error("Email Login Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. SMART MOBILE LOGIN (Handles Both Request & Verify)
// ==========================================
exports.loginMobile = async (req, res) => {
    try {
        const { mobile, role, otp } = req.body;

        if (!mobile || !role) {
            return res.status(400).json({ success: false, message: "Mobile and Role are required" });
        }

        const dbRole = resolveRole(role);
        let user;
        let userStatus = 1; // Default: 1 = Old User

        // Find User
        if (dbRole == 'employee') {
            user = await EmployeeUser.findOne({ empphone: mobile });
            console.log("🔍 Found User:", user);
        } else {
            user = await CandidateUser.findOne({ canphone: mobile });
        }

        // =====================================================
        // MODE 1: VERIFY OTP (If 'otp' is present)
        // =====================================================
        if (otp) {
            console.log("🔐 Mobile OTP Verification Attempt for:", user);
            if (!user) return res.status(404).json({ success: false, message: "User not found. Please request OTP first." });

            if (user.otp !== otp) {
                return res.status(400).json({ success: false, message: "Invalid OTP" });
            }

            // Clear OTP & Verify
            user.otp = null;
            if (!user.isVerified) user.isVerified = true; // Auto-verify on mobile login
            await user.save();

            // Generate Token
            const token = jwt.sign(
                { id: user._id, role: dbRole },
                process.env.JWT_SECRET || "secret",
                { expiresIn: "30d" }
            );

            return res.json({
                success: true,
                message: "Login Successful",
                token,
                user: {
                    id: user._id,
                    role: dbRole,
                    name: dbRole === 'employee' ? user.empname : user.canname,
                    email: dbRole === 'employee' ? user.empemail : user.canemail,
                    phone: dbRole === 'employee' ? user.empphone : user.canphone,
                    picture: user.profilePicture
                }
            });
        }

        // =====================================================
        // MODE 2: REQUEST OTP (If 'otp' is missing)
        // =====================================================
        else {
            // If User NOT Found -> Create New User (Status 0)
            if (!user) {
                userStatus = 0; // 0 = New User

                if (dbRole === 'employee') {
                    user = new EmployeeUser({
                        empphone: mobile,
                        role: 'employee',
                        empname: "New Employee",
                        empemail: `${mobile}@pending.com`,
                        isVerified: true,
                        passwordHash: "mobile-login-auto-generated"
                    });
                } else {
                    user = new CandidateUser({
                        canphone: mobile,
                        role: 'candidate',
                        canname: "New User",
                        canemail: `${mobile}@pending.com`,
                        isVerified: true,
                        passwordHash: "mobile-login-auto-generated"
                    });
                }
            }

            // Generate OTP
            const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            user.otp = newOtp;
            await user.save();

            console.log(`\n🔐 MOBILE OTP for ${mobile} (Status: ${userStatus}): ${newOtp}\n`);

            return res.json({
                success: true,
                message: `OTP sent to ${mobile}`,
                isNewUser: userStatus === 0,
                userStatus: userStatus,      // 0 = New, 1 = Old
                test_otp: newOtp
            });
        }

    } catch (error) {
        console.error("Mobile Login Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 6. FORGOT PASSWORD (Generate Reset Link)
// ==========================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ success: false, message: "Email and Role are required" });
        }

        // 1. Resolve Role & Find User
        let user;
        const dbRole = role === 'cmp' ? 'employee' : (role === 'cand' ? 'candidate' : role);

        if (dbRole === 'employee') {
            user = await EmployeeUser.findOne({ empemail: email });
        } else {
            user = await CandidateUser.findOne({ canemail: email });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with this email." });
        }

        // 2. Generate Reset Token (Using the method from your Model)
        const resetToken = user.getResetPasswordToken();

        // 3. Save to DB (Validate false to skip other checks)
        await user.save({ validateBeforeSave: false });

        // 4. Create the Reset URL (Matches your Frontend Route)
        // ⚠️ Make sure this port (5173) matches your Frontend running port
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // 🟢 NEW: Send Email instead of just logging to terminal
        const name = dbRole === 'employee' ? user.empname : user.canname;
        await sendForgotPasswordEmail({ to: email, name, resetLink: resetUrl });

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email."
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 7. RESET PASSWORD WITH TOKEN (Verify & Update)
// ==========================================
exports.resetPasswordWithToken = async (req, res) => {
    try {
        // 1. Hash the token from the URL to match the one in DB
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // 2. Try to find user in BOTH collections with valid token & expiration
        let user = await CandidateUser.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            user = await EmployeeUser.findOne({
                resetPasswordToken,
                resetPasswordExpire: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // 3. Set New Password
        user.passwordHash = await bcrypt.hash(req.body.password, 10);

        // 4. Clear the reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully! You can now login." });

    } catch (error) {
        console.error("Reset Token Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 9. DELETE ACCOUNT (Permanent — Cascade)
// ==========================================
exports.deleteAccount = async (req, res) => {
    try {
        const { id, role } = req.user; // From JWT via protect middleware

        // Lazy-require related models to avoid circular dependency risks
        const Application = require('../models/Application');
        const Bookmark = require('../models/Bookmark');
        const Notification = require('../models/Notification');

        if (role === 'employee' || role === 'employer') {
            // 1. Delete employer user
            const user = await EmployeeUser.findByIdAndDelete(id);
            if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

            // 2. Cascade: company profile
            await CompanyProfile.deleteOne({ employeeUserId: id });

            // 3. Cascade: notifications sent/received
            await Notification.deleteMany({ $or: [{ userId: id }, { senderId: id }] });

            return res.status(200).json({
                success: true,
                message: 'Employer account and all associated data have been permanently deleted.'
            });

        } else {
            // 1. Delete candidate user
            const user = await CandidateUser.findByIdAndDelete(id);
            if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

            // 2. Cascade: candidate profile
            await CandidateProfile.deleteOne({ candidateUserId: id });

            // 3. Cascade: applications & bookmarks
            await Application.deleteMany({ candidateId: id });
            await Bookmark.deleteMany({ candidateId: id });

            // 4. Cascade: notifications
            await Notification.deleteMany({ userId: id });

            return res.status(200).json({
                success: true,
                message: 'Candidate account and all associated data have been permanently deleted.'
            });
        }

    } catch (error) {
        console.error('❌ Delete Account Error:', error);
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

// ==========================================
// 7. UTILITIES (Fix DB)
// ==========================================
exports.fixDatabaseIndexes = async (req, res) => {
    try {
        try { await CandidateUser.collection.dropIndex("phone_1"); } catch (e) { }
        try { await CandidateUser.collection.dropIndex("email_1"); } catch (e) { }
        try { await EmployeeUser.collection.dropIndex("phone_1"); } catch (e) { }
        try { await EmployeeUser.collection.dropIndex("email_1"); } catch (e) { }
        res.send("✅ Database Indexes Fixed!");
    } catch (error) {
        res.status(500).send("❌ Error: " + error.message);
    }
};

// ==========================================
// 8. CHANGE PASSWORD (Logged-in User)
// ==========================================
exports.resetPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const { id, role } = req.user; // Extracted from the token by 'protect' middleware

        let user;

        // 🟢 FIX: Check for BOTH 'employee' AND 'employer' to be safe
        if (role === "employee" || role === "employer") {
            user = await EmployeeUser.findById(id);
        } else {
            // Default to Candidate
            user = await CandidateUser.findById(id);
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // 1. Verify Old Password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password." });
        }

        // 2. Hash New Password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};