"""Pydantic schemas for workers, telemetry, alerts and risk scores."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


# ──────────────────────────────────────────────── enums
class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertType(str, Enum):
    FATIGUE = "FATIGUE"
    HEART_RATE = "HEART_RATE"
    SKIN_CONDUCTANCE = "SKIN_CONDUCTANCE"
    PERCLOS = "PERCLOS"
    YAWNING = "YAWNING"
    INACTIVITY = "INACTIVITY"


class WorkerStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ON_BREAK = "ON_BREAK"
    OFFLINE = "OFFLINE"


# ──────────────────────────────────────────────── worker
class WorkerBase(BaseModel):
    name: str
    employee_id: str
    role: str
    zone: str


class WorkerCreate(WorkerBase):
    pass


class Worker(WorkerBase):
    id: UUID = Field(default_factory=uuid4)
    status: WorkerStatus = WorkerStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"from_attributes": True}


class WorkerWithRisk(Worker):
    risk_score: float = 0.0
    risk_level: RiskLevel = RiskLevel.LOW
    last_seen: Optional[datetime] = None


# ──────────────────────────────────────────────── telemetry
class BiometricReading(BaseModel):
    heart_rate: Optional[float] = Field(None, ge=0, le=300, description="BPM")
    skin_conductance: Optional[float] = Field(None, ge=0, description="µS")
    blood_oxygen: Optional[float] = Field(None, ge=0, le=100, description="%")
    temperature: Optional[float] = Field(None, description="°C")
    accelerometer_x: Optional[float] = None
    accelerometer_y: Optional[float] = None
    accelerometer_z: Optional[float] = None


class CVReading(BaseModel):
    ear: Optional[float] = Field(None, ge=0, le=1, description="Eye Aspect Ratio")
    mar: Optional[float] = Field(None, ge=0, description="Mouth Aspect Ratio")
    head_pose_pitch: Optional[float] = None
    head_pose_yaw: Optional[float] = None
    perclos: Optional[float] = Field(None, ge=0, le=1, description="PERCLOS 0-1")
    blink_rate: Optional[float] = Field(None, ge=0, description="blinks/min")


class TelemetryPayload(BaseModel):
    worker_id: UUID
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    biometrics: Optional[BiometricReading] = None
    cv: Optional[CVReading] = None
    environment_temp: Optional[float] = None
    ambient_noise_db: Optional[float] = None


# ──────────────────────────────────────────────── risk
class RiskScore(BaseModel):
    worker_id: UUID
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    score: float = Field(ge=0, le=100)
    level: RiskLevel
    fatigue_component: float = Field(ge=0, le=100)
    biometric_component: float = Field(ge=0, le=100)
    environmental_component: float = Field(ge=0, le=100)
    contributing_factors: List[str] = Field(default_factory=list)


# ──────────────────────────────────────────────── alerts
class Alert(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    worker_id: UUID
    alert_type: AlertType
    risk_level: RiskLevel
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None


class AlertAcknowledge(BaseModel):
    acknowledged_by: str


# ──────────────────────────────────────────────── websocket events
class WSEvent(BaseModel):
    event: str
    data: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)
