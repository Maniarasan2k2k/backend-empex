const express = require("express");
const router = express.Router();
const { getAllTutorials, getTutorialById } = require("../controllers/tutorialController");

router.get("/", getAllTutorials);
router.get("/:id", getTutorialById);

module.exports = router;