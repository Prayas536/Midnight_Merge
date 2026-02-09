const express = require("express");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validationMiddleware } = require("../middleware/errorHandler");
const { body } = require("express-validator");
const c = require("../controllers/medicine.controller");

const router = express.Router();

// Only doctors can access medicine recommendation
router.use(auth, requireRole(["doctor"]));

// Get metadata for the form (dropdown options)
router.get("/metadata", c.getDropdownOptions);

// Predict/recommend medicine based on patient data
router.post(
    "/predict",
    [
        body().isObject().withMessage("payload must be object"),
    ],
    validationMiddleware,
    c.recommendMedicine
);

module.exports = router;
