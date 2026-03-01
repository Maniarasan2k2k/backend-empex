const mongoose = require("mongoose");
const crypto = require("crypto"); // 🟢 Import crypto

const candidateUserSchema = new mongoose.Schema({
  canname: { type: String, required: true },
  canemail: { type: String, unique: true, sparse: true },
  canphone: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { type: String, default: "candidate" },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },

  // 🟢 ADMIN FIELD: block/unblock candidate
  isBlocked: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false }, // 🚩 NEW: Fraud Flag

  // 🟢 REFERRAL TRACKING
  referredBy: { type: String, default: "None" }, // e.g., "Social Media", "Friend", "Newspaper"
  referrerName: { type: String, default: null }, // Only if referredBy === "Friend/Person"
  referrerPhone: { type: String, default: null }, // Only if referredBy === "Friend/Person"

  // 🟢 NEW FIELDS FOR FORGOT PASSWORD
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // 🟢 GOOGLE AUTH
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String, default: null },

  // 🟢 ADMIN AUDIT FIELDS
  lastLogin: { type: Date },
  deviceInfo: { type: String, default: null },
  ipAddress: { type: String, default: null },

}, { timestamps: true });

// 🟢 NEW METHOD: Generate Reset Token
candidateUserSchema.methods.getResetPasswordToken = function () {
  // 1. Generate Token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 2. Hash it and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set Expiration (10 Minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Return unhashed token
};

// 🟢 Hide sensitive fields when sending to frontend
candidateUserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.otp;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model("CandidateUser", candidateUserSchema);