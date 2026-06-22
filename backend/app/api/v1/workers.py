"""Worker management endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.models import Worker, WorkerCreate, WorkerStatus, WorkerWithRisk
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/workers", tags=["workers"])


@router.post("/", response_model=Worker, status_code=status.HTTP_201_CREATED)
async def register_worker(data: WorkerCreate) -> Worker:
    """Register a new worker in the system."""
    return await telemetry_service.register_worker(data)


@router.get("/", response_model=List[WorkerWithRisk])
async def list_workers() -> List[WorkerWithRisk]:
    """List all registered workers with their latest risk scores."""
    return await telemetry_service.list_workers()


@router.get("/{worker_id}", response_model=WorkerWithRisk)
async def get_worker(worker_id: UUID) -> WorkerWithRisk:
    """Get a single worker with their latest risk score."""
    worker = await telemetry_service.get_worker(worker_id)
    if worker is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    risk_raw = None
    from app.core.store import store
    risk_raw = await store.get(f"risk:{worker_id}:latest")
    from app.models import RiskScore, RiskLevel
    risk = RiskScore.model_validate_json(risk_raw) if risk_raw else None
    return WorkerWithRisk(
        **worker.model_dump(),
        risk_score=risk.score if risk else 0.0,
        risk_level=risk.level if risk else RiskLevel.LOW,
        last_seen=risk.timestamp if risk else None,
    )


@router.patch("/{worker_id}/status", response_model=Worker)
async def update_status(worker_id: UUID, status: WorkerStatus) -> Worker:
    """Update a worker's operational status."""
    worker = await telemetry_service.update_worker_status(worker_id, status)
    if worker is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker
