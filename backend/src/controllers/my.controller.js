const Patient = require("../models/Patient");
const Visit = require("../models/Visit");
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

async function myLatestPrediction(req, res, next) {
  try {
    if (req.user.userType !== "patient") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Get latest visit with prediction data
    const latestVisit = await Visit.findOne({ patientId: req.user.linkedPatientId })
      .sort({ predictedAt: -1, createdAt: -1 })
      .select({
        "prediction": 1,
        "metrics": 1,
        "predictedAt": 1,
        "createdAt": 1
      });

    if (!latestVisit || !latestVisit.prediction || latestVisit.prediction.riskScore === null) {
      return res.status(404).json({ 
        success: false, 
        message: "No prediction found. Please make a prediction first." 
      });
    }

    // Format response for AI chat
    res.json({ 
      success: true, 
      data: {
        prediction: latestVisit.prediction.riskLabel === "High" ? 1 : 0,
        risk_percent: latestVisit.prediction.riskScore,
        confidence: latestVisit.prediction.confidence,
        model_version: latestVisit.prediction.modelVersion,
        predicted_at: latestVisit.prediction.predictedAt,
        patient_data: {
          metrics: latestVisit.metrics
        }
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { myProfile, myVisits, myLatestPrediction };
