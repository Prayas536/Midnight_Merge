import base64
import requests

host = "https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io"
url = f"{host}/restpp/graph/NexusHealthGraph"

# Create Basic Auth header
auth_str = "tigergraph:tigergraph"
b64_auth = base64.b64encode(auth_str.encode()).decode()
headers = {
    "Authorization": f"Basic {b64_auth}",
    "Content-Type": "application/json"
}

payload = {
    "vertices": {
        "Medicine": {
            "MED-TEST": {
                "name": {"value": "TestMed"},
                "category": {"value": "Test Category"},
                "typical_dosage_mg": {"value": 10}
            }
        }
    }
}

try:
    print(f"Testing Basic Auth on {url}...")
    r = requests.post(url, json=payload, headers=headers, timeout=10)
    print(f"Status: {r.status_code}")
    print(r.text)
except Exception as e:
    print(e)
