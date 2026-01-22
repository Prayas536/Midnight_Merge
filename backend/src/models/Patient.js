const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, index: true }, // human-readable
    name: { type: String, required: true, trim: true, index: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    hypertension: { type: Boolean, default: false },
    heartDisease: { type: Boolean, default: false },
    smokingHistory: {
      type: String,
      enum: ['current', 'former', 'never', 'not current', 'no info'],
      default: 'no info',
    },
    bmi: { type: Number, min: 0, max: 100, default: null },
    HbA1cLevel: { type: Number, min: 0, max: 20, default: null },
    bloodGlucoseLevel: { type: Number, min: 0, max: 600, default: null },
    createdByDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", PatientSchema);
