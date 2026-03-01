// ============================================================
// config/s3Upload.js  (replaces localUpload.js)
// Uploads files directly to AWS S3 emp-x-jobs bucket.
// Folder structure mirrors what's already in the bucket:
//   company-logos/  company-documents/  photos/
//   education/  experience/  internships/  projects/  skills/
// ============================================================

const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

// ── 1. S3 Client ─────────────────────────────────────────────────────────────
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// ── 2. Fieldname → S3 Folder Map ─────────────────────────────────────────────
const FOLDER_MAP = {
    profilePhoto: 'photos',
    companyLogo: 'company-logos',
    companyDoc: 'company-documents',
    companyDocument: 'company-documents',
    resume: 'resumes',
    caneduCert: 'education',
    education: 'education',
    canexpCert: 'experience',
    experience: 'experience',
    canintCert: 'internships',
    internship: 'internships',
    canproDoc: 'projects',
    project: 'projects',
    canskiCer: 'skills',
    skill: 'skills',
    docFile: 'company-documents',
};

// ── 3. multer-s3 Storage ──────────────────────────────────────────────────────
const storage = multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    // Files are publicly readable (bucket policy must allow s3:GetObject for *)
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (req, file, cb) => {
        const folder = FOLDER_MAP[file.fieldname] || 'others';
        const userId = req.user ? req.user.id : 'anonymous';
        const ext = path.extname(file.originalname);
        const filename = `${userId}-${Date.now()}${ext}`;
        cb(null, `${folder}/${filename}`);
    },
});

// ── 4. Export — same interface as localUpload.js, so NO route changes needed ──
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

module.exports = upload;
