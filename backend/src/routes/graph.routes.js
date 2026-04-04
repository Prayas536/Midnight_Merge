/**
 * Graph Routes — /api/graph/*
 * All routes require authentication; write endpoints require doctor role.
 */
const express = require("express");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const c = require("../controllers/graph.controller");

const router = express.Router();

// ─── Read endpoints (any authenticated user) ────────────────────────
router.get("/status", c.graphStatus);
router.get("/hereditary-risk/:patientPid", auth, c.getHereditaryRisk);
router.get("/similar-patients/:patientPid", auth, c.findSimilarPatients);
router.get("/context/:patientPid", auth, c.getPatientContext);

// ─── Write endpoints (doctor only) ──────────────────────────────────
router.post("/drug-safety", auth, requireRole("doctor"), c.checkDrugSafety);
router.post("/family-link", auth, requireRole("doctor"), c.addFamilyLink);
router.post("/patient-medicine", auth, requireRole("doctor"), c.addPatientMedicine);

module.exports = router;
