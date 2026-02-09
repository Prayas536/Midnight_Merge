const express = require("express");
const { chatWithAI, generateNotes, analyzeHealthJourney } = require("../controllers/aiController.js");
const { auth } = require("../middleware/auth.js");

const router = express.Router();

// Patient AI Chat
router.post("/chat", auth, chatWithAI);

// Doctor AI Notes Generation
router.post("/generate-notes", auth, generateNotes);

// Patient Health Journey Analysis
router.post("/health-journey-analysis", auth, analyzeHealthJourney);

module.exports = router;

