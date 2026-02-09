const express = require("express");
const { validationMiddleware } = require("../middleware/errorHandler");
const { auth } = require("../middleware/auth");
const v = require("../validators/auth.validators");
const c = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register-doctor", v.registerDoctorValidator, validationMiddleware, c.registerDoctorHandler);
router.post("/login", v.loginDoctorValidator, validationMiddleware, c.loginDoctorHandler);
router.post("/login-patient", v.loginPatientValidator, validationMiddleware, c.loginPatientHandler);
router.get("/me", auth, c.meHandler);
router.post("/logout", auth, c.logoutHandler);

module.exports = router;
