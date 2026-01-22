const mongoose = require("mongoose");

const VisitSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    visitDate: { type: Date, required: true, index: true },
    metrics: {
      HbA1cLevel: { type: Number, min: 0, max: 20, default: null },
      bloodGlucoseLevel: { type: Number, min: 0, max: 600, default: null },
      bmi: { type: Number, min: 0, max: 100, default: null },
    },
    notes: { type: String, default: "" },
    recommendations: { type: String, default: "" },
    prediction: {
      riskLabel: { type: String, default: null },
      riskScore: { type: Number, default: null },
      confidence: { type: Number, default: null },
      modelVersion: { type: String, default: null },
      predictedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

VisitSchema.index({ patientId: 1, visitDate: -1 });

module.exports = mongoose.model("Visit", VisitSchema);
