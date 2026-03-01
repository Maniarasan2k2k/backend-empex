// backend/controllers/recommendationController.js - ENHANCED VERSION
const Job = require('../models/Employee/Job');
const CandidateProfile = require('../models/Candidate/CandidateProfile');

// 🛠️ HELPER: Calculate Match Score (ENHANCED)
const calculateScore = (job, profile) => {
    let score = 0;
    const reasons = [];

    // ==========================================
    // 1. JOB ROLE PREFERENCE MATCH (Weight: 35%)
    // ==========================================
    if (profile.jobPreferences?.preferredRoles && profile.jobPreferences.preferredRoles.length > 0) {
        const preferredRoles = profile.jobPreferences.preferredRoles.map(r => r.toLowerCase().trim());
        const jobTitle = (job.jobTit || '').toLowerCase();

        const roleMatch = preferredRoles.some(role =>
            jobTitle.includes(role) || role.includes(jobTitle)
        );

        if (roleMatch) {
            score += 35;
            reasons.push('Preferred Role Match');
        }
    }

    // ==========================================
    // 2. SKILLS MATCH (Weight: 25%)
    // ==========================================
    if (profile.skills && profile.skills.length > 0 && job.reqSkills && job.reqSkills.length > 0) {
        const userSkills = profile.skills
            .map(s => s.canskicou)
            .filter(Boolean)
            .map(skill => skill.toLowerCase().trim());

        const jobSkills = job.reqSkills
            .filter(Boolean)
            .map(s => s.toLowerCase().trim());

        const matchingSkills = jobSkills.filter(jobSkill =>
            userSkills.some(userSkill =>
                userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
            )
        );

        if (matchingSkills.length > 0) {
            const matchPercentage = matchingSkills.length / jobSkills.length;
            score += matchPercentage * 25;
            reasons.push(`Skills Match (${matchingSkills.length}/${jobSkills.length})`);
        }
    }

    // ==========================================
    // 3. LOCATION PREFERENCE MATCH (Weight: 20%)
    // ==========================================
    const jobDist = (job.jobDist || '').toLowerCase().trim();

    // Check preferred locations first
    if (profile.jobPreferences?.preferredLocations && profile.jobPreferences.preferredLocations.length > 0) {
        const preferredLocs = profile.jobPreferences.preferredLocations.map(l => l.toLowerCase().trim());

        if (preferredLocs.includes(jobDist)) {
            score += 20;
            reasons.push('Preferred Location');
        }
    } else {
        // Fallback to profile location
        const userDist = (profile.candist || profile.personal?.candist || '').toLowerCase().trim();
        if (userDist && jobDist && userDist === jobDist) {
            score += 20;
            reasons.push('Location Match');
        }
    }

    // ==========================================
    // 4. SALARY EXPECTATION MATCH (Weight: 10%)
    // ==========================================
    if (profile.jobPreferences?.expectedSalary) {
        const expectedSal = profile.jobPreferences.expectedSalary;
        const jobMinSal = parseInt(job.salMin) || 0;
        const jobMaxSal = parseInt(job.salMax) || 0;

        // Check if job salary meets or exceeds expectation
        if (jobMaxSal >= expectedSal || jobMinSal >= expectedSal * 0.8) {
            score += 10;
            reasons.push('Salary Match');
        }
    }

    // ==========================================
    // 5. EXPERIENCE MATCH (Weight: 10%)
    // ==========================================
    const hasExperience = profile.experience && profile.experience.length > 0;
    const jobExpLevel = (job.expLvl || '').toLowerCase();

    if (jobExpLevel.includes('fresher') || jobExpLevel.includes('0-1')) {
        if (!hasExperience || profile.experience.length <= 1) {
            score += 10;
            reasons.push('Entry Level Match');
        }
    } else {
        if (hasExperience) {
            score += 10;
            reasons.push('Experience Level Match');
        }
    }

    return { score, reasons };
};

