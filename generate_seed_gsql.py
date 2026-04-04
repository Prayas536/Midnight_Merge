import json

# Define the data exactly as setup_tigergraph did
medicines = {
    "MED-METFORMIN":     {"name": "Metformin",     "category": "Biguanide",              "typical_dosage_mg": 500},
    "MED-GLIPIZIDE":     {"name": "Glipizide",     "category": "Sulfonylurea",            "typical_dosage_mg": 5},
    "MED-INSULIN-NPH":   {"name": "Insulin NPH",   "category": "Insulin",                 "typical_dosage_mg": 10},
    "MED-SITAGLIPTIN":   {"name": "Sitagliptin",   "category": "DPP-4 Inhibitor",         "typical_dosage_mg": 100},
    "MED-EMPAGLIFLOZIN":  {"name": "Empagliflozin",  "category": "SGLT2 Inhibitor",        "typical_dosage_mg": 10},
    "MED-PIOGLITAZONE":  {"name": "Pioglitazone",  "category": "Thiazolidinedione",       "typical_dosage_mg": 30},
    "MED-LIRAGLUTIDE":   {"name": "Liraglutide",   "category": "GLP-1 Receptor Agonist",  "typical_dosage_mg": 1.2},
    "MED-AMLODIPINE":    {"name": "Amlodipine",    "category": "Calcium Channel Blocker", "typical_dosage_mg": 5},
    "MED-LISINOPRIL":    {"name": "Lisinopril",    "category": "ACE Inhibitor",           "typical_dosage_mg": 10},
    "MED-ATORVASTATIN":  {"name": "Atorvastatin",  "category": "Statin",                  "typical_dosage_mg": 20},
}

conditions = {
    "COND-HYPERTENSION":   {"name": "Hypertension",           "severity": "Medium"},
    "COND-HEART-DISEASE":  {"name": "Heart Disease",          "severity": "High"},
    "COND-OBESITY":        {"name": "Obesity",                "severity": "Medium"},
    "COND-KIDNEY-DISEASE": {"name": "Chronic Kidney Disease", "severity": "High"},
    "COND-RETINOPATHY":    {"name": "Diabetic Retinopathy",   "severity": "High"},
    "COND-NEUROPATHY":     {"name": "Diabetic Neuropathy",    "severity": "Medium"},
    "COND-TYPE2-DIABETES": {"name": "Type 2 Diabetes",        "severity": "High"},
    "COND-LIVER-DISEASE":  {"name": "Liver Disease",          "severity": "High"},
}

patients = {
    "DEMO-PARENT-001":  {"name": "Raj Sharma",   "age": 62, "gender": "male",   "bmi": 31.2, "hba1c": 8.5, "glucose": 220, "hypertension": True,  "heart_disease": False, "smoking": "former", "risk_label": "High Risk",   "risk_score": 0.85, "mongo_id": "demo"},
    "DEMO-CHILD-001":   {"name": "Amit Sharma",  "age": 34, "gender": "male",   "bmi": 27.1, "hba1c": 6.2, "glucose": 140, "hypertension": False, "heart_disease": False, "smoking": "never",  "risk_label": "Medium Risk", "risk_score": 0.45, "mongo_id": "demo"},
    "DEMO-SIBLING-001": {"name": "Priya Sharma", "age": 58, "gender": "female", "bmi": 29.8, "hba1c": 7.8, "glucose": 190, "hypertension": True,  "heart_disease": True,  "smoking": "never",  "risk_label": "High Risk",   "risk_score": 0.78, "mongo_id": "demo"},
    "DEMO-PATIENT-002": {"name": "Neha Gupta",   "age": 42, "gender": "female", "bmi": 25.3, "hba1c": 5.9, "glucose": 115, "hypertension": False, "heart_disease": False, "smoking": "never",  "risk_label": "Low Risk",    "risk_score": 0.22, "mongo_id": "demo"},
}

family_edges = [
    ("DEMO-PARENT-001", "DEMO-CHILD-001",   "parent"),
    ("DEMO-CHILD-001",  "DEMO-PARENT-001",  "child"),
    ("DEMO-PARENT-001", "DEMO-SIBLING-001", "sibling"),
    ("DEMO-SIBLING-001","DEMO-PARENT-001",  "sibling"),
]

