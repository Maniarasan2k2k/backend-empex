const mongoose = require("mongoose");
// 🟢 NEW: Import the centralized filter constants
const { JOB_FILTERS } = require("../../utils/filterConstants");

// ==========================================
// 1. DEFINE SUB-SCHEMAS (The Lists)
// ==========================================

const EducationSchema = new mongoose.Schema({
  caneduQual: {
    type: String
  },
  caneduCrs: String,    // Course Name
  caneduSpc: String,    // Specialization
  caneduYr: String,     // Passing Year
  caneduIns: String,    // Institute
  caneduPct: String,    // Percentage
  caneduTyp: String,    // Course Type
  caneduCert: String    // Certificate URL
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ VIRTUAL PROPERTY
EducationSchema.virtual('educationStatus').get(function () {
  const currentYear = new Date().getFullYear();
  const passingYear = parseInt(this.caneduYr);

  if (!passingYear) return "";

  return passingYear >= currentYear ? "Studying" : "Passed Out";
});

const ExperienceSchema = new mongoose.Schema({
  canexpDesig: String,
  canexpOrg: String,
  canexpCurr: Boolean,
  canexpStYr: String,
  canexpStMo: String,
  canexpEdYr: String,
  canexpEdMo: String,
  canexpDesc: String,
  canexpCCm: String,
  canexpCRl: String,
  canexpSal: String,
  canexpTot: String,
  canexpCert: String
});

const InternshipSchema = new mongoose.Schema({
  canintComp: String,
  canintType: String,
  canintDur: String,
  canintStip: String,
  canintProj: String,
  canintResp: String,
  canintCert: String
});

const ProjectSchema = new mongoose.Schema({
  canproTit: String,
  canproDsc: String,
  canproUrl: String,
  canproDoc: String
});

const SkillSchema = new mongoose.Schema({
  canskicou: String,
  canskiMod: String,
  canskiPlt: String,
  canskiDur: String,
  canskiCer: String
});

const LanguageSchema = new mongoose.Schema({
  canlanNam: String,
  canlanLvl: String,
  canlanRed: Boolean,
  canlanWrt: Boolean,
  canlanSpk: Boolean
});

// ==========================================
// 2. MAIN SCHEMA (The Single Collection)
// ==========================================

const CandidateProfileSchema = new mongoose.Schema({
  candidateUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CandidateUser',
    required: true,
    unique: true
  },

  personal: {
    canname: String,
    canfatNam: String,
    candob: String,
    cangen: {
      type: String
    },
    canphone: String,
    canemail: String,
    canstreet: String,
    canarea: String,
    canareaTp: String,
    canstate: String,
    candist: String,
    cannation: String,
    canpin: String,
    canabout: String,
    profilePhoto: String,
    profileVisibility: { type: Boolean, default: true },

    // 🟢 UPDATED ENUM TO MATCH YOUR FRONTEND SCREENSHOT & CONSTANTS
    jobSearchStatus: {
      type: String,
      default: "Actively Looking"
    }
  },

  // 📂 Lists
  education: [EducationSchema],
  experience: [ExperienceSchema],
  internships: [InternshipSchema],
  projects: [ProjectSchema],
  skills: [SkillSchema],
  languages: [LanguageSchema],

  // 🟢 Job Preferences
  jobPreferences: {
    lookingFor: {
      type: String,
      enum: ['Jobs', 'Internships', 'Both'],  
      default: 'Both'
    },
    preferredRoles: {
      type: [String], // Can be validated against JOB_FILTERS.sectors in the controller
      default: []
    },
    preferredLocations: {
      type: [String], // Can be validated against JOB_FILTERS.locations in the controller
      default: []
    },
    expectedSalary: {
      type: Number,
      default: null
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model("CandidateProfile", CandidateProfileSchema);