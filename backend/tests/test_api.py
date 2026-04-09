import os
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret")

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200

def test_register_login():
    r = client.post("/api/auth/register", json={
        "username": "testuser", "email": "test@example.com", "password": "pass123"
    })
    assert r.status_code == 201
    assert "access_token" in r.json()

    r = client.post("/api/auth/login", json={"email": "test@example.com", "password": "pass123"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_list_events_empty():
    r = client.get("/api/events/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_duplicate_email():
    client.post("/api/auth/register", json={"username": "u2", "email": "dup@test.com", "password": "x"})
    r = client.post("/api/auth/register", json={"username": "u3", "email": "dup@test.com", "password": "x"})
    assert r.status_code == 400
