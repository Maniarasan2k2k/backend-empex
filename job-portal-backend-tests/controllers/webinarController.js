const Webinar = require('../models/Webinar');
const WebinarPayment = require('../models/WebinarPayment');

// 1. GET ALL WEBINARS (Public)
exports.getAllWebinars = async (req, res) => {
    try {
        const now = new Date();
        const cutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago

        // Sort by startTime
        // We filter: endTime must be GREATER than (now - 24hrs)
        const webinars = await Webinar.find({
            endTime: { $gt: cutoff }
        }).sort({ startTime: 1 });

        // DYNAMIC STATUS: We update labels (Live/Upcoming/Completed) based on current time
        const processedWebinars = webinars.map(webinar => {
            const w = webinar.toObject();
            const start = new Date(w.startTime);
            const end = new Date(w.endTime);

            if (now < start) w.status = 'Upcoming';
            else if (now >= start && now <= end) w.status = 'Live';
            else w.status = 'Completed';

            return w;
        });

        res.json({ success: true, count: processedWebinars.length, data: processedWebinars });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. CREATE WEBINAR (Admin)
exports.createWebinar = async (req, res) => {
    try {
        const webinar = await Webinar.create(req.body);
        res.status(201).json({ success: true, message: "Webinar Created", data: webinar });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 3. ENROLL / RECORD PAYMENT (Candidate)
exports.enrollWebinar = async (req, res) => {
    try {
        const { webinarId, amount, transactionId, paymentStatus } = req.body;
        const userId = req.user.id; // From Auth Middleware

        // Check if already enrolled
        const existing = await WebinarPayment.findOne({ candidateId: userId, webinarId: webinarId, paymentStatus: 'Success' });
        if (existing) {
            return res.status(400).json({ success: false, message: "You have already joined this webinar!" });
        }

        // Create Payment Record
        const enrollment = await WebinarPayment.create({
            candidateId: userId,
            webinarId,
            amount,
            transactionId: transactionId || `TXN_${Date.now()}`, // Fake ID if free
            paymentStatus: paymentStatus || 'Success'
        });

        res.json({ success: true, message: "Enrolled Successfully!", data: enrollment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. GET MY ENROLLED WEBINARS
exports.getMyWebinars = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find payments and populate webinar details
        const enrollments = await WebinarPayment.find({ candidateId: userId, paymentStatus: 'Success' })
            .populate('webinarId');

        res.json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};