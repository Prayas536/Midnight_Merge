/**
 * Seed Script — Populate TigerGraph with medical reference data
 * ──────────────────────────────────────────────────────────────
 * Run: node src/scripts/seedGraph.js
 *
 * Pre-loads Medicines, Conditions, and key Interaction/Contraindication
 * edges so the graph is ready for a hackathon demo.
 */
require("dotenv").config();
const { connectTigerGraph, getTigerGraphClient } = require("../config/tigergraph");
const { env } = require("../config/env");

const GRAPH = env.TG_GRAPH_NAME || "NexusHealthGraph";

// ── Reference data ──────────────────────────────────────────────────

const medicines = [
  { mid: "MED-METFORMIN",    name: "Metformin",    category: "Biguanide",            typical_dosage_mg: 500 },
  { mid: "MED-GLIPIZIDE",    name: "Glipizide",    category: "Sulfonylurea",         typical_dosage_mg: 5 },
  { mid: "MED-INSULIN-NPH",  name: "Insulin NPH",  category: "Insulin",              typical_dosage_mg: 10 },
  { mid: "MED-SITAGLIPTIN",  name: "Sitagliptin",  category: "DPP-4 Inhibitor",      typical_dosage_mg: 100 },
  { mid: "MED-EMPAGLIFLOZIN", name: "Empagliflozin", category: "SGLT2 Inhibitor",    typical_dosage_mg: 10 },
  { mid: "MED-PIOGLITAZONE", name: "Pioglitazone", category: "Thiazolidinedione",    typical_dosage_mg: 30 },
  { mid: "MED-LIRAGLUTIDE",  name: "Liraglutide",  category: "GLP-1 Receptor Agonist", typical_dosage_mg: 1.2 },
  { mid: "MED-AMLODIPINE",   name: "Amlodipine",   category: "Calcium Channel Blocker", typical_dosage_mg: 5 },
  { mid: "MED-LISINOPRIL",   name: "Lisinopril",   category: "ACE Inhibitor",        typical_dosage_mg: 10 },
  { mid: "MED-ATORVASTATIN", name: "Atorvastatin", category: "Statin",               typical_dosage_mg: 20 },
];

const conditions = [
  { cid: "COND-HYPERTENSION",  name: "Hypertension",      severity: "Medium" },
  { cid: "COND-HEART-DISEASE", name: "Heart Disease",     severity: "High" },
  { cid: "COND-OBESITY",       name: "Obesity",           severity: "Medium" },
  { cid: "COND-KIDNEY-DISEASE",name: "Chronic Kidney Disease", severity: "High" },
  { cid: "COND-RETINOPATHY",   name: "Diabetic Retinopathy",  severity: "High" },
  { cid: "COND-NEUROPATHY",    name: "Diabetic Neuropathy",   severity: "Medium" },
  { cid: "COND-TYPE2-DIABETES",name: "Type 2 Diabetes",       severity: "High" },
  { cid: "COND-LIVER-DISEASE", name: "Liver Disease",         severity: "High" },
];

const drugInteractions = [
  { from: "MED-METFORMIN",    to: "MED-INSULIN-NPH",  severity: "Moderate", description: "Combined use may increase risk of hypoglycemia" },
  { from: "MED-GLIPIZIDE",    to: "MED-INSULIN-NPH",  severity: "High",     description: "Dual insulin secretion + injection greatly increases hypoglycemia risk" },
  { from: "MED-PIOGLITAZONE", to: "MED-INSULIN-NPH",  severity: "Moderate", description: "May cause fluid retention and edema when combined" },
  { from: "MED-LISINOPRIL",   to: "MED-EMPAGLIFLOZIN", severity: "Low",     description: "Monitor blood pressure closely; additive hypotensive effect" },
  { from: "MED-METFORMIN",    to: "MED-ATORVASTATIN",  severity: "Low",     description: "Generally safe; monitor liver function periodically" },
];

