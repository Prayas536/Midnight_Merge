const patientService = require("../services/patient.service");

async function createPatient(req, res, next) {
  try {
    const { patient, patientLogin } = await patientService.createPatient(req.user.id, req.body);
    res.status(201).json({ success: true, data: { patient, patientLogin } });
  } catch (e) {
    next(e);
  }
}

async function listPatients(req, res, next) {
  try {
    const patients = await patientService.listPatients(req.user.id, { q: req.query.q });
    res.json({ success: true, data: patients });
  } catch (e) {
    next(e);
  }
}

async function getPatient(req, res, next) {
  try {
    const patient = await patientService.getPatientById(req.user.id, req.params.id);
    res.json({ success: true, data: patient });
  } catch (e) {
    next(e);
  }
}

async function updatePatient(req, res, next) {
  try {
    const updated = await patientService.updatePatient(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
}

async function deletePatient(req, res, next) {
  try {
    await patientService.deletePatient(req.user.id, req.params.id);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

async function addVisit(req, res, next) {
  try {
    const patient = await patientService.getPatientById(req.user.id, req.params.id);
    const visit = await patientService.addVisit(req.user.id, patient._id, req.body);
    res.status(201).json({ success: true, data: visit });
  } catch (e) {
    next(e);
  }
}

async function listVisits(req, res, next) {
  try {
    const patient = await patientService.getPatientById(req.user.id, req.params.id);
    const visits = await patientService.listVisitsForPatient(req.user.id, patient._id);
    res.json({ success: true, data: visits });
  } catch (e) {
    next(e);
  }
}

module.exports = { createPatient, listPatients, getPatient, updatePatient, deletePatient, addVisit, listVisits };
