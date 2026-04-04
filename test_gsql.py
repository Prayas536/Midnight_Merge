import requests
host = 'https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io'
gsql = "USE GRAPH NexusHealthGraph\nLS;"
urls = [
    f"{host}/gsqlserver/gsql/file",
    f"{host}/gsqlserver/gsql",
    f"{host}/api/v2/gsql",
    f"{host}/gsql",
]
for url in urls:
    try:
        r = requests.post(url, data=gsql, auth=('tigergraph', 'tigergraph'), timeout=5)
        print(f"URL: {url} | Status: {r.status_code}")
        print(f"Resp: {r.text[:200]}")
    except Exception as e:
        print(f"URL: {url} | Error: {e}")
