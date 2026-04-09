import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SECRET_KEY"]   = "test-secret"

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_health():
    assert client.get("/api/health").status_code == 200

def test_register_and_login():
    r = client.post("/api/auth/register", json={
        "username": "testuser", "email": "test@test.com", "password": "pass123"
    })
    assert r.status_code == 201
    assert "access_token" in r.json()

    r = client.post("/api/auth/login", json={"email": "test@test.com", "password": "pass123"})
    assert r.status_code == 200

def test_list_events():
    r = client.get("/api/events/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_duplicate_email():
    client.post("/api/auth/register", json={"username": "a", "email": "dup@test.com", "password": "x"})
    r = client.post("/api/auth/register", json={"username": "b", "email": "dup@test.com", "password": "x"})
    assert r.status_code == 400
