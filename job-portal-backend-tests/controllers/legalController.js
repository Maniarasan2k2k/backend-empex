// controllers/legalController.js
// Serves static legal content (Privacy Policy, Terms of Service, Refund Policy) as structured JSON
// so that both the web frontend and Flutter mobile app can consume it.

// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY POLICY DATA
// ─────────────────────────────────────────────────────────────────────────────
const privacyPolicyData = {
    title: "Privacy Policy",
    lastUpdated: "February 11, 2026",
    effectiveDate: "February 11, 2026",
    companyName: "EmpExIndia",
    sections: [
        {
            id: 1,
            heading: "Commitment to Privacy",
            content: [
                {
                    type: "paragraph",
                    text: "At EmpExIndia, your trust is our most valuable asset. This policy describes how we collect, use, and protect your personal data across our website and mobile applications. We are committed to maintaining the highest standards of data security and transparency."
                }
            ]
        },
        {
            id: 2,
            heading: "Information We Collect",
            content: [
                {
                    type: "list",
                    items: [
                        {
                            label: "Candidate Data",
                            text: "Name, Email, Contact Number, Date of Birth, Resume/CV, Education details, and Location (State/District)."
                        },
                        {
                            label: "Employer Data",
                            text: "Business Name, Website, GST/PAN Documents, and Authorized Representative details."
                        },
                        {
                            label: "Technical Data",
                            text: "IP addresses, device unique IDs (for Mobile Apps), browser types, and operating system information."
                        }
                    ]
                }
            ]
        },
        {
            id: 3,
            heading: "Mobile App Specific Permissions",
            content: [
                {
                    type: "paragraph",
                    text: "To provide a functional mobile experience, our apps may request access to:"
                },
                {
                    type: "list",
                    items: [
                        {
                            label: "Storage",
                            text: "To upload resumes and profile photos."
                        },
                        {
                            label: "Camera",
                            text: "For virtual interviews and profile image updates."
                        },
                        {
                            label: "Geolocation",
                            text: "To show relevant jobs in your current district."
                        },
                        {
                            label: "Notifications",
                            text: "To send real-time job alerts and application statuses."
                        }
                    ]
                }
            ]
        },
        {
            id: 4,
            heading: "How We Use Data",
            content: [
                {
                    type: "paragraph",
                    text: "Your data is used for the following purposes:"
                },
                {
                    type: "list",
                    items: [
                        { text: "To facilitate job and internship matching via our AI-driven system." },
                        { text: "To verify the legitimacy of hiring companies to ensure a safe ecosystem." },
                        { text: "To send automated district-wise job alerts and application status notifications." },
                        { text: "To prevent fraud and enforce our Terms of Service." }
                    ]
                }
            ]
        },
        {
            id: 5,
            heading: "Data Sharing & \"No-Sell\" Promise",
            content: [
                {
                    type: "paragraph",
                    text: "EmpExIndia strictly DOES NOT sell or rent user data to third-party marketing firms. Data is only shared between a candidate and an employer when the candidate explicitly applies for a specific job listing. We may disclose data if required by law or for national security purposes."
                }
            ]
        },
        {
            id: 6,
            heading: "Security & Encryption",
            content: [
                {
                    type: "paragraph",
                    text: "All communication between your device and EmpExIndia is secured via 256-bit SSL encryption. Highly sensitive documents like GST/PAN are stored in encrypted environments accessible only by our internal audit team."
                }
            ]
        },
        {
            id: 7,
            heading: "Your Rights (Access & Deletion)",
            content: [
                {
                    type: "paragraph",
                    text: "You have the right to access and update your data at any time via your profile settings. You also have the \"Right to be Forgotten.\" You may request the permanent deletion of your account and associated personal data by contacting our support team."
                }
            ]
        },
        {
            id: 8,
            heading: "Cookies",
            content: [
                {
                    type: "paragraph",
                    text: "We use cookies to enhance your experience by remembering your preferences and session details. You can disable cookies in your browser settings, though this may limit platform functionality."
                }
            ]
        }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// TERMS & CONDITIONS DATA
// ─────────────────────────────────────────────────────────────────────────────
const termsOfServiceData = {
    title: "Terms & Conditions",
    lastUpdated: "February 11, 2026",
    effectiveDate: "February 11, 2026",
    companyName: "EmpExIndia",
    sections: [
        {
            id: 1,
            heading: "Introduction & Acceptance",
            content: [
                {
                    type: "paragraph",
                    text: "Welcome to EmpExIndia, India's modern employment exchange. These Terms and Conditions govern your use of the EmpExIndia website and mobile applications (collectively referred to as the \"Platform\"). By accessing or using the Platform, you agree to be bound by these terms. If you do not agree to any part of these terms, you must not use our services."
                }
            ]
        },
        {
            id: 2,
            heading: "The \"Employment Exchange\" Facilitation",
            content: [
                {
                    type: "paragraph",
                    text: "EmpExIndia operates as a digital facilitator connecting talent with opportunities. We provide the infrastructure for recruitment match-making. EmpExIndia is not an employer, recruiter, or agent for any party using the platform. We do not guarantee employment for candidates or perfect candidates for employers."
                }
            ]
        },
        {
            id: 3,
            heading: "User Eligibility & Account Security",
            content: [
                {
                    type: "list",
                    items: [
                        {
                            label: "Eligibility",
                            text: "You must be at least 18 years of age to register on EmpExIndia."
                        },
                        {
                            label: "Account Security",
                            text: "You are responsible for maintaining the confidentiality of your login credentials. Any activity under your account is your sole legal responsibility."
                        },
                        {
                            label: "Data Integrity",
                            text: "All information provided, including Resumes, GST numbers, and Company details, must be 100% authentic and accurate."
                        }
                    ]
                }
            ]
        },
        {
            id: 4,
            heading: "For Candidates (Job Seekers)",
            content: [
                {
                    type: "list",
                    items: [
                        {
                            label: "Free Access",
                            text: "The EmpExIndia mobile app is completely free for candidates. You can browse jobs, apply, attend virtual interviews, and track applications at no cost."
                        },
                        {
                            label: "Professional Honesty",
                            text: "Providing fraudulent educational or experience data will result in permanent account deactivation."
                        },
                        {
                            label: "Interview Commitment",
                            text: "Candidates who confirm interviews but fail to attend (No-Show) repeatedly may have their profile visibility restricted to protect platform trust."
                        }
                    ]
                }
            ]
        },
        {
            id: 5,
            heading: "For Employers (Hiring Partners)",
            content: [
                {
                    type: "list",
                    items: [
                        {
                            label: "Mandatory Verification",
                            text: "Employers must provide valid business proof (GST, PAN, or Incorporation) to unlock recruitment features."
                        },
                        {
                            label: "Zero-Fee Policy",
                            text: "Employers are strictly prohibited from charging candidates any fees (Security, Training, Kit, Processing) for interviews or hiring. Violation results in immediate permanent ban and legal reporting."
                        },
                        {
                            label: "Job Postings",
                            text: "Employers can manage and track their job postings through the app. Job post creation and associated services are managed via our website at empexindia.com."
                        }
                    ]
                }
            ]
        },
        {
            id: 6,
            heading: "Premium Services",
            content: [
                {
                    type: "paragraph",
                    text: "The EmpExIndia mobile application is free to download and use. Certain advanced or premium features for employers are available exclusively through our website at empexindia.com. No in-app purchases are required to use the mobile application."
                }
            ]
        },
        {
            id: 7,
            heading: "Prohibited General Conduct",
            content: [
                {
                    type: "paragraph",
                    text: "Users are prohibited from:"
                },
                {
                    type: "list",
                    items: [
                        { text: "Using automated systems (bots, scrapers) to collect data from the platform." },
                        { text: "Posting discriminatory, offensive, or illegal content." },
                        { text: "Misusing contact details of users for non-recruitment marketing." }
                    ]
                }
            ]
        },
        {
            id: 8,
            heading: "Dispute Resolution & Jurisdiction",
            content: [
                {
                    type: "paragraph",
                    text: "These terms are governed by the laws of India. Any legal disputes arising from the use of EmpExIndia shall be subject to the exclusive jurisdiction of the courts in the district where our corporate office is situated."
                }
            ]
        }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// REFUND & CANCELLATION POLICY DATA
// ─────────────────────────────────────────────────────────────────────────────
const refundPolicyData = {
    title: "Refund & Cancellation Policy",
    lastUpdated: "February 20, 2026",
    effectiveDate: "February 20, 2026",
    companyName: "EmpExIndia",
    sections: [
        {
            id: 1,
            heading: "App is Free to Use",
            content: [
                {
                    type: "paragraph",
                    text: "The EmpExIndia mobile application is completely free to download and use. We do not charge any fees within the mobile app, and no in-app purchases are required. There are no subscriptions, memberships, or payments processed through this application."
                }
            ]
        },
        {
            id: 2,
            heading: "Web Platform Services",
            content: [
                {
                    type: "paragraph",
                    text: "Certain premium and employer-facing services are available through our website at empexindia.com. Any payments, subscriptions, or service fees are exclusively handled through our website portal and are governed by the refund policy on our website."
                }
            ]
        },
        {
            id: 3,
            heading: "Website Refund Requests",
            content: [
                {
                    type: "paragraph",
                    text: "If you made a payment on the EmpExIndia website and wish to request a refund, please contact our support team. Refund requests are considered only if:"
                },
                {
                    type: "list",
                    items: [
                        { text: "The request is made within 24 hours of payment." },
                        { text: "The purchased service has NOT been utilized." },
                        { text: "Approved refunds are processed within 5 to 7 working days." }
                    ]
                },
                {
                    type: "contact",
                    items: [
                        { label: "Phone", text: "+91 99764 60666 (10:00 AM \u2013 06:00 PM)" },
                        { label: "Email", text: "support@empexindia.com" }
                    ]
                }
            ]
        },
        {
            id: 4,
            heading: "Failed Transactions (Technical Errors)",
            content: [
                {
                    type: "paragraph",
                    text: "If your bank account is debited but a service on our website is not activated due to a technical or payment gateway failure, the amount will typically be automatically refunded within 24\u201348 hours by the bank. If you do not receive the refund within this timeframe, please contact our support team with your transaction ID."
                }
            ]
        },
        {
            id: 5,
            heading: "Account Cancellation",
            content: [
                {
                    type: "paragraph",
                    text: "Users can deactivate or delete their account at any time via the app settings menu. Account deletion is free and immediate. For any web-platform service queries related to account closure, please contact our support team."
                }
            ]
        }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/legal/privacy-policy
 * @desc    Returns structured Privacy Policy data consumable by web and Flutter clients
 * @access  Public (no authentication required)
 */
exports.getPrivacyPolicy = (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Privacy Policy fetched successfully.",
            data: privacyPolicyData
        });
    } catch (error) {
        console.error("❌ Error fetching Privacy Policy:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching Privacy Policy."
        });
    }
};

/**
 * @route   GET /api/legal/terms-of-service
 * @desc    Returns structured Terms of Service data consumable by web and Flutter clients
 * @access  Public (no authentication required)
 */
exports.getTermsOfService = (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Terms of Service fetched successfully.",
            data: termsOfServiceData
        });
    } catch (error) {
        console.error("❌ Error fetching Terms of Service:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching Terms of Service."
        });
    }
};

