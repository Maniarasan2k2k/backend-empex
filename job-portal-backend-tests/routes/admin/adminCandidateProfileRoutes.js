const express = require("express");
const {
    getAllCandidateProfiles,
    getCandidateProfileById,
    toggleProfileVisibility,
    updateCandidateProfile,
    deleteCandidateProfile
} = require("../../controllers/admin/adminCandidateProfileController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_CANDIDATE_PROFILES), getAllCandidateProfiles);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_CANDIDATE_PROFILES), getCandidateProfileById);
router.patch("/:id/visibility", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_CANDIDATE_PROFILES), toggleProfileVisibility);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_CANDIDATE_PROFILES), updateCandidateProfile);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.DELETE_CANDIDATE_PROFILES), deleteCandidateProfile);

module.exports = router;
