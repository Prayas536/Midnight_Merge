const express = require("express");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validationMiddleware } = require("../middleware/errorHandler");
const v = require("../validators/patient.validators");
const vv = require("../validators/visit.validators");
const c = require("../controllers/patient.controller");

const router = express.Router();

router.use(auth, requireRole("doctor"));

router.post("/", v.patientCreateValidator, validationMiddleware, c.createPatient);
router.get("/", v.patientListValidator, validationMiddleware, c.listPatients);
router.get("/:id", v.patientIdParamValidator, validationMiddleware, c.getPatient);
router.put("/:id", v.patientUpdateValidator, validationMiddleware, c.updatePatient);
router.delete("/:id", v.patientIdParamValidator, validationMiddleware, c.deletePatient);

router.post("/:id/visits", vv.visitCreateValidator, validationMiddleware, c.addVisit);
router.get("/:id/visits", v.patientIdParamValidator, validationMiddleware, c.listVisits);

module.exports = router;
