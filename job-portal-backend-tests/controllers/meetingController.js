const Meeting = require('../models/Meeting');
const CompanyProfile = require('../models/Employee/CompanyProfile');

// 1. CREATE Meeting
exports.createMeeting = async (req, res) => {
    try {
        const { title, topic, date, time, link } = req.body;
        
        // Fetch Company Profile to save Name/Logo snapshot
        const profile = await CompanyProfile.findOne({ employeeUserId: req.user.id });

        const newMeeting = new Meeting({
            employer: req.user.id, 
            companyName: profile ? profile.empcomNam : "Unknown Company",
            companyLogo: profile ? profile.companyLogo : "", 
            title,
            topic,
            date,
            time,
            link
        });

        await newMeeting.save();
        res.status(201).json(newMeeting);
    } catch (err) {
        console.error("Create Meeting Error:", err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 2. GET My Meetings (For Employer)
exports.getMyMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({ employer: req.user.id }).sort({ date: 1 });
        res.json(meetings);
    } catch (err) {
        console.error("Get My Meetings Error:", err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 3. GET ALL Meetings (For Candidate)
exports.getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find()
            .populate('employer', 'empname empemail') 
            .sort({ date: 1 });
            
        res.json(meetings);
    } catch (err) {
        console.error("Get All Meetings Error:", err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 4. DELETE Meeting
exports.deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        
        if (!meeting) {
            return res.status(404).json({ msg: 'Meeting not found' });
        }

        // Ensure user owns the meeting
        if (meeting.employer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await meeting.deleteOne();
        res.json({ msg: 'Meeting deleted' });
    } catch (err) {
        console.error("Delete Meeting Error:", err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};