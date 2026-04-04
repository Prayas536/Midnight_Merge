import requests

secret = "hrctcpmvckkr3n9cmeg06lop0tu4k32b"
host = "https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io"
url = f"{host}/restpp/requesttoken"

def test(desc, headers, data):
    print(f"\n--- {desc} ---")
    try:
        r = requests.post(url, headers=headers, data=data, timeout=5)
        print(f"Status: {r.status_code}")
        print(f"Resp: {r.text[:150]}")
    except Exception as e:
        print(f"Error: {e}")

test("application/json", {"Content-Type": "application/json"}, '{"secret":"' + secret + '"}')
test("text/plain", {"Content-Type": "text/plain"}, '{"secret":"' + secret + '"}')
test("application/x-www-form-urlencoded", {"Content-Type": "application/x-www-form-urlencoded"}, f"secret={secret}")

# Test with GET but putting it in data
try:
    r = requests.get(url, data=f'{{"secret":"{secret}"}}', headers={"Content-Type": "application/json"}, timeout=5)
    print(f"\n--- GET with body --- Status: {r.status_code}")
except:
    pass

# Test standard REST++ auth query param!
try:
    r = requests.post(host + f"/restpp/requesttoken?secret={secret}", data='{"lifetime": 1000000}', headers={"Content-Type": "application/json"}, timeout=5)
    print(f"\n--- POST with query param --- Status: {r.status_code}")
except:
    pass
