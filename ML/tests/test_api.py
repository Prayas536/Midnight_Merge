from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_health_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "ML + AI service running" in data["status"]

def test_health_detailed():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