drug_interactions = [
    ("MED-METFORMIN",   "MED-INSULIN-NPH", "Moderate", "Combined use may increase hypoglycemia risk"),
    ("MED-GLIPIZIDE",   "MED-INSULIN-NPH", "High",     "Dual insulin greatly increases hypoglycemia risk"),
    ("MED-PIOGLITAZONE","MED-INSULIN-NPH", "Moderate", "May cause fluid retention and edema"),
]

contras = [
    ("MED-METFORMIN",    "COND-KIDNEY-DISEASE", "Risk of lactic acidosis"),
    ("MED-PIOGLITAZONE", "COND-HEART-DISEASE",  "May worsen heart failure"),
    ("MED-PIOGLITAZONE", "COND-LIVER-DISEASE",  "Hepatotoxicity risk"),
    ("MED-EMPAGLIFLOZIN","COND-KIDNEY-DISEASE", "Reduced efficacy with renal impairment"),
]

patient_conds = [
    ("DEMO-PARENT-001",  "COND-TYPE2-DIABETES"),
    ("DEMO-PARENT-001",  "COND-HYPERTENSION"),
    ("DEMO-SIBLING-001", "COND-TYPE2-DIABETES"),
    ("DEMO-SIBLING-001", "COND-HEART-DISEASE"),
    ("DEMO-SIBLING-001", "COND-HYPERTENSION"),
    ("DEMO-CHILD-001",   "COND-OBESITY"),
]

patient_meds = [
    ("DEMO-PARENT-001",  "MED-METFORMIN",  1000),
    ("DEMO-PARENT-001",  "MED-LISINOPRIL", 10),
    ("DEMO-SIBLING-001", "MED-GLIPIZIDE",  10),
    ("DEMO-SIBLING-001", "MED-AMLODIPINE", 5),
]

def to_gsql_str(v):
    if isinstance(v, str): return f'"{v}"'
    if isinstance(v, bool): return 'true' if v else 'false'
    return str(v)

with open('seed.gsql', 'w') as f:
    f.write("USE GRAPH NexusHealthGraph\n")
    f.write("BEGIN\n")
    
    # Vertices
    for k, v in medicines.items():
        f.write(f'INSERT INTO Medicine VALUES ("{k}", {to_gsql_str(v["name"])}, {to_gsql_str(v["category"])}, {v["typical_dosage_mg"]});\n')
    for k, v in conditions.items():
        f.write(f'INSERT INTO Condition_ VALUES ("{k}", {to_gsql_str(v["name"])}, {to_gsql_str(v["severity"])});\n')
    for k, v in patients.items():
        # PRIMARY_ID pid STRING, name STRING, age INT, gender STRING, bmi DOUBLE, hba1c DOUBLE, glucose DOUBLE, hypertension BOOL, heart_disease BOOL, smoking STRING, risk_label STRING, risk_score DOUBLE, mongo_id STRING
        f.write(f'INSERT INTO Patient VALUES ("{k}", {to_gsql_str(v["name"])}, {v["age"]}, {to_gsql_str(v["gender"])}, {v["bmi"]}, {v["hba1c"]}, {v["glucose"]}, {to_gsql_str(v["hypertension"])}, {to_gsql_str(v["heart_disease"])}, {to_gsql_str(v["smoking"])}, {to_gsql_str(v["risk_label"])}, {v["risk_score"]}, {to_gsql_str(v["mongo_id"])});\n')
        
    # Edges
    for src, tgt, rel in family_edges:
        f.write(f'INSERT INTO HAS_RELATIVE VALUES ("{src}", "{tgt}", "{rel}");\n')
    for src, tgt, sev, desc in drug_interactions:
        f.write(f'INSERT INTO INTERACTS_WITH VALUES ("{src}", "{tgt}", "{sev}", "{desc}");\n')
    for src, tgt, reason in contras:
        f.write(f'INSERT INTO CONTRAINDICATED VALUES ("{src}", "{tgt}", "{reason}");\n')
    for src, tgt in patient_conds:
        # diagnosed_at DATETIME, is_active BOOL
        f.write(f'INSERT INTO HAS_CONDITION VALUES ("{src}", "{tgt}", "2023-01-01 00:00:00", true);\n')
    for p, m, dose in patient_meds:
        # start_date DATETIME, dosage_mg DOUBLE, is_current BOOL
        f.write(f'INSERT INTO TAKES VALUES ("{p}", "{m}", "2023-01-01 00:00:00", {dose}, true);\n')
        
    f.write("END\n")
