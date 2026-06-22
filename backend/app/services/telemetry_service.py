"""Telemetry ingestion and state management service.

Responsible for:
  • Maintaining in-memory worker registry
  • Persisting telemetry readings to the store
  • Running the risk engine on every inbound payload
  • Generating and storing alerts
  • Fanning out real-time events via the store's broadcast mechanism
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from app.core.config import settings
from app.core.store import store
from app.models import (
    Alert,
    AlertType,
    RiskLevel,
    RiskScore,
    TelemetryPayload,
    Worker,
    WorkerCreate,
    WorkerStatus,
    WorkerWithRisk,
    WSEvent,
)
from app.services.risk_engine import risk_engine


class TelemetryService:
    """Stateless facade over the in-memory store."""

    # ---------------------------------------------------------------- workers
    async def register_worker(self, data: WorkerCreate) -> Worker:
        worker = Worker(**data.model_dump())
        await store.set(f"worker:{worker.id}", worker.model_dump_json())
        return worker

    async def get_worker(self, worker_id: UUID) -> Optional[Worker]:
        raw = await store.get(f"worker:{worker_id}")
        if raw is None:
            return None
        return Worker.model_validate_json(raw)

    async def list_workers(self) -> List[WorkerWithRisk]:
        keys = await store.keys("worker:*")
        workers: List[WorkerWithRisk] = []
        for key in keys:
            raw = await store.get(key)
            if raw is None:
                continue
            worker = Worker.model_validate_json(raw)
            risk_raw = await store.get(f"risk:{worker.id}:latest")
            risk: Optional[RiskScore] = (
                RiskScore.model_validate_json(risk_raw) if risk_raw else None
            )
            workers.append(
                WorkerWithRisk(
                    **worker.model_dump(),
                    risk_score=risk.score if risk else 0.0,
                    risk_level=risk.level if risk else RiskLevel.LOW,
                    last_seen=risk.timestamp if risk else None,
                )
            )
        return workers

    async def update_worker_status(
        self, worker_id: UUID, status: WorkerStatus
    ) -> Optional[Worker]:
        worker = await self.get_worker(worker_id)
        if worker is None:
            return None
        worker.status = status
        await store.set(f"worker:{worker_id}", worker.model_dump_json())
        return worker

    # ---------------------------------------------------------------- telemetry
    async def ingest(self, payload: TelemetryPayload) -> RiskScore:
        """Process a telemetry payload and return the computed risk score."""

        # Persist raw telemetry (capped ring buffer, ~1 h at 1 Hz)
        await store.lpush(
            f"telemetry:{payload.worker_id}",
            payload.model_dump_json(),
            maxlen=3600,
        )

        # Compute risk
        risk = risk_engine.compute(payload)

        # Persist latest risk
        await store.set(f"risk:{payload.worker_id}:latest", risk.model_dump_json())

        # Persist risk history
        await store.lpush(
            f"risk_history:{payload.worker_id}",
            risk.model_dump_json(),
            maxlen=3600,
        )

        # Generate alerts if thresholds crossed
        await self._maybe_alert(risk)

        # Broadcast real-time event
        event = WSEvent(
            event="risk_update",
            data=json.loads(risk.model_dump_json()),
        )
        await store.broadcast(event.model_dump_json())

        return risk

    async def get_risk_history(
        self, worker_id: UUID, limit: int = 60
    ) -> List[RiskScore]:
        raw_list = await store.lrange(
            f"risk_history:{worker_id}", 0, limit - 1
        )
        return [RiskScore.model_validate_json(r) for r in raw_list]

    # ---------------------------------------------------------------- alerts
    async def _maybe_alert(self, risk: RiskScore) -> None:
        if risk.level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
            for factor in risk.contributing_factors:
                alert_type = self._infer_alert_type(factor)
                alert = Alert(
                    worker_id=risk.worker_id,
                    alert_type=alert_type,
                    risk_level=risk.level,
                    message=factor,
                )
                await store.lpush(
                    f"alerts:{risk.worker_id}",
                    alert.model_dump_json(),
                    maxlen=200,
                )
                # also push to global alerts feed
                await store.lpush(
                    "alerts:global",
                    alert.model_dump_json(),
                    maxlen=500,
                )
                event = WSEvent(
                    event="alert",
                    data=json.loads(alert.model_dump_json()),
                )
                await store.broadcast(event.model_dump_json())

    @staticmethod
    def _infer_alert_type(factor: str) -> AlertType:
        fl = factor.lower()
        if "heart rate" in fl:
            return AlertType.HEART_RATE
        if "conductance" in fl or "stress" in fl:
            return AlertType.SKIN_CONDUCTANCE
        if "perclos" in fl:
            return AlertType.PERCLOS
        if "yawn" in fl:
            return AlertType.YAWNING
        if "movement" in fl or "incapacit" in fl:
            return AlertType.INACTIVITY
        return AlertType.FATIGUE

    async def list_alerts(
        self, worker_id: Optional[UUID] = None, limit: int = 50
    ) -> List[Alert]:
        key = f"alerts:{worker_id}" if worker_id else "alerts:global"
        raw_list = await store.lrange(key, 0, limit - 1)
        return [Alert.model_validate_json(r) for r in raw_list]

    async def acknowledge_alert(
        self, alert_id: UUID, acknowledged_by: str
    ) -> Optional[Alert]:
        """Scan global alerts ring buffer to find and acknowledge an alert."""
        raw_list = await store.lrange("alerts:global", 0, -1)
        for raw in raw_list:
            alert = Alert.model_validate_json(raw)
            if alert.id == alert_id:
                alert.acknowledged = True
                alert.acknowledged_by = acknowledged_by
                # update in place (best-effort for ring buffer)
                await store.set(f"alert:{alert_id}", alert.model_dump_json())
                return alert
        return None


telemetry_service = TelemetryService()