/**
 * @route   GET /api/legal/refund-policy
 * @desc    Returns structured Refund & Cancellation Policy data consumable by web and Flutter clients
 * @access  Public (no authentication required)
 */
exports.getRefundPolicy = (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Refund & Cancellation Policy fetched successfully.",
            data: refundPolicyData
        });
    } catch (error) {
        console.error("\u274c Error fetching Refund Policy:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching Refund Policy."
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// TRUST & SAFETY DATA
// ─────────────────────────────────────────────────────────────────────────────
const trustAndSafetyData = {
    title: "Trust & Safety",
    lastUpdated: "February 11, 2026",
    effectiveDate: "February 11, 2026",
    companyName: "EmpExIndia",
    sections: [
        {
            id: 1,
            heading: "Our Commitment to Safety",
            content: [
                {
                    type: "paragraph",
                    text: "At EmpExIndia, your security is our highest priority. We have built a robust ecosystem designed to eliminate fraud and ensure that every interaction between candidates and employers is safe, transparent, and professional."
                }
            ]
        },
        {
            id: 2,
            heading: "Mandatory KYC for Employers",
            content: [
                {
                    type: "paragraph",
                    text: "To maintain a scam-free environment, every hiring partner must undergo a mandatory audit. Employers are required to upload valid business identification (GST, PAN, or MSME) through our website. Each job posting is valid for 30 days, ensuring that only current and verified opportunities are presented to our candidates. Our compliance team manually verifies these documents against government databases before any job post is made live."
                }
            ]
        },
        {
            id: 3,
            heading: "The Zero-Fee Candidate Policy",
            content: [
                {
                    type: "paragraph",
                    text: "EmpExIndia strictly prohibits employers from charging candidates any money. We maintain a zero-tolerance policy for any employer found asking for \"Security Deposits,\" \"Processing Fees,\" or \"Training Kit Charges.\" Such accounts are permanently banned and reported to relevant authorities."
                }
            ]
        },
        {
            id: 4,
            heading: "Data Encryption & Privacy",
            content: [
                {
                    type: "paragraph",
                    text: "Your resumes and sensitive business documents are stored in industry-standard encrypted environments. We use 256-bit SSL encryption for all data transfers, ensuring that your personal and professional information remains invisible to unauthorized parties."
                }
            ]
        },
        {
            id: 5,
            heading: "Secure Communication",
            content: [
                {
                    type: "paragraph",
                    text: "All virtual meets and webinar sessions conducted through the EmpExIndia platform utilize encrypted communication protocols. We encourage users to keep all recruitment-related conversations within the platform to ensure a recorded and secure trail of interaction."
                }
            ]
        },
        {
            id: null,
            heading: "How to Protect Yourself",
            highlight: true,
            content: [
                {
                    type: "highlight_list",
                    items: [
                        { text: "Never pay any fee for a job interview or offer." },
                        { text: "Do not share your highly sensitive personal IDs (like Aadhaar) until you have verified the employer's physical presence." },
                        { text: "Always communicate via official EmpExIndia channels or corporate email addresses." }
                    ]
                }
            ]
        },
        {
            id: 6,
            heading: "Reporting Fraud",
            content: [
                {
                    type: "paragraph",
                    text: "If you encounter a suspicious job post or an employer asking for payment, please report it immediately to our support team."
                },
                {
                    type: "contact",
                    items: [
                        { label: "Email", text: "support@empexindia.com" }
                    ]
                },
                {
                    type: "paragraph",
                    text: "Your proactive reporting helps keep the entire EmpExIndia community safe."
                }
            ]
        }
    ]
};

/**
 * @route   GET /api/legal/trust-and-safety
 * @desc    Returns structured Trust & Safety data consumable by web and Flutter clients
 * @access  Public (no authentication required)
 */
exports.getTrustAndSafety = (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Trust & Safety information fetched successfully.",
            data: trustAndSafetyData
        });
    } catch (error) {
        console.error("\u274c Error fetching Trust & Safety:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching Trust & Safety."
        });
    }
};
