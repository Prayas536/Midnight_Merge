const Patient = require("../models/Patient");
const User = require("../models/User");
const Visit = require("../models/Visit");
const bcrypt = require("bcryptjs");

function makePatientId() {
  const part = Math.random().toString(36).slice(2, 7).toUpperCase();
  const ts = Date.now().toString().slice(-5);
  return `P-${part}${ts}`;
}

function generateTempPassword() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

async function createPatient(doctorId, payload) {
  const patientId = makePatientId();
  const patient = await Patient.create({
    ...payload,
    patientId,
    createdByDoctorId: doctorId,
  });

  // Create linked patient user for login
  const plainPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(plainPassword, 12);
  await User.create({
    name: patient.name,
    email: undefined,
    passwordHash,
    userType: "patient",
    linkedPatientId: patient._id,
  });

  return { patient, patientLogin: { patientId, password: plainPassword } };
}

async function listPatients(doctorId, { q }) {
  const filter = { createdByDoctorId: doctorId };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { patientId: { $regex: q, $options: "i" } },
    ];
  }
  const patients = await Patient.find(filter).sort({ createdAt: -1 }).limit(200);
  return patients;
}

async function getPatientById(doctorId, id) {
  const p = await Patient.findOne({ _id: id, createdByDoctorId: doctorId });
  if (!p) {
    const err = new Error("Patient not found");
    err.statusCode = 404;
    throw err;
  }
  return p;
}

async function updatePatient(doctorId, id, payload) {
  const p = await Patient.findOneAndUpdate(
    { _id: id, createdByDoctorId: doctorId },
    { $set: payload },
    { new: true }
  );
  if (!p) {
    const err = new Error("Patient not found");
    err.statusCode = 404;
    throw err;
  }
  return p;
}

async function deletePatient(doctorId, id) {
  const p = await Patient.findOneAndDelete({ _id: id, createdByDoctorId: doctorId });
  if (!p) {
    const err = new Error("Patient not found");
    err.statusCode = 404;
    throw err;
  }
  // Cleanup linked patient user and visits
  await User.deleteOne({ userType: "patient", linkedPatientId: p._id });
  await Visit.deleteMany({ patientId: p._id });
  return true;
}

async function addVisit(doctorId, patientMongoId, payload) {
  const visit = await Visit.create({
    patientId: patientMongoId,
    doctorId,
    visitDate: payload.visitDate,
    metrics: payload.metrics,
    notes: payload.notes || "",
    recommendations: payload.recommendations || "",
    prediction: payload.prediction || undefined,
  });
  return visit;
}

async function listVisitsForPatient(doctorId, patientMongoId) {
  const visits = await Visit.find({ patientId: patientMongoId, doctorId }).sort({ visitDate: -1 });
  return visits;
}

async function listVisitsForPatientSelf(patientMongoId) {
  const visits = await Visit.find({ patientId: patientMongoId }).sort({ visitDate: -1 });
  return visits;
}

module.exports = {
  createPatient,
  listPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  addVisit,
  listVisitsForPatient,
  listVisitsForPatientSelf,
};
