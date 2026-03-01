const express = require("express");
const {
    createSkillTraining,
    getAllSkillTrainingsAdmin,
    updateSkillTraining,
    publishSkillTraining,
    deleteSkillTraining
} = require("../../controllers/admin/skillTrainingController");

const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.SKILL_TRAINING_VIEW), getAllSkillTrainingsAdmin);
router.post("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.SKILL_TRAINING_CREATE), createSkillTraining);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.SKILL_TRAINING_EDIT), updateSkillTraining);
router.patch("/:id/publish", adminAuthMiddleware, allowPermissions(PERMISSIONS.SKILL_TRAINING_EDIT), publishSkillTraining);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.SKILL_TRAINING_DELETE), deleteSkillTraining);

module.exports = router;