const contraindications = [
  { medicine: "MED-METFORMIN",     condition: "COND-KIDNEY-DISEASE", reason: "Risk of lactic acidosis in impaired renal function" },
  { medicine: "MED-PIOGLITAZONE",  condition: "COND-HEART-DISEASE",  reason: "May worsen heart failure due to fluid retention" },
  { medicine: "MED-PIOGLITAZONE",  condition: "COND-LIVER-DISEASE",  reason: "Hepatotoxicity risk; contraindicated in active liver disease" },
  { medicine: "MED-EMPAGLIFLOZIN", condition: "COND-KIDNEY-DISEASE", reason: "Reduced efficacy and increased risk with severe renal impairment" },
  { medicine: "MED-GLIPIZIDE",     condition: "COND-LIVER-DISEASE",  reason: "Impaired metabolism; risk of prolonged hypoglycemia" },
];

// ── Seed functions ──────────────────────────────────────────────────

async function seedVertices(client, vertexType, items) {
  const vertices = {};
  for (const item of items) {
    const id = item.mid || item.cid;
    const attrs = {};
    for (const [key, val] of Object.entries(item)) {
      if (key === "mid" || key === "cid") continue;
      attrs[key] = { value: val };
    }
    vertices[id] = attrs;
  }

  const payload = { vertices: { [vertexType]: vertices } };
  const res = await client.post(`/graph/${GRAPH}`, payload);
  console.log(`  ✅ ${vertexType}: ${items.length} vertices upserted`);
  return res.data;
}

async function seedEdges(client, edges, srcType, edgeType, tgtType) {
  for (const edge of edges) {
    const attrs = {};
    for (const [key, val] of Object.entries(edge)) {
      if (key === "from" || key === "to" || key === "medicine" || key === "condition") continue;
      attrs[key] = { value: val };
    }

    const srcId = edge.from || edge.medicine;
    const tgtId = edge.to || edge.condition;

    const payload = {
      edges: {
        [srcType]: {
          [srcId]: {
            [edgeType]: {
              [tgtType]: { [tgtId]: attrs },
            },
          },
        },
      },
    };

    await client.post(`/graph/${GRAPH}`, payload);
  }
  console.log(`  ✅ ${edgeType}: ${edges.length} edges upserted`);
}

// ── Demo patients with family relationships ─────────────────────────

