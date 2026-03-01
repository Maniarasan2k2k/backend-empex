const Meeting = require("../../models/Meeting");
const EmployeeUser = require("../../models/EmployeeUser");
const AuditLog = require("../../models/AuditLog");

/**
 * HELPER: Audit Log
 */
const logMeetingAction = async ({ req, action, meetingId, details, status = "SUCCESS" }) => {
    try {
        await AuditLog.create({
            user: req.user?._id,
            performedBy: req.user?._id,
            userEmail: req.user?.email || "N/A",
            userRole: req.user?.role?.key || "N/A",
            module: "MEETING_MODULE",
            action,
            status,
            entity: "MEETING",
            entityId: meetingId,
            details: details || "",
            timestamp: new Date(),
        });
    } catch (err) {
        console.error("MEETING AUDIT LOG ERROR:", err.message);
    }
};

/**
 * GET ALL MEETINGS
 */
const getAllMeetings = async (req, res) => {
    try {
        const { status, employer, date } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (employer) filter.employer = employer;
        if (date) filter.date = date;

        const meetings = await Meeting.find(filter)
            .populate("employer", "empname empemail")
            .sort({ createdAt: -1 });

        await logMeetingAction({
            req,
            action: "FETCH_MEETINGS",
            meetingId: "ALL",
            details: "Fetched all meetings",
        });

        res.json({ success: true, data: meetings });
    } catch (err) {
        await logMeetingAction({
            req,
            action: "FETCH_MEETINGS",
            meetingId: "ALL",
            details: err.message,
            status: "FAILED",
        });

        res.status(500).json({ message: err.message });
    }
};

/**
 * GET SINGLE MEETING
 */
const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate("employer", "empname empemail");

        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });

        await logMeetingAction({
            req,
            action: "FETCH_MEETING",
            meetingId: meeting._id,
            details: "Fetched single meeting",
        });

        res.json({ success: true, data: meeting });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * UPDATE STATUS
 */
const updateMeetingStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;

        const meeting = await Meeting.findById(req.params.id);
        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });

        const oldStatus = meeting.status;

        meeting.status = status;
        meeting.blockedReason = reason || null;
        meeting.blockedBy = req.user._id;

        await meeting.save();

        await logMeetingAction({
            req,
            action: "UPDATE_MEETING_STATUS",
            meetingId: meeting._id,
            details: `Status changed from ${oldStatus} to ${status}`,
        });

        res.json({
            success: true,
            message: "Meeting status updated",
        });
    } catch (err) {
        await logMeetingAction({
            req,
            action: "UPDATE_MEETING_STATUS",
            meetingId: req.params.id,
            details: err.message,
            status: "FAILED",
        });

        res.status(500).json({ message: err.message });
    }
};

/**
 * DELETE MEETING
 */
const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });

        await meeting.deleteOne();

        await logMeetingAction({
            req,
            action: "DELETE_MEETING",
            meetingId: meeting._id,
            details: "Meeting deleted",
        });

        res.json({
            success: true,
            message: "Meeting deleted successfully",
        });
    } catch (err) {
        await logMeetingAction({
            req,
            action: "DELETE_MEETING",
            meetingId: req.params.id,
            details: err.message,
            status: "FAILED",
        });

        res.status(500).json({ message: err.message });
    }
};

/**
 * TOGGLE BLOCK / UNBLOCK
 */
const toggleMeetingBlock = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });

        let action = "";
        let message = "";

        if (meeting.status === "BLOCKED") {
            meeting.status = "UPCOMING";
            meeting.blockedReason = null;
            meeting.blockedBy = null;
            action = "UNBLOCK_MEETING";
            message = "Meeting unblocked";
        } else {
            meeting.status = "BLOCKED";
            meeting.blockedReason = "Blocked by admin";
            meeting.blockedBy = req.user._id;
            action = "BLOCK_MEETING";
            message = "Meeting blocked";
        }

        await meeting.save();

        await logMeetingAction({
            req,
            action,
            meetingId: meeting._id,
            details: message,
        });

        res.json({
            success: true,
            message,
            data: meeting,
        });
    } catch (err) {
        await logMeetingAction({
            req,
            action: "TOGGLE_MEETING_BLOCK",
            meetingId: req.params.id,
            details: err.message,
            status: "FAILED",
        });

        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllMeetings,
    getMeetingById,
    updateMeetingStatus,
    deleteMeeting,
    toggleMeetingBlock,
};
