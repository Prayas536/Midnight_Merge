"""
Create TigerGraph Schema via pyTigerGraph gsql() method
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import pyTigerGraph as tg

HOST = "https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io"
GRAPH = "NexusHealthGraph"

print("[1/3] Connecting...")
try:
    conn = tg.TigerGraphConnection(
        host=HOST,
        username="tigergraph",
        password="tigergraph",
    )
    print("  OK - connected")
except Exception as e:
    print(f"  ERROR: {e}")
    # Try alternate init
    conn = tg.TigerGraphConnection(host=HOST)
    print("  OK - connected (no auth)")

print("[2/3] Creating schema vertices and edges...")
schema = f"""
USE GLOBAL
CREATE VERTEX Patient (PRIMARY_ID pid STRING, name STRING, age INT, gender STRING, bmi DOUBLE, hba1c DOUBLE, glucose DOUBLE, hypertension BOOL, heart_disease BOOL, smoking STRING, risk_label STRING, risk_score DOUBLE, mongo_id STRING) WITH primary_id_as_attribute="true"
CREATE VERTEX Doctor (PRIMARY_ID did STRING, name STRING, email STRING, mongo_id STRING) WITH primary_id_as_attribute="true"
CREATE VERTEX Medicine (PRIMARY_ID mid STRING, name STRING, category STRING, typical_dosage_mg DOUBLE) WITH primary_id_as_attribute="true"
CREATE VERTEX Condition_ (PRIMARY_ID cid STRING, name STRING, severity STRING) WITH primary_id_as_attribute="true"
CREATE VERTEX LabResult (PRIMARY_ID lid STRING, test_date DATETIME, hba1c DOUBLE, glucose DOUBLE, bmi DOUBLE, visit_mongo_id STRING) WITH primary_id_as_attribute="true"
CREATE DIRECTED EDGE TREATS (FROM Doctor, TO Patient, since DATETIME)
CREATE DIRECTED EDGE HAS_RELATIVE (FROM Patient, TO Patient, relation STRING)
CREATE DIRECTED EDGE HAS_CONDITION (FROM Patient, TO Condition_, diagnosed_at DATETIME, is_active BOOL)
CREATE DIRECTED EDGE PRESCRIBED (FROM Doctor, TO Medicine, for_patient STRING, prescribed_at DATETIME, dosage_mg DOUBLE)
CREATE DIRECTED EDGE TAKES (FROM Patient, TO Medicine, start_date DATETIME, dosage_mg DOUBLE, is_current BOOL)
CREATE DIRECTED EDGE INTERACTS_WITH (FROM Medicine, TO Medicine, severity STRING, description STRING)
CREATE DIRECTED EDGE CONTRAINDICATED (FROM Medicine, TO Condition_, reason STRING)
CREATE DIRECTED EDGE HAS_LAB_RESULT (FROM Patient, TO LabResult)
"""
try:
    result = conn.gsql(schema)
    print(f"  Schema result: {result}")
except Exception as e:
    print(f"  Schema error: {e}")

print("[3/3] Adding types to graph...")
add_graph = f"""
USE GRAPH {GRAPH}
ALTER GRAPH {GRAPH} ADD VERTEX Patient, Doctor, Medicine, Condition_, LabResult
ALTER GRAPH {GRAPH} ADD EDGE TREATS, HAS_RELATIVE, HAS_CONDITION, PRESCRIBED, TAKES, INTERACTS_WITH, CONTRAINDICATED, HAS_LAB_RESULT
"""
try:
    result = conn.gsql(add_graph)
    print(f"  Graph alter result: {result}")
except Exception as e:
    print(f"  Graph alter error: {e}")

print("\n[DONE]")