// 🟢 MAIN API FUNCTION — with Pagination
// GET /api/jobs/recommended?page=1&limit=10
exports.getRecommendedJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        // ── Pagination params ─────────────────────────────────────────────────
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10)); // cap at 50
        const skip = (page - 1) * limit;

        // 1. Fetch Candidate Profile
        const profile = await CandidateProfile.findOne({ candidateUserId: userId });

        // ── No profile fallback: return latest jobs (paginated) ───────────────
        if (!profile) {
            const baseQuery = {
                status: 'active',
                $or: [
                    { deadline: { $exists: false } },
                    { deadline: { $gte: new Date() } }
                ]
            };

            const [totalJobs, jobs] = await Promise.all([
                Job.countDocuments(baseQuery),
                Job.find(baseQuery)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('-__v')
                    .lean()
            ]);

            return res.json({
                success: true,
                type: 'latest',
                message: 'Profile not found. Showing latest jobs.',
                totalJobs,
                totalPages: Math.ceil(totalJobs / limit),
                currentPage: page,
                limit,
                jobs
            });
        }

        // 2. Build Query Filters based on Preferences
        let jobQuery = {
            status: 'active',
            $or: [
                { deadline: { $exists: false } },
                { deadline: { $gte: new Date() } }
            ]
        };

        // Filter by job type preference (Jobs vs Internships)
        if (profile.jobPreferences?.lookingFor) {
            if (profile.jobPreferences.lookingFor === 'Jobs') {
                jobQuery.jobTyp = { $ne: 'Internship' };
            } else if (profile.jobPreferences.lookingFor === 'Internships') {
                jobQuery.jobTyp = 'Internship';
            }
        }

        // 3. Fetch ALL active jobs (required for in-memory scoring)
        const allJobs = await Job.find(jobQuery)
            .populate('postedBy', 'name')
            .select('-__v')
            .lean();

        // 4. Run Scoring Engine
        const rankedJobs = allJobs
            .map(job => {
                const { score, reasons } = calculateScore(job, profile);
                return { ...job, matchScore: Math.round(score), matchReasons: reasons };
            })
            .filter(job => job.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        const totalRecommended = rankedJobs.length;

        // 5. Apply pagination slice on ranked results
        const paginatedJobs = rankedJobs.slice(skip, skip + limit);

        // 6. Fallback: no matches — return latest jobs (paginated)
        if (totalRecommended === 0) {
            const [totalJobs, latest] = await Promise.all([
                Job.countDocuments(jobQuery),
                Job.find(jobQuery)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('-__v')
                    .lean()
            ]);

            return res.json({
                success: true,
                type: 'fallback',
                message: 'No direct matches found. Showing latest jobs.',
                totalJobs,
                totalPages: Math.ceil(totalJobs / limit),
                currentPage: page,
                limit,
                jobs: latest
            });
        }

        // 7. Return paginated recommended results
        res.json({
            success: true,
            type: 'recommended',
            totalJobs: totalRecommended,
            totalPages: Math.ceil(totalRecommended / limit),
            currentPage: page,
            limit,
            jobs: paginatedJobs,
            hasPreferences: Boolean(profile.jobPreferences)
        });

    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch recommendations'
        });
    }
};

// 🟢 NEW: Save Job Preferences
exports.saveJobPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { lookingFor, preferredRoles, preferredLocations, expectedSalary } = req.body;

        const profile = await CandidateProfile.findOne({ candidateUserId: userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        // Update preferences
        profile.jobPreferences = {
            lookingFor: lookingFor || 'Jobs',
            preferredRoles: preferredRoles || [],
            preferredLocations: preferredLocations || [],
            expectedSalary: expectedSalary || null,
            updatedAt: new Date()
        };

        await profile.save();

        res.json({
            success: true,
            message: 'Job preferences saved successfully',
            preferences: profile.jobPreferences
        });

    } catch (error) {
        console.error("Save Preferences Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to save preferences'
        });
    }
};

// 🟢 NEW: Get Job Preferences
exports.getJobPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await CandidateProfile.findOne({ candidateUserId: userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({
            success: true,
            preferences: profile.jobPreferences || {
                lookingFor: 'Jobs',
                preferredRoles: [],
                preferredLocations: [],
                expectedSalary: null
            }
        });

    } catch (error) {
        console.error("Get Preferences Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch preferences'
        });
    }
};