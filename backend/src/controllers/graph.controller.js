/**
 * Graph Controller — HTTP handlers for TigerGraph-powered endpoints
 */
const graphService = require("../services/graphService");

/**
 * GET /api/graph/hereditary-risk/:patientPid
 * Returns family-based hereditary risk analysis
 */
async function getHereditaryRisk(req, res, next) {
  try {
    const { patientPid } = req.params;
    const result = await graphService.getHereditaryRisk(patientPid);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/graph/drug-safety
 * Body: { patientPid, medicineId }
 * Checks drug-drug interactions and contraindications
 */
async function checkDrugSafety(req, res, next) {
  try {
    const { patientPid, medicineId } = req.body;
    if (!patientPid || !medicineId) {
      return res.status(400).json({
        success: false,
        message: "patientPid and medicineId are required",
      });
    }
    const result = await graphService.checkDrugSafety(patientPid, medicineId);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/graph/similar-patients/:patientPid
 * Finds patients with similar conditions and risk profiles
 */
async function findSimilarPatients(req, res, next) {
  try {
    const { patientPid } = req.params;
    const topK = parseInt(req.query.topK) || 5;
    const result = await graphService.findSimilarPatients(patientPid, topK);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/graph/context/:patientPid
 * Returns 360° graph context for a patient (used by Graph RAG)
 */
async function getPatientContext(req, res, next) {
  try {
    const { patientPid } = req.params;
    const result = await graphService.getPatientGraphContext(patientPid);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/graph/family-link
 * Body: { patientPid1, patientPid2, relation }
 * Creates a bidirectional family link between two patients
 */
async function addFamilyLink(req, res, next) {
  try {
    const { patientPid1, patientPid2, relation } = req.body;
    if (!patientPid1 || !patientPid2 || !relation) {
      return res.status(400).json({
        success: false,
        message: "patientPid1, patientPid2, and relation are required",
      });
    }
    await graphService.addFamilyLink(patientPid1, patientPid2, relation);
    res.json({
      success: true,
      data: { message: `Family link (${relation}) created between ${patientPid1} and ${patientPid2}` },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/graph/patient-medicine
 * Body: { patientPid, medicineId, dosageMg }
 * Records that a patient is taking a medicine
 */
async function addPatientMedicine(req, res, next) {
  try {
    const { patientPid, medicineId, dosageMg } = req.body;
    if (!patientPid || !medicineId) {
      return res.status(400).json({
        success: false,
        message: "patientPid and medicineId are required",
      });
    }
    await graphService.addPatientMedicine(patientPid, medicineId, dosageMg || 0);
    res.json({
      success: true,
      data: { message: `Medicine ${medicineId} linked to patient ${patientPid}` },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/graph/status
 * Quick health check for TigerGraph connectivity
 */
async function graphStatus(req, res) {
  res.json({
    success: true,
    data: {
      available: graphService.isGraphAvailable(),
      graph: process.env.TG_GRAPH_NAME || "NexusHealthGraph",
    },
  });
}

module.exports = {
  getHereditaryRisk,
  checkDrugSafety,
  findSimilarPatients,
  getPatientContext,
  addFamilyLink,
  addPatientMedicine,
  graphStatus,
};
