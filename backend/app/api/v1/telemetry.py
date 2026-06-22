"""Telemetry ingestion endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.models import RiskScore, TelemetryPayload
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("/ingest", response_model=RiskScore, status_code=status.HTTP_200_OK)
async def ingest_telemetry(payload: TelemetryPayload) -> RiskScore:
    """Ingest a telemetry payload from an IoT device or edge node.

    Returns the computed risk score immediately so edge devices can act on it.
    """
    worker = await telemetry_service.get_worker(payload.worker_id)
    if worker is None:
        raise HTTPException(
            status_code=404,
            detail=f"Worker {payload.worker_id} not found. Register the worker first.",
        )
    return await telemetry_service.ingest(payload)


@router.get("/{worker_id}/history", response_model=list)
async def get_telemetry_history(worker_id: UUID, limit: int = 60):
    """Return the last N risk scores for a worker (default 60)."""
    worker = await telemetry_service.get_worker(worker_id)
    if worker is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    history = await telemetry_service.get_risk_history(worker_id, limit=limit)
    return [r.model_dump() for r in history]
