"""Alert management endpoints."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.models import Alert, AlertAcknowledge
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=List[Alert])
async def list_alerts(worker_id: Optional[UUID] = None, limit: int = 50):
    """List recent alerts, optionally filtered by worker."""
    return await telemetry_service.list_alerts(worker_id=worker_id, limit=limit)


@router.post("/{alert_id}/acknowledge", response_model=Alert)
async def acknowledge_alert(alert_id: UUID, body: AlertAcknowledge) -> Alert:
    """Acknowledge an alert."""
    alert = await telemetry_service.acknowledge_alert(alert_id, body.acknowledged_by)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
