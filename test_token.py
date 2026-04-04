import requests
import json

secret = "hrctcpmvckkr3n9cmeg06lop0tu4k32b"
host = "https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io"

def test_payload(payload):
    print(f"\n--- Testing payload: {payload} ---")
    headers = {"Content-Type": "application/json"}
    try:
        r = requests.post(f"{host}/restpp/requesttoken", json=payload, headers=headers, timeout=10)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

test_payload({"secret": secret})
test_payload({"secret": secret, "graph": "NexusHealthGraph"})
test_payload({"secret": secret, "lifetime": 100000})

def test_data(data_str):
    print(f"\n--- Testing data string: {data_str} ---")
    headers = {}
    try:
        r = requests.post(f"{host}/restpp/requesttoken", data=data_str, headers=headers, timeout=10)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

test_data(f'{{"secret": "{secret}"}}')

print("\n--- Testing GET request ---")
try:
    r = requests.get(f"{host}/restpp/requesttoken?secret={secret}", timeout=10)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
