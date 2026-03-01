const mongoose = require("mongoose");
// 🟢 NEW: Import the centralized filter constants
const { JOB_FILTERS } = require("../../utils/filterConstants");

const JobSchema = new mongoose.Schema({
  // ==============================
  // 🔗 INTERNAL LINKS
  // ==============================
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmployeeUser",
    required: true
  },
  status: {
    type: String,
    default: "active"
  },

  // ==============================
  // 🏭 COMPANY INFO
  // ==============================
  cmpProfile: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyProfile" },
  cmpName: { type: String },
  cmpLogo: { type: String },
  cmpWeb: { type: String },

  // ==============================
  // 🟢 ON JOB TRAINING (OJT)
  // ==============================
  ojtAvailable: { type: Boolean, default: false },
  ojtDuration: { type: String },
  ojtStipend: { type: String },

  // ==============================
  // 📄 JOB DETAILS
  // ==============================
  jobTit: { type: String, required: true, trim: true },

  jobInd: {
    type: String,
    required: true
  },

  jobTyp: {
    type: String,
    required: true
  },

  // 🟢 NEW FIELDS FOR SPECIFIC LOGIC
  jobTime: { type: String }, // Stores "10:00 AM - 6:00 PM"
  conDur: { type: String },  // Stores "6 Months"

  jobMod: {
    type: String,
    required: true
  },

  // --- LOCATION ---
  jobDist: { type: String },
  jobCity: { type: String },
  jobArea: { type: String },
  jobPin: { type: String },
  jobState: { type: String, default: "Tamil Nadu" },
  jobAddr: { type: String },

  jobCat: { type: String, default: "Private" },

  // ==============================
  // 💰 PAY & BENEFITS
  // ==============================
  salTyp: {
    type: String,
    default: "Monthly"
  },
  salMin: { type: Number },
  salMax: { type: Number },
  salary_range: { type: String },

  jobBen: { type: [String], default: [] }, // Can be validated in controller if needed

  // Description
  jobDesc: { type: String, required: true },

  // Skills
  reqSkills: [String],
  addSkills: [String],

  // ==============================
  // 🎓 REQUIREMENTS
  // ==============================

  eduLvl: {
    type: String,
    required: true
  },

  eduCourse: { type: String },
  eduSpec: { type: String },

  expLvl: {
    type: String,
    required: true
  },

  ageLim: { type: String },
  genPref: {
    type: String,
    default: "Any"
  },
  openings: { type: Number, default: 1 },

  notPer: {
    type: String,
    default: "Immediate"
  },
  contactName: {
    type: String,
    required: true,
    default: "HR Manager"
  },
  contactPhone: {
    type: String,
    required: true
  },

  deadline: { type: Date, required: true },

  // 🟢 EXPLICIT TIMESTAMPS (To allow refreshing 'Posted Date')
  createdAt: { type: Date, default: Date.now, immutable: false },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the 'updatedAt' field on every save
JobSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
JobSchema.index({ jobDist: 1 });
JobSchema.index({ jobTit: 'text' });
JobSchema.index({ postedBy: 1 });

// Static method to update expired jobs
JobSchema.statics.updateExpiredJobs = async function () {
  const now = new Date();
  try {
    // 1. Find jobs that are active but past their deadline
    const expiredJobs = await this.find({
      status: "active",
      deadline: { $lt: now }
    }).populate('postedBy', 'empname empemail');

    if (expiredJobs.length > 0) {
      // 2. Mark them as expired in bulk
      const expiredIds = expiredJobs.map(j => j._id);
      await this.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: "expired" } }
      );

      // 3. 📧 Trigger Deadline Completion Emails
      // We require it inside to avoid circular dependencies with models
      const { sendJobDeadlineCompletedEmail } = require('../../utils/sendEmailSES');

      expiredJobs.forEach(job => {
        if (job.postedBy && job.postedBy.empemail) {
          sendJobDeadlineCompletedEmail({
            to: job.postedBy.empemail,
            name: job.postedBy.empname,
            jobTitle: job.jobTit
          }).catch(err => console.error(`Job Deadline Email Error (${job.jobTit}):`, err.message));
        }
      });

      console.log(`[JOB CRON] ${expiredJobs.length} jobs expired and notifications sent.`);
    }
  } catch (error) {
    console.error("Error updating expired jobs:", error);
  }
};

module.exports = mongoose.model("Job", JobSchema, "jobpostings");