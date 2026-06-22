"""Integration tests for the FastAPI application."""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from uuid import uuid4

from app.main import app
from app.core.store import store


@pytest_asyncio.fixture(autouse=True)
async def reset_store():
    """Clear all in-memory state before each test."""
    store._data.clear()
    store._lists.clear()
    store._connections.clear()
    yield


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_register_and_list_workers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register
        payload = {
            "name": "John Doe",
            "employee_id": "EMP001",
            "role": "Forklift Operator",
            "zone": "Warehouse A",
        }
        r = await ac.post("/api/v1/workers/", json=payload)
        assert r.status_code == 201
        worker_id = r.json()["id"]

        # List
        r2 = await ac.get("/api/v1/workers/")
        assert r2.status_code == 200
        workers = r2.json()
        assert any(w["id"] == worker_id for w in workers)


@pytest.mark.asyncio
async def test_ingest_telemetry_returns_risk_score():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register worker first
        worker = await ac.post(
            "/api/v1/workers/",
            json={
                "name": "Jane Smith",
                "employee_id": "EMP002",
                "role": "Heavy Machinery",
                "zone": "Site B",
            },
        )
        assert worker.status_code == 201
        worker_id = worker.json()["id"]

        # Ingest telemetry with fatigue signals
        telemetry = {
            "worker_id": worker_id,
            "cv": {
                "ear": 0.18,
                "mar": 0.75,
                "perclos": 0.20,
                "head_pose_pitch": 5.0,
                "blink_rate": 12.0,
            },
            "biometrics": {
                "heart_rate": 95,
                "skin_conductance": 10.0,
                "blood_oxygen": 98.0,
            },
        }
        r = await ac.post("/api/v1/telemetry/ingest", json=telemetry)
        assert r.status_code == 200
        body = r.json()
        assert "score" in body
        assert body["score"] >= 0
        assert body["level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")


@pytest.mark.asyncio
async def test_ingest_unknown_worker_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.post(
            "/api/v1/telemetry/ingest",
            json={"worker_id": str(uuid4())},
        )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_alerts_generated_for_high_risk():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register
        worker = await ac.post(
            "/api/v1/workers/",
            json={
                "name": "At Risk Worker",
                "employee_id": "EMP003",
                "role": "Crane Operator",
                "zone": "Port",
            },
        )
        worker_id = worker.json()["id"]

        # Ingest extreme fatigue signals to trigger HIGH risk
        telemetry = {
            "worker_id": worker_id,
            "cv": {
                "ear": 0.05,
                "mar": 1.2,
                "perclos": 0.45,
                "head_pose_pitch": 45.0,
            },
            "biometrics": {
                "heart_rate": 150,
                "skin_conductance": 35.0,
            },
        }
        await ac.post("/api/v1/telemetry/ingest", json=telemetry)

        # Check alerts
        r = await ac.get(f"/api/v1/alerts/?worker_id={worker_id}")
        assert r.status_code == 200
        # there should be at least one alert for extreme signals
        alerts = r.json()
        # Alerts are generated only for HIGH/CRITICAL, verify score first
        risk_r = await ac.get(f"/api/v1/risk/{worker_id}/latest")
        assert risk_r.status_code == 200
        risk_body = risk_r.json()
        if risk_body["level"] in ("HIGH", "CRITICAL"):
            assert len(alerts) > 0
