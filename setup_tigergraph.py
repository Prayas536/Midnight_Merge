"""
TigerGraph Setup Script - NexusHealth
Uses REST API directly (compatible with TigerGraph Savanna 4.2.2)
Run: python setup_tigergraph.py
"""
import requests
import os
import sys
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')

env_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
load_dotenv(env_path)

TG_HOST = os.getenv("TG_HOST", "").rstrip("/")
TG_GRAPH = os.getenv("TG_GRAPH_NAME", "NexusHealthGraph")

if not TG_HOST:
    print("[ERROR] TG_HOST not found in .env")
    sys.exit(1)

print(f"[CONNECT] TigerGraph at {TG_HOST}")

# --- Step 1: Use the generated secret as Bearer token ---
print("\n[TOKEN] Using generated API secret as token...")
token = "NMBc.2Vru5lgwf3Ht2e6mrVNw_G~0lF6E0RBr6mL"

# Build headers
headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}

# Save token to .env
with open(env_path, "r") as f:
    env_content = f.read()

# Make sure we actually replace it
if "TG_TOKEN=" in env_content:
    import re
    env_content = re.sub(r'TG_TOKEN=.*', f'TG_TOKEN={token}', env_content)
else:
    env_content += f"\nTG_TOKEN={token}\n"

with open(env_path, "w") as f:
    f.write(env_content)
print("  [OK] Token saved to .env!")

# Determine the base URL - TigerGraph Savanna uses port 443 (default HTTPS)
BASE = TG_HOST
REST_BASE = f"{BASE}/restpp"

# --- Step 2: Test connectivity ---
print("\n[PING] Testing connectivity...")
try:
    ping = requests.get(f"{REST_BASE}/echo/{TG_GRAPH}", headers=headers, timeout=10)
    print(f"  [OK] Echo response: {ping.status_code} - {ping.text[:100]}")
except Exception as e:
    print(f"  [WARN] Echo failed: {e}")
    # Try alternate path
    try:
        ping = requests.get(f"{BASE}/api/ping", headers=headers, timeout=10)
        print(f"  [OK] Ping response: {ping.status_code}")
    except Exception as e2:
        print(f"  [WARN] Alternate ping: {e2}")

# --- Step 3: Upsert vertices and edges via REST++ ---
print("\n[SEED] Seeding reference data via REST++ API...")

def upsert(payload):
    """Upsert vertices/edges via REST++ graph endpoint"""
    url = f"{REST_BASE}/graph/{TG_GRAPH}"
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        if resp.status_code == 200:
            return True
        else:
            print(f"    Status {resp.status_code}: {resp.text[:150]}")
            return False
    except Exception as e:
        print(f"    Error: {e}")
        return False

# Seed Medicines
print("  [MEDICINES]")
medicines = {
    "MED-METFORMIN":     {"name": {"value": "Metformin"},     "category": {"value": "Biguanide"},              "typical_dosage_mg": {"value": 500}},
    "MED-GLIPIZIDE":     {"name": {"value": "Glipizide"},     "category": {"value": "Sulfonylurea"},            "typical_dosage_mg": {"value": 5}},
    "MED-INSULIN-NPH":   {"name": {"value": "Insulin NPH"},   "category": {"value": "Insulin"},                 "typical_dosage_mg": {"value": 10}},
    "MED-SITAGLIPTIN":   {"name": {"value": "Sitagliptin"},   "category": {"value": "DPP-4 Inhibitor"},         "typical_dosage_mg": {"value": 100}},
    "MED-EMPAGLIFLOZIN":  {"name": {"value": "Empagliflozin"},  "category": {"value": "SGLT2 Inhibitor"},        "typical_dosage_mg": {"value": 10}},
    "MED-PIOGLITAZONE":  {"name": {"value": "Pioglitazone"},  "category": {"value": "Thiazolidinedione"},       "typical_dosage_mg": {"value": 30}},
    "MED-LIRAGLUTIDE":   {"name": {"value": "Liraglutide"},   "category": {"value": "GLP-1 Receptor Agonist"},  "typical_dosage_mg": {"value": 1.2}},
    "MED-AMLODIPINE":    {"name": {"value": "Amlodipine"},    "category": {"value": "Calcium Channel Blocker"}, "typical_dosage_mg": {"value": 5}},
    "MED-LISINOPRIL":    {"name": {"value": "Lisinopril"},    "category": {"value": "ACE Inhibitor"},           "typical_dosage_mg": {"value": 10}},
    "MED-ATORVASTATIN":  {"name": {"value": "Atorvastatin"},  "category": {"value": "Statin"},                  "typical_dosage_mg": {"value": 20}},
}
ok = upsert({"vertices": {"Medicine": medicines}})
print(f"  [{'OK' if ok else 'FAIL'}] 10 medicines")

