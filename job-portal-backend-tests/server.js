const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // 🟢 FIXED: Added missing path module
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// 1. Connect to Database
connectDB();

// 2. Initialize HTTP Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // 🟢 UPDATED: Added your server IP and allowed all for Flutter/testing
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

// 3. Make 'io' accessible in your application controllers
app.set('socketio', io);

// 4. Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('⚡ User connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their notification room`);
    });

    socket.on('disconnect', () => {
        console.log('🔥 User disconnected');
    });
});

// 5. Middleware — CORS MUST be first, before body parsers
// origin: true mirrors the request's Origin back — allows all origins with credentials
app.use(cors({
    origin: true, // Reflects the request origin — works for all clients (web, mobile, Postman)
    credentials: true
}));

// Explicit OPTIONS preflight handler for all routes
app.options('*', cors({ origin: true, credentials: true }));

// Body parsers — AFTER cors, with 50mb limit to prevent 413 errors
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 6. Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/candidate', require('./routes/candidate'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/application', require('./routes/applicationRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/home', require('./routes/homeRoutes'));
app.use('/api/mobile', require('./routes/mobileRoutes'));
app.use("/api/tutorials", require("./routes/tutorialRoutes"));
app.use('/api/webinars', require('./routes/webinarRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/legal', require('./routes/legalRoutes'));   // Privacy Policy & Terms of Service
app.use('/api/faq', require('./routes/faqRoutes'));         // FAQ
app.use('/api/skill-trainings', require('./routes/skillTrainingRoutes'));

/* =========================================
   👑 ADMIN DASHBOARD ROUTES (RBAC)
========================================= */
app.use('/api/admin/auth', require('./routes/admin/adminAuthRoutes'));
app.use('/api/admin/users', require('./routes/admin/adminUsersRoutes'));
app.use('/api/admin/roles', require('./routes/admin/roleRoutes'));
app.use('/api/admin/permissions', require('./routes/admin/permissionsRoutes'));
app.use('/api/admin/candidates', require('./routes/admin/adminCandidateRoutes'));
app.use('/api/admin/employees', require('./routes/admin/adminEmployeeRoutes'));
app.use('/api/admin/applications', require('./routes/admin/adminApplicationsRoutes'));
app.use('/api/admin/jobs', require('./routes/admin/adminJobsRoutes'));
app.use('/api/admin/gov-jobs', require('./routes/admin/adminGovJobsRoutes'));
app.use('/api/admin/meetings', require('./routes/admin/adminMeetingsRoutes'));
app.use('/api/admin/webinars', require('./routes/admin/adminWebinarRoutes'));
app.use('/api/admin/tutorials', require('./routes/admin/adminTutorialRoutes'));
app.use('/api/admin/skill-trainings', require('./routes/admin/adminSkillTrainingRoutes'));
app.use('/api/admin/candidate-profiles', require('./routes/admin/adminCandidateProfileRoutes'));
app.use('/api/admin/bookmarks', require('./routes/admin/adminBookmarkRoutes'));
app.use('/api/admin/reports', require('./routes/admin/reportsRoutes'));
app.use('/api/admin/audit-logs', require('./routes/admin/adminAuditRoutes'));
app.use('/api/admin/dashboard', require('./routes/admin/adminDashboardRoutes'));
app.use('/api/admin/companies', require('./routes/admin/adminCompanyRoutes'));

// 🟢 FIXED: Static folder setup for localized 120GB storage
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send("empex Job Portal API is running"));

// 7. Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message
    });
});

// Port configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});