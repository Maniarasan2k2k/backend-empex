const mongoose = require("mongoose");
const crypto = require("crypto"); // 🟢 Import crypto

const EmployeeUserSchema = new mongoose.Schema({
  empname: { type: String, required: true },
  empemail: { type: String, required: true, unique: true },
  empphone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "employee" },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  referredBy: { type: String, default: "None" },
  referrerName: { type: String, default: null },
  referrerPhone: { type: String, default: null },

  // 🟢 NEW FIELDS FOR FORGOT PASSWORD
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // 🟢 GOOGLE AUTH
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String, default: null }
}, { timestamps: true });

// 🟢 NEW METHOD: Generate Reset Token
EmployeeUserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("EmployeeUser", EmployeeUserSchema);