async function seedDemoPatients(client) {
  const demoPatients = [
    { pid: "DEMO-PARENT-001", name: "Raj Sharma",     age: 62, gender: "male",   bmi: 31.2, hba1c: 8.5, glucose: 220, hypertension: true,  heart_disease: false, smoking: "former", risk_label: "High Risk",   risk_score: 0.85, mongo_id: "demo" },
    { pid: "DEMO-CHILD-001",  name: "Amit Sharma",    age: 34, gender: "male",   bmi: 27.1, hba1c: 6.2, glucose: 140, hypertension: false, heart_disease: false, smoking: "never",  risk_label: "Medium Risk", risk_score: 0.45, mongo_id: "demo" },
    { pid: "DEMO-SIBLING-001",name: "Priya Sharma",   age: 58, gender: "female", bmi: 29.8, hba1c: 7.8, glucose: 190, hypertension: true,  heart_disease: true,  smoking: "never",  risk_label: "High Risk",   risk_score: 0.78, mongo_id: "demo" },
    { pid: "DEMO-PATIENT-002",name: "Neha Gupta",     age: 42, gender: "female", bmi: 25.3, hba1c: 5.9, glucose: 115, hypertension: false, heart_disease: false, smoking: "never",  risk_label: "Low Risk",    risk_score: 0.22, mongo_id: "demo" },
  ];

  // Upsert patients
  const vertices = {};
  for (const p of demoPatients) {
    const id = p.pid;
    const attrs = {};
    for (const [key, val] of Object.entries(p)) {
      if (key === "pid") continue;
      attrs[key] = { value: val };
    }
    vertices[id] = attrs;
  }
  await client.post(`/graph/${GRAPH}`, { vertices: { Patient: vertices } });
  console.log(`  ✅ Demo patients: ${demoPatients.length} upserted`);

  // Family links
  const familyLinks = [
    { from: "DEMO-PARENT-001",  to: "DEMO-CHILD-001",   relation: "parent" },
    { from: "DEMO-CHILD-001",   to: "DEMO-PARENT-001",  relation: "child" },
    { from: "DEMO-PARENT-001",  to: "DEMO-SIBLING-001", relation: "sibling" },
    { from: "DEMO-SIBLING-001", to: "DEMO-PARENT-001",  relation: "sibling" },
  ];

  for (const link of familyLinks) {
    await client.post(`/graph/${GRAPH}`, {
      edges: {
        Patient: {
          [link.from]: {
            HAS_RELATIVE: {
              Patient: { [link.to]: { relation: { value: link.relation } } },
            },
          },
        },
      },
    });
  }
  console.log("  ✅ Family links: 4 edges created");

  // Give demo patients conditions
  const patientConditions = [
    { patient: "DEMO-PARENT-001",  condition: "COND-TYPE2-DIABETES", is_active: true },
    { patient: "DEMO-PARENT-001",  condition: "COND-HYPERTENSION",   is_active: true },
    { patient: "DEMO-SIBLING-001", condition: "COND-TYPE2-DIABETES", is_active: true },
    { patient: "DEMO-SIBLING-001", condition: "COND-HEART-DISEASE",  is_active: true },
    { patient: "DEMO-SIBLING-001", condition: "COND-HYPERTENSION",   is_active: true },
    { patient: "DEMO-CHILD-001",   condition: "COND-OBESITY",        is_active: true },
  ];

  for (const pc of patientConditions) {
    await client.post(`/graph/${GRAPH}`, {
      edges: {
        Patient: {
          [pc.patient]: {
            HAS_CONDITION: {
              Condition: {
                [pc.condition]: {
                  diagnosed_at: { value: new Date().toISOString() },
                  is_active: { value: pc.is_active },
                },
              },
            },
          },
        },
      },
    });
  }
  console.log(`  ✅ Patient conditions: ${patientConditions.length} edges created`);

  // Give demo patients medications
  const patientMeds = [
    { patient: "DEMO-PARENT-001",  medicine: "MED-METFORMIN",   dosage_mg: 1000, is_current: true },
    { patient: "DEMO-PARENT-001",  medicine: "MED-LISINOPRIL",  dosage_mg: 10,   is_current: true },
    { patient: "DEMO-SIBLING-001", medicine: "MED-GLIPIZIDE",   dosage_mg: 10,   is_current: true },
    { patient: "DEMO-SIBLING-001", medicine: "MED-AMLODIPINE",  dosage_mg: 5,    is_current: true },
  ];

  for (const pm of patientMeds) {
    await client.post(`/graph/${GRAPH}`, {
      edges: {
        Patient: {
          [pm.patient]: {
            TAKES: {
              Medicine: {
                [pm.medicine]: {
                  start_date: { value: new Date().toISOString() },
                  dosage_mg: { value: pm.dosage_mg },
                  is_current: { value: pm.is_current },
                },
              },
            },
          },
        },
      },
    });
  }
  console.log(`  ✅ Patient medications: ${patientMeds.length} edges created`);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding TigerGraph with NexusHealth reference data...\n");

  const client = await connectTigerGraph();
  if (!client) {
    console.error("❌ Cannot connect to TigerGraph. Set TG_HOST and TG_TOKEN in .env");
    process.exit(1);
  }

  try {
    console.log("📦 Seeding Medicines...");
    await seedVertices(client, "Medicine", medicines);

    console.log("📦 Seeding Conditions...");
    await seedVertices(client, "Condition", conditions);

    console.log("📦 Seeding Drug Interactions...");
    await seedEdges(client, drugInteractions, "Medicine", "INTERACTS_WITH", "Medicine");

    console.log("📦 Seeding Contraindications...");
    await seedEdges(client, contraindications, "Medicine", "CONTRAINDICATED", "Condition");

    console.log("📦 Seeding Demo Patients + Families...");
    await seedDemoPatients(client);

    console.log("\n🎉 Seeding complete! Your graph is ready for the demo.");
  } catch (e) {
    console.error("❌ Seeding error:", e.response?.data || e.message);
    process.exit(1);
  }
}

main();