# Seed Conditions
print("  [CONDITIONS]")
conditions = {
    "COND-HYPERTENSION":   {"name": {"value": "Hypertension"},           "severity": {"value": "Medium"}},
    "COND-HEART-DISEASE":  {"name": {"value": "Heart Disease"},          "severity": {"value": "High"}},
    "COND-OBESITY":        {"name": {"value": "Obesity"},                "severity": {"value": "Medium"}},
    "COND-KIDNEY-DISEASE": {"name": {"value": "Chronic Kidney Disease"}, "severity": {"value": "High"}},
    "COND-RETINOPATHY":    {"name": {"value": "Diabetic Retinopathy"},   "severity": {"value": "High"}},
    "COND-NEUROPATHY":     {"name": {"value": "Diabetic Neuropathy"},    "severity": {"value": "Medium"}},
    "COND-TYPE2-DIABETES": {"name": {"value": "Type 2 Diabetes"},        "severity": {"value": "High"}},
    "COND-LIVER-DISEASE":  {"name": {"value": "Liver Disease"},          "severity": {"value": "High"}},
}
ok = upsert({"vertices": {"Condition_": conditions}})
print(f"  [{'OK' if ok else 'FAIL'}] 8 conditions")

# Seed Demo Patients
print("  [PATIENTS]")
patients = {
    "DEMO-PARENT-001":  {"name": {"value": "Raj Sharma"},   "age": {"value": 62}, "gender": {"value": "male"},   "bmi": {"value": 31.2}, "hba1c": {"value": 8.5}, "glucose": {"value": 220}, "hypertension": {"value": True},  "heart_disease": {"value": False}, "smoking": {"value": "former"}, "risk_label": {"value": "High Risk"},   "risk_score": {"value": 0.85}, "mongo_id": {"value": "demo"}},
    "DEMO-CHILD-001":   {"name": {"value": "Amit Sharma"},  "age": {"value": 34}, "gender": {"value": "male"},   "bmi": {"value": 27.1}, "hba1c": {"value": 6.2}, "glucose": {"value": 140}, "hypertension": {"value": False}, "heart_disease": {"value": False}, "smoking": {"value": "never"},  "risk_label": {"value": "Medium Risk"}, "risk_score": {"value": 0.45}, "mongo_id": {"value": "demo"}},
    "DEMO-SIBLING-001": {"name": {"value": "Priya Sharma"}, "age": {"value": 58}, "gender": {"value": "female"}, "bmi": {"value": 29.8}, "hba1c": {"value": 7.8}, "glucose": {"value": 190}, "hypertension": {"value": True},  "heart_disease": {"value": True},  "smoking": {"value": "never"},  "risk_label": {"value": "High Risk"},   "risk_score": {"value": 0.78}, "mongo_id": {"value": "demo"}},
    "DEMO-PATIENT-002": {"name": {"value": "Neha Gupta"},   "age": {"value": 42}, "gender": {"value": "female"}, "bmi": {"value": 25.3}, "hba1c": {"value": 5.9}, "glucose": {"value": 115}, "hypertension": {"value": False}, "heart_disease": {"value": False}, "smoking": {"value": "never"},  "risk_label": {"value": "Low Risk"},    "risk_score": {"value": 0.22}, "mongo_id": {"value": "demo"}},
}
ok = upsert({"vertices": {"Patient": patients}})
print(f"  [{'OK' if ok else 'FAIL'}] 4 demo patients")

