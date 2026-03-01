// controllers/faqController.js
// Serves structured FAQ data for both the web frontend and Flutter mobile app.
// The Flutter app can replicate the category-tab + search UX by consuming this API.

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const categories = [
    { id: 'all', label: 'All Questions', icon: 'help-circle' },
    { id: 'candidates', label: 'For Candidates', icon: 'user' },
    { id: 'employers', label: 'For Employers', icon: 'briefcase' },
    { id: 'account', label: 'Account & Security', icon: 'shield' }
];

// ─────────────────────────────────────────────────────────────────────────────
// FAQ DATA
// To add / edit / remove a question: find the relevant object below and update.
//   - category: must be one of 'candidates' | 'employers' | 'account'
//   - question:  the question string
//   - answer:    the full answer string
// ─────────────────────────────────────────────────────────────────────────────
const faqs = [

    // ── CANDIDATES ──────────────────────────────────────────────────────────
    {
        id: 1,
        category: 'candidates',
        question: 'How do I apply for a job or internship?',
        answer: 'To apply, you must first create a profile and upload your details in the Resume Builder. Once your profile is ready, you can browse "Private Jobs" or "Internships", click on the listing, and hit the "Apply Now" button.'
    },
    {
        id: 2,
        category: 'candidates',
        question: 'Where can I find Government Jobs?',
        answer: 'Our portal has dedicated sections for "State Government Jobs" and "Central Government Jobs". These are updated regularly with the latest notifications from various departments and PSUs.'
    },
    {
        id: 3,
        category: 'candidates',
        question: 'What is the "Skill Training" section?',
        answer: 'The Skill Training section offers exclusive webinars (both free and paid) hosted by industry experts. Some sessions also provide certificates of completion to boost your resume.'
    },
    {
        id: 4,
        category: 'candidates',
        question: 'Can I track my application status?',
        answer: 'Yes! Go to your Candidate Dashboard and click on "Applied Jobs". You can see if your application has been Viewed, Shortlisted, or if you have been Selected for an interview.'
    },
    {
        id: 5,
        category: 'candidates',
        question: 'How do I attend a scheduled interview?',
        answer: 'If an employer schedules an interview, it will appear in your "Meetings" section. You can see the date, time, and join the meeting link directly from there.'
    },
    {
        id: 6,
        category: 'candidates',
        question: 'Is it free for candidates?',
        answer: 'Yes, EmpExIndia is 100% free for candidates. We do not charge any fees for job applications or basic profile creation.'
    },

    // ── EMPLOYERS ───────────────────────────────────────────────────────────
    {
        id: 7,
        category: 'employers',
        question: 'How do I verify my company profile?',
        answer: 'To ensure portal security, all employers must undergo verification. You need to upload documents such as GST Registration, Certificate of Incorporation, or Company PAN under the "Documents" section.'
    },
    {
        id: 8,
        category: 'employers',
        question: 'Can I post internships along with jobs?',
        answer: 'Yes, our portal allows you to post both full-time "Private Jobs" and "Internships" to attract fresh talent and experienced professionals alike.'
    },
    {
        id: 9,
        category: 'employers',
        question: 'How can I find the right candidates?',
        answer: 'Use the "Candidate Search" feature to filter talent by specific skills, experience levels, locations, and educational backgrounds. You can then view their full profiles before shortlisting.'
    },
    {
        id: 10,
        category: 'employers',
        question: 'How do I manage interviews?',
        answer: 'After shortlisting a candidate, use the "Schedule Interview" tool. This will automatically notify the candidate and add the session to your "Interview Schedule" and "Meetings" dashboard.'
    },
    {
        id: 11,
        category: 'employers',
        question: 'Are there any posting limits?',
        answer: 'Basic accounts have a set limit for active job postings. For unlimited postings, premium visibility, and advanced search filters, you can upgrade to our Professional or Enterprise plans.'
    },

    // ── ACCOUNT & SECURITY ──────────────────────────────────────────────────
    {
        id: 12,
        category: 'account',
        question: 'How do I reset my password?',
        answer: 'If you are logged out, use the "Forgot Password" link on the login page. If logged in, you can change it from "Settings" > "Reset Password" in your dashboard.'
    },
    {
        id: 13,
        category: 'account',
        question: 'Is my data secure?',
        answer: 'We use high-level encryption to protect your data. Documents uploaded for verification are stored securely and are only accessible by our verification team.'
    },
    {
        id: 14,
        category: 'account',
        question: 'How can I update my job preferences?',
        answer: 'Candidates can update their "Job Preferences" (like preferred role, location, and expected salary) from the dashboard. This helps our AI recommend the most relevant jobs to you.'
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/faq
 * @desc    Returns all FAQ categories + all FAQ items.
 *          Optional query param: ?category=candidates|employers|account
 *          Optional query param: ?search=keyword  (server-side search on question & answer)
 * @access  Public
 *
 * @example GET /api/faq
 * @example GET /api/faq?category=candidates
 * @example GET /api/faq?search=interview
 * @example GET /api/faq?category=employers&search=verify
 */
exports.getFaqs = (req, res) => {
    try {
        const { category, search } = req.query;

        let filtered = [...faqs];

        // Filter by category tab
        if (category && category !== 'all') {
            const validCategories = categories.map(c => c.id).filter(id => id !== 'all');
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Valid options: ${validCategories.join(', ')}`
                });
            }
            filtered = filtered.filter(faq => faq.category === category);
        }

        // Search filter (case-insensitive, checks both question and answer)
        if (search && search.trim() !== '') {
            const keyword = search.trim().toLowerCase();
            filtered = filtered.filter(
                faq =>
                    faq.question.toLowerCase().includes(keyword) ||
                    faq.answer.toLowerCase().includes(keyword)
            );
        }

        return res.status(200).json({
            success: true,
            message: 'FAQs fetched successfully.',
            data: {
                categories,
                total: filtered.length,
                faqs: filtered
            }
        });

    } catch (error) {
        console.error('❌ Error fetching FAQs:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching FAQs.'
        });
    }
};

/**
 * @route   GET /api/faq/categories
 * @desc    Returns only the list of FAQ categories (for rendering tab bar first)
 * @access  Public
 */
exports.getCategories = (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'FAQ categories fetched successfully.',
            data: categories
        });
    } catch (error) {
        console.error('❌ Error fetching FAQ categories:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching FAQ categories.'
        });
    }
};
