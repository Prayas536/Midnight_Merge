const express = require("express");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validationMiddleware } = require("../middleware/errorHandler");
const { body } = require("express-validator");
const c = require("../controllers/medicine.controller");

const router = express.Router();

// Only doctors can access medicine recommendation
router.use(auth, requireRole(["doctor"]));

// Get dropdown options for the form
router.get("/dropdown-options", c.getDropdownOptions);

// Recommend medicine based on patient data
router.post(
    "/recommend",
    [
        body().isObject().withMessage("payload must be object"),
    ],
    validationMiddleware,
    c.recommendMedicine
);

module.exports = router;
