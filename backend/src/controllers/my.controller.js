const Patient = require("../models/Patient");
const patientService = require("../services/patient.service");

async function myProfile(req, res, next) {
  try {
    if (req.user.userType !== "patient") return res.status(403).json({ success: false, message: "Forbidden" });
    const patient = await Patient.findById(req.user.linkedPatientId);
    if (!patient) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json({ success: true, data: patient });
  } catch (e) {
    next(e);
  }
}

async function myVisits(req, res, next) {
  try {
    if (req.user.userType !== "patient") return res.status(403).json({ success: false, message: "Forbidden" });
    const visits = await patientService.listVisitsForPatientSelf(req.user.linkedPatientId);
    res.json({ success: true, data: visits });
  } catch (e) {
    next(e);
  }
}

module.exports = { myProfile, myVisits };
