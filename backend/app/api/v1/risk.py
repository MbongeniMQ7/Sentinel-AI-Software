"""Risk score query endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.core.store import store
from app.models import RiskScore

router = APIRouter(prefix="/risk", tags=["risk"])


@router.get("/{worker_id}/latest", response_model=RiskScore)
async def get_latest_risk(worker_id: UUID) -> RiskScore:
    """Return the most recent risk score for a worker."""
    raw = await store.get(f"risk:{worker_id}:latest")
    if raw is None:
        raise HTTPException(
            status_code=404,
            detail="No risk score recorded yet for this worker",
        )
    return RiskScore.model_validate_json(raw)


@router.get("/{worker_id}/history")
async def get_risk_history(worker_id: UUID, limit: int = 60):
    """Return the last N risk scores for a worker."""
    from app.services.telemetry_service import telemetry_service
    worker = await telemetry_service.get_worker(worker_id)
    if worker is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    history = await telemetry_service.get_risk_history(worker_id, limit=limit)
    return [r.model_dump() for r in history]