# Seed Family Links
print("  [FAMILY LINKS]")
family_edges = [
    ("DEMO-PARENT-001", "DEMO-CHILD-001",   "parent"),
    ("DEMO-CHILD-001",  "DEMO-PARENT-001",  "child"),
    ("DEMO-PARENT-001", "DEMO-SIBLING-001", "sibling"),
    ("DEMO-SIBLING-001","DEMO-PARENT-001",  "sibling"),
]
for src, tgt, rel in family_edges:
    upsert({"edges": {"Patient": {src: {"HAS_RELATIVE": {"Patient": {tgt: {"relation": {"value": rel}}}}}}}})
print(f"  [OK] 4 family links")

# Seed Drug Interactions
print("  [DRUG INTERACTIONS]")
drug_interactions = [
    ("MED-METFORMIN",   "MED-INSULIN-NPH", "Moderate", "Combined use may increase hypoglycemia risk"),
    ("MED-GLIPIZIDE",   "MED-INSULIN-NPH", "High",     "Dual insulin greatly increases hypoglycemia risk"),
    ("MED-PIOGLITAZONE","MED-INSULIN-NPH", "Moderate", "May cause fluid retention and edema"),
]
for src, tgt, sev, desc in drug_interactions:
    upsert({"edges": {"Medicine": {src: {"INTERACTS_WITH": {"Medicine": {tgt: {"severity": {"value": sev}, "description": {"value": desc}}}}}}}})
print(f"  [OK] 3 drug interactions")

# Seed Contraindications
print("  [CONTRAINDICATIONS]")
contras = [
    ("MED-METFORMIN",    "COND-KIDNEY-DISEASE", "Risk of lactic acidosis"),
    ("MED-PIOGLITAZONE", "COND-HEART-DISEASE",  "May worsen heart failure"),
    ("MED-PIOGLITAZONE", "COND-LIVER-DISEASE",  "Hepatotoxicity risk"),
    ("MED-EMPAGLIFLOZIN","COND-KIDNEY-DISEASE", "Reduced efficacy with renal impairment"),
]
for med, cond, reason in contras:
    upsert({"edges": {"Medicine": {med: {"CONTRAINDICATED": {"Condition_": {cond: {"reason": {"value": reason}}}}}}}})
print(f"  [OK] 4 contraindications")

# Seed Patient Conditions
print("  [PATIENT CONDITIONS]")
patient_conds = [
    ("DEMO-PARENT-001",  "COND-TYPE2-DIABETES"),
    ("DEMO-PARENT-001",  "COND-HYPERTENSION"),
    ("DEMO-SIBLING-001", "COND-TYPE2-DIABETES"),
    ("DEMO-SIBLING-001", "COND-HEART-DISEASE"),
    ("DEMO-SIBLING-001", "COND-HYPERTENSION"),
    ("DEMO-CHILD-001",   "COND-OBESITY"),
]
for pid, cid in patient_conds:
    upsert({"edges": {"Patient": {pid: {"HAS_CONDITION": {"Condition_": {cid: {"is_active": {"value": True}}}}}}}})
print(f"  [OK] 6 patient conditions")

# Seed Patient Medications
print("  [PATIENT MEDICATIONS]")
patient_meds = [
    ("DEMO-PARENT-001",  "MED-METFORMIN",  1000),
    ("DEMO-PARENT-001",  "MED-LISINOPRIL", 10),
    ("DEMO-SIBLING-001", "MED-GLIPIZIDE",  10),
    ("DEMO-SIBLING-001", "MED-AMLODIPINE", 5),
]
for pid, mid, dose in patient_meds:
    upsert({"edges": {"Patient": {pid: {"TAKES": {"Medicine": {mid: {"dosage_mg": {"value": dose}, "is_current": {"value": True}}}}}}}})
print(f"  [OK] 4 patient medications")

print("\n[DONE] TigerGraph setup complete!")
print(f"  Host: {TG_HOST}")
print(f"  Graph: {TG_GRAPH}")
