const { body } = require("express-validator");

const registerDoctorValidator = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("password must be at least 6 chars"),
];

const loginDoctorValidator = [
  body("email").isEmail().withMessage("valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("password is required"),
];

const loginPatientValidator = [
  body("patientId").trim().notEmpty().withMessage("patientId is required"),
  body("password").notEmpty().withMessage("password is required"),
];

module.exports = { registerDoctorValidator, loginDoctorValidator, loginPatientValidator };
