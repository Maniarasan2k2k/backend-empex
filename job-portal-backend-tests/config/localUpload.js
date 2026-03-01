// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // 🟢 S3-la irundha adhe folder structure-ah inga map panrom
//         let folder = 'uploads/others';
        
//         if (file.fieldname === 'profilePhoto') folder = 'uploads/photos';
//         else if (file.fieldname === 'companyLogo') folder = 'uploads/company-logos';
//         else if (file.fieldname === 'resume') folder = 'uploads/resumes';
//         else if (file.fieldname === 'education') folder = 'uploads/education';
//         else if (file.fieldname === 'experience') folder = 'uploads/experience';
//         else if (file.fieldname === 'internship') folder = 'uploads/internships';
//         else if (file.fieldname === 'project') folder = 'uploads/projects';
//         else if (file.fieldname === 'skill') folder = 'uploads/skills';
//         else if (file.fieldname === 'companyDocument') folder = 'uploads/company-documents';

//         // Folder illana auto-vaa create panniidum (Localized 120GB disk-la)
//         if (!fs.existsSync(folder)) {
//             fs.mkdirSync(folder, { recursive: true });
//         }
//         cb(null, folder);
//     },
//     filename: (req, file, cb) => {
//         // User ID vachi file name create aagum, fetch panna easy-aa irukkum
//         const userId = req.user ? req.user.id : 'anonymous';
//         cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
//     }
// });

// const upload = multer({ 
//     storage,
//     limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for high-quality resumes/photos
// });

// module.exports = upload;