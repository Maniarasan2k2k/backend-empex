const mongoose = require("mongoose");

// Sub-schema for Documents
const DocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['pan', 'gst', 'udyam', 'cin']
  },
  number: {
    type: String,
    required: true
  },
  // 🟢 ADD THESE BACK so MongoDB can store the S3 Link!
  fileUrl: { type: String },
  fileName: { type: String }
}, { _id: false });

const CompanyProfileSchema = new mongoose.Schema({
  employeeUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeUser', required: true },

  // --- PAGE 1: Basic Info ---
  empdesig: String,
  empcomNam: String,
  empname: String,
  empindTyp: String,
  empaddr: String,
  emplocal: String,
  empdist: String,
  empstate: String,
  emppin: String,
  empphone: String,
  empaltPhone: String,
  empweb: String,
  empstf: String,
  empabout: String,

  // --- PAGE 2: Logo & Documents ---
  companyLogo: { type: String, default: null },

  documents: {
    type: [DocumentSchema],
    default: []
  },

  empisVer: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("CompanyProfile", CompanyProfileSchema);