const Notification = require('../models/Notification');
const Job = require('../models/Employee/Job');
const User = require('../models/CandidateUser');
const EmployeeUser = require('../models/EmployeeUser');
const CompanyProfile = require('../models/Employee/CompanyProfile');
const { sendJobInvitationEmail } = require('../utils/sendEmailSES');

// ==========================================
// 1. SEND INVITATION (Employer to Candidate)
// ==========================================
exports.sendInvite = async (req, res) => {
    try {
        const { candidateId, jobId } = req.body;

        // 1. Fetch real Job Title from Database
        const job = await Job.findById(jobId).select('jobTit');
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found." });
        }

        // 2. Prevent duplicate invitations
        const existingInvite = await Notification.findOne({
            recipient: candidateId,
            relatedId: jobId, // Linking to the specific job
            type: 'invitation'
        });

        if (existingInvite) {
            return res.status(400).json({ success: false, message: "Invitation already sent for this job." });
        }

        // 3. Create Notification with Dynamic Model References
        const newNotification = new Notification({
            sender: req.user.id,
            senderModel: 'EmployeeUser',
            recipient: candidateId,
            recipientModel: 'CandidateUser',
            type: 'invitation',
            title: 'Job Invitation',
            message: `You have been invited to apply for the position of ${job.jobTit}.`,
            relatedId: jobId
        });

        await newNotification.save();

        // 5. Send Job Invitation Email
        const candidate = await User.findById(candidateId).select('canname canemail');
        const employerProfile = await CompanyProfile.findOne({ employeeUserId: req.user.id }).select('empcomNam');

        if (candidate && candidate.canemail) {
            sendJobInvitationEmail({
                to: candidate.canemail,
                name: candidate.canname,
                jobTitle: job.jobTit,
                companyName: employerProfile ? employerProfile.empcomNam : 'A top employer'
            }).catch(err => console.error("Job Invitation Email Error:", err.message));
        }

        // 4. Trigger Real-time Socket Ping
        const io = req.app.get('socketio');
        if (io) {
            io.to(candidateId.toString()).emit('new_ping', newNotification);
        }

        res.status(200).json({ success: true, message: "Invitation Sent Successfully!" });

    } catch (err) {
        console.error("Notification Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 2. FETCH NOTIFICATIONS (Generic for both roles)
// ==========================================
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. UTILITIES
// ==========================================
exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};