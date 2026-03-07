const express = require("express");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validationMiddleware } = require("../middleware/errorHandler");
const { body } = require("express-validator");
const c = require("../controllers/stress.controller");

const router = express.Router();

// Publicly accessible for testing, we can re-add auth later if it works
router.post(
    "/analyze",
    c.analyzeMood
);

router.post(
    "/predict",
    c.predict
);

router.post(
    "/predict_combined",
    c.predictCombined
);

router.post(
    "/ai_stress_advice",
    c.aiStressAdvice
);

// Fallback for this router
router.use((req, res) => {
    console.log(`Stress Router 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: "Route not found in Stress Router" });
});

module.exports = router;
