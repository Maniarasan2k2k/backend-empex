const express = require("express");
const {
    getAllCandidates,
    getCandidateById,
    getFraudFlaggedUsers,
    toggleCandidateVerification,
    toggleCandidateBlockStatus,
    toggleCandidateFlagStatus,
    deleteCandidate,
    updateCandidate
} = require("../../controllers/admin/adminCandidateController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_USERS), getAllCandidates);
router.get("/fraud-flagged", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_USERS), getFraudFlaggedUsers);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_USERS), getCandidateById);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.EDIT_USERS), updateCandidate);
router.put("/:id/verify", adminAuthMiddleware, allowPermissions(PERMISSIONS.BLOCK_USERS), toggleCandidateVerification);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.BLOCK_USERS, PERMISSIONS.FLAG_FRAUD_USERS), deleteCandidate);
router.patch("/:id/block", adminAuthMiddleware, allowPermissions(PERMISSIONS.BLOCK_USERS), toggleCandidateBlockStatus);
router.patch("/:id/unblock", adminAuthMiddleware, allowPermissions(PERMISSIONS.UNBLOCK_USERS), toggleCandidateBlockStatus);
router.patch("/:id/flag", adminAuthMiddleware, allowPermissions(PERMISSIONS.FLAG_FRAUD_USERS), toggleCandidateFlagStatus);
router.patch("/:id/unflag", adminAuthMiddleware, allowPermissions(PERMISSIONS.FLAG_FRAUD_USERS), toggleCandidateFlagStatus);

module.exports = router;
