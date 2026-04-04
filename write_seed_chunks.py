medicines = """USE GRAPH NexusHealthGraph
BEGIN
INSERT INTO Medicine VALUES ("MED-METFORMIN", "Metformin", "Biguanide", 500);
INSERT INTO Medicine VALUES ("MED-GLIPIZIDE", "Glipizide", "Sulfonylurea", 5);
INSERT INTO Medicine VALUES ("MED-INSULIN-NPH", "Insulin NPH", "Insulin", 10);
INSERT INTO Medicine VALUES ("MED-SITAGLIPTIN", "Sitagliptin", "DPP-4 Inhibitor", 100);
INSERT INTO Medicine VALUES ("MED-EMPAGLIFLOZIN", "Empagliflozin", "SGLT2 Inhibitor", 10);
INSERT INTO Medicine VALUES ("MED-PIOGLITAZONE", "Pioglitazone", "Thiazolidinedione", 30);
INSERT INTO Medicine VALUES ("MED-LIRAGLUTIDE", "Liraglutide", "GLP-1 Receptor Agonist", 1.2);
INSERT INTO Medicine VALUES ("MED-AMLODIPINE", "Amlodipine", "Calcium Channel Blocker", 5);
INSERT INTO Medicine VALUES ("MED-LISINOPRIL", "Lisinopril", "ACE Inhibitor", 10);
INSERT INTO Medicine VALUES ("MED-ATORVASTATIN", "Atorvastatin", "Statin", 20);
END
"""

conditions = """USE GRAPH NexusHealthGraph
BEGIN
INSERT INTO Condition_ VALUES ("COND-HYPERTENSION", "Hypertension", "Medium");
INSERT INTO Condition_ VALUES ("COND-HEART-DISEASE", "Heart Disease", "High");
INSERT INTO Condition_ VALUES ("COND-OBESITY", "Obesity", "Medium");
INSERT INTO Condition_ VALUES ("COND-KIDNEY-DISEASE", "Chronic Kidney Disease", "High");
INSERT INTO Condition_ VALUES ("COND-RETINOPATHY", "Diabetic Retinopathy", "High");
INSERT INTO Condition_ VALUES ("COND-NEUROPATHY", "Diabetic Neuropathy", "Medium");
INSERT INTO Condition_ VALUES ("COND-TYPE2-DIABETES", "Type 2 Diabetes", "High");
INSERT INTO Condition_ VALUES ("COND-LIVER-DISEASE", "Liver Disease", "High");
END
"""

patients = """USE GRAPH NexusHealthGraph
BEGIN
INSERT INTO Patient VALUES ("DEMO-PARENT-001", "Raj Sharma", 62, "male", 31.2, 8.5, 220, true, false, "former", "High Risk", 0.85, "demo");
INSERT INTO Patient VALUES ("DEMO-CHILD-001", "Amit Sharma", 34, "male", 27.1, 6.2, 140, false, false, "never", "Medium Risk", 0.45, "demo");
INSERT INTO Patient VALUES ("DEMO-SIBLING-001", "Priya Sharma", 58, "female", 29.8, 7.8, 190, true, true, "never", "High Risk", 0.78, "demo");
INSERT INTO Patient VALUES ("DEMO-PATIENT-002", "Neha Gupta", 42, "female", 25.3, 5.9, 115, false, false, "never", "Low Risk", 0.22, "demo");
END
"""

edges1 = """USE GRAPH NexusHealthGraph
BEGIN
INSERT INTO HAS_RELATIVE VALUES ("DEMO-PARENT-001", "DEMO-CHILD-001", "parent");
INSERT INTO HAS_RELATIVE VALUES ("DEMO-CHILD-001", "DEMO-PARENT-001", "child");
INSERT INTO HAS_RELATIVE VALUES ("DEMO-PARENT-001", "DEMO-SIBLING-001", "sibling");
INSERT INTO HAS_RELATIVE VALUES ("DEMO-SIBLING-001", "DEMO-PARENT-001", "sibling");
INSERT INTO INTERACTS_WITH VALUES ("MED-METFORMIN", "MED-INSULIN-NPH", "Moderate", "Combined use may increase hypoglycemia risk");
INSERT INTO INTERACTS_WITH VALUES ("MED-GLIPIZIDE", "MED-INSULIN-NPH", "High", "Dual insulin greatly increases hypoglycemia risk");
INSERT INTO INTERACTS_WITH VALUES ("MED-PIOGLITAZONE", "MED-INSULIN-NPH", "Moderate", "May cause fluid retention and edema");
INSERT INTO CONTRAINDICATED VALUES ("MED-METFORMIN", "COND-KIDNEY-DISEASE", "Risk of lactic acidosis");
INSERT INTO CONTRAINDICATED VALUES ("MED-PIOGLITAZONE", "COND-HEART-DISEASE", "May worsen heart failure");
INSERT INTO CONTRAINDICATED VALUES ("MED-PIOGLITAZONE", "COND-LIVER-DISEASE", "Hepatotoxicity risk");
INSERT INTO CONTRAINDICATED VALUES ("MED-EMPAGLIFLOZIN", "COND-KIDNEY-DISEASE", "Reduced efficacy with renal impairment");
END
"""

edges2 = """USE GRAPH NexusHealthGraph
BEGIN
INSERT INTO HAS_CONDITION VALUES ("DEMO-PARENT-001", "COND-TYPE2-DIABETES", "2023-01-01 00:00:00", true);
INSERT INTO HAS_CONDITION VALUES ("DEMO-PARENT-001", "COND-HYPERTENSION", "2023-01-01 00:00:00", true);
INSERT INTO HAS_CONDITION VALUES ("DEMO-SIBLING-001", "COND-TYPE2-DIABETES", "2023-01-01 00:00:00", true);
INSERT INTO HAS_CONDITION VALUES ("DEMO-SIBLING-001", "COND-HEART-DISEASE", "2023-01-01 00:00:00", true);
INSERT INTO HAS_CONDITION VALUES ("DEMO-SIBLING-001", "COND-HYPERTENSION", "2023-01-01 00:00:00", true);
INSERT INTO HAS_CONDITION VALUES ("DEMO-CHILD-001", "COND-OBESITY", "2023-01-01 00:00:00", true);
INSERT INTO TAKES VALUES ("DEMO-PARENT-001", "MED-METFORMIN", "2023-01-01 00:00:00", 1000, true);
INSERT INTO TAKES VALUES ("DEMO-PARENT-001", "MED-LISINOPRIL", "2023-01-01 00:00:00", 10, true);
INSERT INTO TAKES VALUES ("DEMO-SIBLING-001", "MED-GLIPIZIDE", "2023-01-01 00:00:00", 10, true);
INSERT INTO TAKES VALUES ("DEMO-SIBLING-001", "MED-AMLODIPINE", "2023-01-01 00:00:00", 5, true);
END
"""

browser_dir = r'C:\Users\praya\.gemini\antigravity\brain\a1ab89a4-6874-4931-95de-2496aa64a5ee\browser'
import os
os.makedirs(browser_dir, exist_ok=True)
with open(os.path.join(browser_dir, 'seed1.gsql'), 'w') as f: f.write(medicines)
with open(os.path.join(browser_dir, 'seed2.gsql'), 'w') as f: f.write(conditions)
with open(os.path.join(browser_dir, 'seed3.gsql'), 'w') as f: f.write(patients)
with open(os.path.join(browser_dir, 'seed4.gsql'), 'w') as f: f.write(edges1)
with open(os.path.join(browser_dir, 'seed5.gsql'), 'w') as f: f.write(edges2)
print("Files created.")
