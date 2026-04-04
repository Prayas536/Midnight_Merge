import requests
import json
secret = "hrctcpmvckkr3n9cmeg06lop0tu4k32b"
host = "https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io"
graph = "NexusHealthGraph"

urls = [
    f"{host}/restpp/requesttoken?secret={secret}&lifetime=1000000",
    f"{host}:9000/requesttoken?secret={secret}",
]

for url in urls:
    try:
        r = requests.get(url, timeout=5)
        print(f"URL: {url} | Status: {r.status_code}")
        print(r.text[:200])
    except Exception as e:
        pass
