const { body, param, query } = require("express-validator");

const patientCreateValidator = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("dob").isISO8601().withMessage("dob must be a valid date (YYYY-MM-DD)"),
  body("gender").isIn(["male", "female", "other"]).withMessage("gender invalid"),
  body("hypertension").optional().isBoolean().withMessage("hypertension must be boolean"),
  body("heartDisease").optional().isBoolean().withMessage("heartDisease must be boolean"),
  body("smokingHistory").optional().isIn(["never", "former", "current", "unknown"]).withMessage("smokingHistory invalid"),
  body("bmi").optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage("bmi out of range"),
  body("HbA1cLevel").optional({ nullable: true }).isFloat({ min: 0, max: 20 }).withMessage("HbA1cLevel out of range"),
  body("bloodGlucoseLevel").optional({ nullable: true }).isFloat({ min: 0, max: 600 }).withMessage("bloodGlucoseLevel out of range"),
];

const patientUpdateValidator = [
  param("id").isMongoId().withMessage("invalid patient id"),
  ...patientCreateValidator.map((v) => v.optional({ nullable: true })),
];

const patientIdParamValidator = [param("id").isMongoId().withMessage("invalid patient id")];

const patientListValidator = [query("q").optional().trim().isLength({ min: 1, max: 50 }).withMessage("q invalid")];

module.exports = { patientCreateValidator, patientUpdateValidator, patientIdParamValidator, patientListValidator };
