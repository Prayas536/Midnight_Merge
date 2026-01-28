const express = require("express");
const { chatWithAI } = require("../controllers/aiController.js");
const { auth } = require("../middleware/auth.js");

const router = express.Router();

// Patient AI Chat
router.post("/chat", auth, chatWithAI);

module.exports = router;
