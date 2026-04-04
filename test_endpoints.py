import requests

secret = "hrctcpmvckkr3n9cmeg06lop0tu4k32b"
host = "https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io"

urls = [
    f"{host}/restpp/requesttoken",
    f"{host}/requesttoken",
    f"{host}/api/v2/auth/token",
    f"{host}/gsqlserver/requesttoken",
    f"{host}/restpp/requesttoken?secret={secret}",
    f"{host}/requesttoken?secret={secret}"
]

for url in urls:
    print(f"\n--- Testing url: {url} ---")
    try:
        r = requests.post(url, json={"secret": secret}, headers={"Content-Type": "application/json"}, timeout=5)
        print(f"POST Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print(f"POST Error: {e}")
        
    try:
        r = requests.get(url, timeout=5)
        print(f"GET Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print(f"GET Error: {e}")
