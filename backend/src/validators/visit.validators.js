const { body, param } = require("express-validator");

const visitCreateValidator = [
  param("id").isMongoId().withMessage("invalid patient id"),
  body("visitDate").isISO8601().withMessage("visitDate must be a valid date"),
  body("metrics").isObject().withMessage("metrics object required"),
  body("metrics.HbA1cLevel").optional({ nullable: true }).isFloat({ min: 0, max: 20 }).withMessage("HbA1cLevel out of range"),
  body("metrics.bloodGlucoseLevel").optional({ nullable: true }).isFloat({ min: 0, max: 600 }).withMessage("bloodGlucoseLevel out of range"),
  body("metrics.bmi").optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage("bmi out of range"),
  body("notes").optional().isString().isLength({ max: 2000 }).withMessage("notes too long"),
  body("recommendations").optional().isString().isLength({ max: 2000 }).withMessage("recommendations too long"),
  body("prediction").optional().isObject().withMessage("prediction must be object"),
];

module.exports = { visitCreateValidator };
