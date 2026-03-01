// controllers/mobileController.js

// 🟢 Import the new Unified Model
const CandidateProfile = require('../models/Candidate/CandidateProfile');
const Application = require('../models/Application');
const Job = require('../models/Employee/Job');

// 1. Helper: Parse DD/MM/YYYY or YYYY-MM-DD to Date object
const parseInterviewDate = (dateStr) => {
    if (!dateStr) return null;

    // Check for DD/MM/YYYY
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    // Default to standard Date constructor (e.g. YYYY-MM-DD)
    return new Date(dateStr);
};

// 2. Helper: Group applications by company
const groupByCompany = (apps) => {
    const groups = {};
    apps.forEach(app => {
        const companyName = app.jobId?.cmpName || "Unknown Company";
        if (!groups[companyName]) {
            groups[companyName] = {
                companyName,
                companyLogo: app.jobId?.cmpLogo || "",
                count: 0,
                interviews: []
            };
        }
        groups[companyName].interviews.push(app);
        groups[companyName].count++;
    });
    return Object.values(groups).map(group => ({
        ...group,
        interviews: group.interviews.sort((a, b) => {
            // Sort interviews within company by time? Or date?
            return 0;
        })
    }));
};

// 3. The Master "Get Profile" Function for Android
exports.getMobileProfile = async (req, res) => {
    try {
        console.log("📱 Mobile App requesting full profile...");
        const userId = req.user.id; // Comes from your Token

        // Fetch EVERYTHING from the Single Collection
        const profile = await CandidateProfile.findOne({ candidateUserId: userId });

        // Send One Clean JSON Response
        res.status(200).json({
            success: true,
            message: "Mobile Profile Data Fetched Successfully",
            data: {
                personal: profile?.personal || {},
                education: profile?.education || [],
                experience: profile?.experience || [],
                internships: profile?.internships || [],
                projects: profile?.projects || [],
                skills: profile?.skills || [],
                languages: profile?.languages || []
            }
        });

    } catch (error) {
        console.error("❌ Mobile Profile Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error Fetching Mobile Profile" });
    }
};

// 4. GET Interviews for Mobile (Categorized: Today, Future, Completed)
exports.getMobileInterviews = async (req, res) => {
    try {
        console.log("📱 Mobile App requesting upcoming interviews...");
        const userId = req.user.id;

        // Fetch all applications that have interview details or are scheduled
        const applications = await Application.find({
            candidateId: userId,
            $or: [
                { status: 'Interview Scheduled' },
                { status: 'Shortlisted' },
                { status: 'Selected' },
                { status: 'Hired' },
                { status: 'Rejected' },
                { interviewDate: { $exists: true, $ne: "" } }
            ]
        })
            .populate('jobId', 'jobTit cmpName cmpLogo jobDist jobCity jobState')
            .sort({ createdAt: -1 })
            .lean();

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const todayInterviews = [];
        const futureInterviews = [];
        const completedInterviews = [];

        applications.forEach(app => {
            const intDate = parseInterviewDate(app.interviewDate);

            // If it's Hired, Rejected or Selected, it goes to Completed regardless of date
            if (['Hired', 'Rejected', 'Selected'].includes(app.status)) {
                completedInterviews.push(app);
            }
            else if (intDate) {
                // Create a copy to compare without affecting original if needed
                const compareDate = new Date(intDate);
                compareDate.setHours(0, 0, 0, 0);

                if (compareDate.getTime() === todayDate.getTime()) {
                    todayInterviews.push(app);
                } else if (compareDate.getTime() > todayDate.getTime()) {
                    futureInterviews.push(app);
                } else {
                    completedInterviews.push(app);
                }
            } else {
                // If no date but status is shortlisted, maybe it's "Future" (needs scheduling) 
                // but usually "Upcoming Interviews" refers to scheduled ones.
                // Based on screenshot, they all have dates.
            }
        });

        res.status(200).json({
            success: true,
            data: {
                today: groupByCompany(todayInterviews),
                future: groupByCompany(futureInterviews),
                completed: groupByCompany(completedInterviews)
            }
        });

    } catch (error) {
        console.error("❌ Mobile Interviews Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error Fetching Interviews" });
    }
};
