// controllers/homeController.js

const Job = require("../models/Employee/Job");
const EmployeeUser = require("../models/EmployeeUser");
const Webinar = require("../models/Webinar");
const Tutorial = require("../models/Tutorial");
const Meeting = require("../models/Meeting");

exports.getHomeStats = async (req, res) => {
  try {
    // Auto-update expired jobs
    await Job.updateExpiredJobs();

    const vacancies = await Job.countDocuments({ status: "active" });
    const employers = await EmployeeUser.countDocuments({ role: "employee" });
    res.json({
      success: true,
      data: { vacancies, employers }
    });
  } catch (err) {
    console.error("Home Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = [];
    const now = new Date(); // Current server time

    // -------------------------------------------------------------------------
    // 1. Check for LIVE COMPANY MEETINGS (Parsed as IST +05:30)
    // -------------------------------------------------------------------------
    const meetings = await Meeting.find().sort({ createdAt: -1 }).limit(10);

    meetings.forEach(m => {
      // 🟢 FIX: Explicitly parse date/time as IST to avoid server-client mismatch
      const startStr = `${m.date}T${m.time}:00+05:30`;
      const meetingStart = new Date(startStr);

      const unlockTime = new Date(meetingStart.getTime() - 10 * 60000);
      const expiryTime = new Date(meetingStart.getTime() + 2 * 60 * 60 * 1000);

      if (now >= unlockTime && now <= expiryTime) {
        announcements.push({
          type: "LIVE",
          text: `🎥 LIVE NOW: ${m.title} by ${m.companyName || 'Hiring Team'} - Join Meeting`,
          link: `/candidate/meetings`,
          priority: 0.5,
          isStatic: false
        });
      } else if (now < unlockTime && now >= new Date(meetingStart.getTime() - 24 * 60 * 60 * 1000)) {
        announcements.push({
          type: "UPCOMING",
          text: `🕒 UPCOMING MEETING: ${m.title} today at ${m.time}`,
          link: `/candidate/meetings`,
          priority: 0.8,
          isStatic: false
        });
      }
    });

    // -------------------------------------------------------------------------
    // 2. Check for LIVE WEBINARS (Webinar model stores full Date objects)
    // -------------------------------------------------------------------------
    const liveWebinars = await Webinar.find({
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).limit(2);

    liveWebinars.forEach(w => {
      announcements.push({
        type: "LIVE",
        text: `🔴 LIVE NOW: ${w.title} - Full Training Session`,
        link: `/candidate/skill-training`,
        priority: 1,
        isStatic: false
      });
    });

    // Upcoming webinars
    const upcomingWebinars = await Webinar.find({
      startTime: { $gt: now, $lte: new Date(now.getTime() + 48 * 60 * 60 * 1000) }
    }).sort({ startTime: 1 }).limit(2);

    upcomingWebinars.forEach(w => {
      announcements.push({
        type: "UPCOMING",
        text: `🕒 NEXT WEBINAR: ${w.title} - Starting soon!`,
        link: `/candidate/skill-training`,
        priority: 2,
        isStatic: false
      });
    });

    // -------------------------------------------------------------------------
    // 3. Check for NEW SKILL TUTORIALS
    // -------------------------------------------------------------------------
    const recentTutorials = await Tutorial.find({
      createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(2);

    recentTutorials.forEach(t => {
      announcements.push({
        type: "INFO",
        text: `🎓 NEW SKILL: ${t.title} - Start learning now!`,
        link: `/candidate/learning/${t._id}`,
        priority: 2.5,
        isStatic: false
      });
    });

    // -------------------------------------------------------------------------
    // 4. FALLBACK: Static professional content (If nothing is "Active")
    // -------------------------------------------------------------------------
    if (announcements.length === 0) {
      announcements.push(
        { type: "INFO", text: "📺 LIVE SESSIONS: Expert interactive webinars every week", isStatic: true, priority: 3 },
        { type: "INFO", text: "🚀 SKILL TRAINING: Elevate your career with industry-led certifications", isStatic: true, priority: 3 },
        { type: "INFO", text: "📹 LEARNING VIDEOS: 500+ Top-tier skills tutorials available 24/7", isStatic: true, priority: 3 }
      );
    }

    res.json({
      success: true,
      data: announcements.sort((a, b) => a.priority - b.priority)
    });
  } catch (err) {
    console.error("Announcements Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};