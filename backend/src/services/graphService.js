/**
 * Graph Service — Node.js layer that calls TigerGraph REST++ installed queries
 * and provides helper methods used by the graph controller.
 */
const { getTigerGraphClient } = require("../config/tigergraph");
const { env } = require("../config/env");

const GRAPH = () => env.TG_GRAPH_NAME;

/**
 * Safely call an installed query via REST++
 */
async function runQuery(queryName, params = {}) {
  const client = getTigerGraphClient();
  if (!client) {
    const err = new Error("TigerGraph not connected – graph features unavailable");
    err.statusCode = 503;
    throw err;
  }

  // REST++ endpoint: GET /query/{graph_name}/{query_name}?param=val
  const res = await client.get(`/query/${GRAPH()}/${queryName}`, { params });
  return res.data; // already unwrapped by interceptor
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Get hereditary risk profile for a patient
 * @param {string} patientId - TigerGraph vertex primary_id (pid)
 */
async function getHereditaryRisk(patientId) {
  return runQuery("getHereditaryRisk", { seed: patientId });
}

/**
 * Check if a candidate medicine is safe for a patient
 * @param {string} patientId  - Patient vertex pid
 * @param {string} medicineId - Medicine vertex mid
 */
async function checkDrugSafety(patientId, medicineId) {
  return runQuery("checkDrugSafety", {
    patient: patientId,
    candidate: medicineId,
  });
}

/**
 * Find patients similar to the given patient (community detection)
 * @param {string} patientId
 * @param {number} topK - how many results (default 5)
 */
async function findSimilarPatients(patientId, topK = 5) {
  return runQuery("findSimilarPatients", { seed: patientId, topK });
}

/**
 * Get full 360° graph context for a patient (used as RAG context for LLM)
 * @param {string} patientId
 */
async function getPatientGraphContext(patientId) {
  return runQuery("getPatientGraphContext", { seed: patientId });
}

// ─── Write helpers (upsert vertices / edges) ────────────────────────

/**
 * Upsert a single vertex
 */
async function upsertVertex(vertexType, vertexId, attributes = {}) {
  const client = getTigerGraphClient();
  if (!client) return null;

  const payload = {
    vertices: {
      [vertexType]: {
        [vertexId]: attributes,
      },
    },
  };

  const res = await client.post(`/graph/${GRAPH()}`, payload);
  return res.data;
}

/**
 * Upsert an edge
 */
async function upsertEdge(srcType, srcId, edgeType, tgtType, tgtId, attributes = {}) {
  const client = getTigerGraphClient();
  if (!client) return null;

  const payload = {
    edges: {
      [srcType]: {
        [srcId]: {
          [edgeType]: {
            [tgtType]: {
              [tgtId]: attributes,
            },
          },
        },
      },
    },
  };

  const res = await client.post(`/graph/${GRAPH()}`, payload);
  return res.data;
}

/**
 * Sync a patient from MongoDB to TigerGraph
 * Called when a patient is created or updated in Mongo
 */
async function syncPatientToGraph(mongoPatient, doctorMongoId) {
  const client = getTigerGraphClient();
  if (!client) return null; // silently skip if TG not connected

  const pid = mongoPatient.patientId; // e.g. "P-YWX1Y67245"

  // Calculate age from dob
  const age = mongoPatient.dob
    ? Math.floor((Date.now() - new Date(mongoPatient.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : 0;

  await upsertVertex("Patient", pid, {
    name: { value: mongoPatient.name },
    age: { value: age },
    gender: { value: mongoPatient.gender },
    bmi: { value: mongoPatient.bmi || 0 },
    hba1c: { value: mongoPatient.HbA1cLevel || 0 },
    glucose: { value: mongoPatient.bloodGlucoseLevel || 0 },
    hypertension: { value: mongoPatient.hypertension || false },
    heart_disease: { value: mongoPatient.heartDisease || false },
    smoking: { value: mongoPatient.smokingHistory || "no info" },
    risk_label: { value: "Unknown" },
    risk_score: { value: 0 },
    mongo_id: { value: String(mongoPatient._id) },
  });

  // Link doctor → patient
  if (doctorMongoId) {
    await upsertEdge("Doctor", String(doctorMongoId), "TREATS", "Patient", pid, {
      since: { value: new Date().toISOString() },
    });
  }

  return pid;
}

/**
 * Sync a doctor from MongoDB to TigerGraph
 */
async function syncDoctorToGraph(mongoDoctor) {
  const client = getTigerGraphClient();
  if (!client) return null;

  const did = `D-${String(mongoDoctor._id).slice(-8).toUpperCase()}`;

  await upsertVertex("Doctor", did, {
    name: { value: mongoDoctor.name },
    email: { value: mongoDoctor.email || "" },
    mongo_id: { value: String(mongoDoctor._id) },
  });

  return did;
}

/**
 * Sync a visit / lab result to TigerGraph and update patient risk
 */
async function syncVisitToGraph(mongoVisit, patientPid) {
  const client = getTigerGraphClient();
  if (!client) return null;

  const lid = `L-${String(mongoVisit._id).slice(-10).toUpperCase()}`;

  await upsertVertex("LabResult", lid, {
    test_date: { value: new Date(mongoVisit.visitDate).toISOString() },
    hba1c: { value: mongoVisit.metrics?.HbA1cLevel || 0 },
    glucose: { value: mongoVisit.metrics?.bloodGlucoseLevel || 0 },
    bmi: { value: mongoVisit.metrics?.bmi || 0 },
    visit_mongo_id: { value: String(mongoVisit._id) },
  });

  // Patient → LabResult edge
  await upsertEdge("Patient", patientPid, "HAS_LAB_RESULT", "LabResult", lid, {});

  // Update patient risk from prediction
  if (mongoVisit.prediction?.riskScore != null) {
    await upsertVertex("Patient", patientPid, {
      risk_score: { value: mongoVisit.prediction.riskScore },
      risk_label: { value: mongoVisit.prediction.riskLabel || "Unknown" },
      hba1c: { value: mongoVisit.metrics?.HbA1cLevel || 0 },
      glucose: { value: mongoVisit.metrics?.bloodGlucoseLevel || 0 },
      bmi: { value: mongoVisit.metrics?.bmi || 0 },
    });
  }

  return lid;
}

/**
 * Add a family relationship between two patients
 */
async function addFamilyLink(patientPid1, patientPid2, relation) {
  await upsertEdge("Patient", patientPid1, "HAS_RELATIVE", "Patient", patientPid2, {
    relation: { value: relation },
  });
  // Bidirectional: add reverse
  const reverseRelation = reverseRelationType(relation);
  await upsertEdge("Patient", patientPid2, "HAS_RELATIVE", "Patient", patientPid1, {
    relation: { value: reverseRelation },
  });
}

function reverseRelationType(relation) {
  const map = {
    parent: "child",
    child: "parent",
    sibling: "sibling",
    spouse: "spouse",
    grandparent: "grandchild",
    grandchild: "grandparent",
    "uncle/aunt": "nephew/niece",
    "nephew/niece": "uncle/aunt",
  };
  return map[relation] || relation;
}

/**
 * Record that a patient is currently taking a medicine
 */
async function addPatientMedicine(patientPid, medicineId, dosageMg) {
  await upsertEdge("Patient", patientPid, "TAKES", "Medicine", medicineId, {
    start_date: { value: new Date().toISOString() },
    dosage_mg: { value: dosageMg },
    is_current: { value: true },
  });
}

/**
 * Check if TigerGraph is available
 */
function isGraphAvailable() {
  return getTigerGraphClient() !== null;
}

module.exports = {
  // Queries
  getHereditaryRisk,
  checkDrugSafety,
  findSimilarPatients,
  getPatientGraphContext,
  // Write helpers
  upsertVertex,
  upsertEdge,
  syncPatientToGraph,
  syncDoctorToGraph,
  syncVisitToGraph,
  addFamilyLink,
  addPatientMedicine,
  // Utility
  isGraphAvailable,
};
