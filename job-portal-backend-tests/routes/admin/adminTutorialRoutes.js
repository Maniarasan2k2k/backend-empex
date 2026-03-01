const express = require("express");
const {
    getAllTutorials,
    getTutorialById,
    createTutorial,
    updateTutorial,
    toggleTutorialStatus,
    updateTutorialStatus,
    deleteTutorial
} = require("../../controllers/admin/adminTutorialController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.TUTORIAL_VIEW), getAllTutorials);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.TUTORIAL_VIEW), getTutorialById);
router.post("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.TUTORIAL_CREATE), createTutorial);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.TUTORIAL_EDIT), updateTutorial);
router.patch("/:id/toggle", adminAuthMiddleware, allowPermissions(PERMISSIONS.TUTORIAL_EDIT), toggleTutorialStatus);
router.patch("/:id/status", adminAuthMiddleware, allowPermissions(PERMISSIONS.TUTORIAL_EDIT), updateTutorialStatus);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.TUTORIAL_DELETE), deleteTutorial);

module.exports = router;
