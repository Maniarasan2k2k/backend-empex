const mongoose = require("mongoose");
const { JOB_FILTERS } = require("../utils/filterConstants");

const GovJobSchema = new mongoose.Schema({
  // 1. Basic Info
  jobTit: { type: String, required: true },

  jobCat: {
    type: String,
    required: true,
    enum: ["Central Government", "State Government"],
  },

  // 2. Location
  jobDist: { type: String, required: true },
  jobCity: { type: String, required: true },
  jobState: { type: String, default: "Tamil Nadu" },

  // 3. The Visuals
  jobImage: { type: String, required: true },

  // 4. External Links
  officialLink: { type: String },
  notificationLink: { type: String },

  // 5. Details
  jobDesc: { type: String },
  reqDegrees: [{ type: String }],

  deadline: { type: Date, required: true },

  // 🔴 FIX IS HERE: Change "User" to "EmployeeUser"
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeUser" },

  status: { type: String, enum: ["active", "inactive", "expired"], default: "active" },
  views: { type: Number, default: 0 }

}, { timestamps: true });

// Static method to update expired jobs
GovJobSchema.statics.updateExpiredJobs = async function () {
  const now = new Date();
  try {
    await this.updateMany(
      {
        status: "active",
        deadline: { $lt: now }
      },
      {
        $set: { status: "expired" }
      }
    );
  } catch (error) {
    console.error("Error updating expired gov jobs:", error);
  }
};

module.exports = mongoose.model("GovJob", GovJobSchema);