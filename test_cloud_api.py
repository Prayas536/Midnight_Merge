import requests

# The token generated from API Keys tab in Cloud Portal
api_key = "NMBc.2Vru5lgwf3Ht2e6mrVNw_G~0lF6E0RBr6mL"

workspace_id = "tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100"
domain = "i.tgcloud.io"

# Cloud Portal v1 API endpoint for GSQL
url_v1 = f"https://api.tigergraph.io/v1/workspaces/{workspace_id}/gsql"
# Also test direct GSQL endpoint with Bearer token
url_direct = f"https://{workspace_id}.{domain}/gsql"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "text/plain"
}

body = "USE GRAPH NexusHealthGraph\nLS;"

print("\n--- Testing api.tigergraph.io ---")
try:
    r = requests.post(url_v1, data=body, headers=headers, timeout=5)
    print(r.status_code, r.text)
except Exception as e:
    print(e)
    
print("\n--- Testing direct /gsql endpoint ---")
try:
    r = requests.post(url_direct, data=body, headers=headers, timeout=5)
    print(r.status_code, r.text)
except Exception as e:
    print(e)
