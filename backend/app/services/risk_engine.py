"""Risk scoring engine.

Fuses computer-vision signals (EAR, MAR, PERCLOS, blink rate, head pose),
biometric IoT readings (heart rate, skin conductance, SpO2, temperature),
and environmental context into a single 0-100 risk score per worker.

Architecture
------------
CompositeRiskEngine
  ├── FatigueScorer      – CV-based fatigue signals
  ├── BiometricScorer    – wearable/IoT physiological signals
  └── EnvironmentalScorer – ambient conditions

Each sub-scorer returns a 0-100 sub-score. The composite is a weighted sum.
"""

from __future__ import annotations

import math
from typing import List, Optional

from app.core.config import settings
from app.models import (
    BiometricReading,
    CVReading,
    RiskLevel,
    RiskScore,
    TelemetryPayload,
)
from uuid import UUID
from datetime import datetime


# ─────────────────────────────────────────── helpers
def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _risk_level(score: float) -> RiskLevel:
    if score >= 90:
        return RiskLevel.CRITICAL
    if score >= settings.RISK_HIGH_THRESHOLD:
        return RiskLevel.HIGH
    if score >= settings.RISK_LOW_THRESHOLD:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


# ─────────────────────────────────────────── sub-scorers
class FatigueScorer:
    """Scores fatigue from computer-vision readings (0-100)."""

    # weights within this scorer
    _W_EAR = 0.35
    _W_PERCLOS = 0.35
    _W_MAR = 0.15
    _W_BLINK = 0.10
    _W_HEAD = 0.05

    def score(self, cv: Optional[CVReading]) -> tuple[float, List[str]]:
        if cv is None:
            return 0.0, []

        factors: List[str] = []
        components: List[float] = []

        # EAR – Eye Aspect Ratio (lower = more closed)
        if cv.ear is not None:
            if cv.ear < settings.EAR_THRESHOLD:
                ear_score = _clamp(
                    100 * (1 - cv.ear / settings.EAR_THRESHOLD)
                )
                components.append(self._W_EAR * ear_score)
                if ear_score > 50:
                    factors.append("Low eye aspect ratio (drowsiness)")
            else:
                components.append(0.0)

        # PERCLOS
        if cv.perclos is not None:
            perclos_score = _clamp(cv.perclos * 100 / settings.PERCLOS_ALERT_THRESHOLD * 50)
            components.append(self._W_PERCLOS * perclos_score)
            if cv.perclos >= settings.PERCLOS_ALERT_THRESHOLD:
                factors.append(
                    f"High PERCLOS ({cv.perclos:.1%}) – prolonged eye closure"
                )

        # MAR – Mouth Aspect Ratio (higher = yawning)
        if cv.mar is not None:
            if cv.mar > settings.MAR_THRESHOLD:
                mar_score = _clamp(
                    100 * (cv.mar - settings.MAR_THRESHOLD) / (1.5 - settings.MAR_THRESHOLD)
                )
                components.append(self._W_MAR * mar_score)
                factors.append("Yawning detected")
            else:
                components.append(0.0)

        # Blink rate – both very low and very high are concerning
        if cv.blink_rate is not None:
            normal_low, normal_high = 10.0, 20.0
            if cv.blink_rate < normal_low:
                blink_score = _clamp(
                    100 * (normal_low - cv.blink_rate) / normal_low
                )
                components.append(self._W_BLINK * blink_score)
                factors.append("Abnormally low blink rate")
            elif cv.blink_rate > normal_high * 2:
                blink_score = _clamp(
                    100 * (cv.blink_rate - normal_high * 2) / normal_high
                )
                components.append(self._W_BLINK * blink_score)
                factors.append("Abnormally high blink rate")
            else:
                components.append(0.0)

        # Head pose – nodding (high pitch) is a strong fatigue sign
        if cv.head_pose_pitch is not None:
            if abs(cv.head_pose_pitch) > 20:
                head_score = _clamp(abs(cv.head_pose_pitch) - 20)
                components.append(self._W_HEAD * head_score)
                factors.append("Head nodding / drooping detected")
            else:
                components.append(0.0)

        raw = sum(components)
        return _clamp(raw), factors


class BiometricScorer:
    """Scores risk from wearable / IoT physiological readings (0-100)."""

    def score(self, bio: Optional[BiometricReading]) -> tuple[float, List[str]]:
        if bio is None:
            return 0.0, []

        factors: List[str] = []
        sub_scores: List[float] = []

        # Heart rate
        if bio.heart_rate is not None:
            hr = bio.heart_rate
            if hr < settings.HEART_RATE_LOW:
                s = _clamp(100 * (settings.HEART_RATE_LOW - hr) / settings.HEART_RATE_LOW)
                sub_scores.append(s)
                factors.append(f"Low heart rate ({hr:.0f} bpm)")
            elif hr > settings.HEART_RATE_HIGH:
                s = _clamp(100 * (hr - settings.HEART_RATE_HIGH) / settings.HEART_RATE_HIGH)
                sub_scores.append(s)
                factors.append(f"Elevated heart rate ({hr:.0f} bpm)")
            else:
                sub_scores.append(0.0)

        # Skin conductance (stress indicator)
        if bio.skin_conductance is not None:
            sc = bio.skin_conductance
            if sc > settings.SKIN_CONDUCTANCE_HIGH:
                s = _clamp(100 * (sc - settings.SKIN_CONDUCTANCE_HIGH) / settings.SKIN_CONDUCTANCE_HIGH)
                sub_scores.append(s)
                factors.append(f"High skin conductance ({sc:.1f} µS – elevated stress)")
            else:
                sub_scores.append(0.0)

        # Blood oxygen (SpO2)
        if bio.blood_oxygen is not None:
            spo2 = bio.blood_oxygen
            if spo2 < 95:
                s = _clamp(100 * (95 - spo2) / 10)
                sub_scores.append(s)
                factors.append(f"Low SpO₂ ({spo2:.1f}%)")
            else:
                sub_scores.append(0.0)

        # Core temperature
        if bio.temperature is not None:
            temp = bio.temperature
            if temp > 38.5:
                s = _clamp(100 * (temp - 38.5) / 2)
                sub_scores.append(s)
                factors.append(f"Elevated body temperature ({temp:.1f}°C)")
            elif temp < 35.5:
                s = _clamp(100 * (35.5 - temp) / 2)
                sub_scores.append(s)
                factors.append(f"Low body temperature ({temp:.1f}°C)")
            else:
                sub_scores.append(0.0)

        # Accelerometer – detect lack of movement (slumped / incapacitated)
        if all(
            v is not None
            for v in [bio.accelerometer_x, bio.accelerometer_y, bio.accelerometer_z]
        ):
            magnitude = math.sqrt(
                bio.accelerometer_x**2
                + bio.accelerometer_y**2
                + bio.accelerometer_z**2
            )
            # Near-zero movement for an active-duty worker is suspicious
            if magnitude < 0.2:
                sub_scores.append(60.0)
                factors.append("Near-zero movement detected (possible incapacitation)")
            else:
                sub_scores.append(0.0)

        if not sub_scores:
            return 0.0, []

        return _clamp(sum(sub_scores) / len(sub_scores)), factors


class EnvironmentalScorer:
    """Scores risk from ambient environmental conditions (0-100)."""

    _TEMP_HIGH = 35.0   # °C – hot environment amplifies heat stress
    _NOISE_HIGH = 85.0  # dB – excessive noise causes cognitive fatigue

    def score(
        self, env_temp: Optional[float], noise_db: Optional[float]
    ) -> tuple[float, List[str]]:
        factors: List[str] = []
        sub_scores: List[float] = []

        if env_temp is not None:
            if env_temp > self._TEMP_HIGH:
                s = _clamp(100 * (env_temp - self._TEMP_HIGH) / 10)
                sub_scores.append(s)
                factors.append(f"High ambient temperature ({env_temp:.1f}°C)")

        if noise_db is not None:
            if noise_db > self._NOISE_HIGH:
                s = _clamp(100 * (noise_db - self._NOISE_HIGH) / 30)
                sub_scores.append(s)
                factors.append(f"High ambient noise ({noise_db:.0f} dB)")

        if not sub_scores:
            return 0.0, []
        return _clamp(sum(sub_scores) / len(sub_scores)), factors


# ─────────────────────────────────────────── composite engine
class CompositeRiskEngine:
    """Fuses all sub-scores into a single worker risk score.

    Weights:
      fatigue      55 %
      biometric    35 %
      environment  10 %
    """

    _W_FATIGUE = 0.55
    _W_BIOMETRIC = 0.35
    _W_ENVIRONMENT = 0.10

    def __init__(self) -> None:
        self._fatigue = FatigueScorer()
        self._biometric = BiometricScorer()
        self._environmental = EnvironmentalScorer()

    def compute(self, payload: TelemetryPayload) -> RiskScore:
        fatigue_score, fatigue_factors = self._fatigue.score(payload.cv)
        biometric_score, biometric_factors = self._biometric.score(payload.biometrics)
        env_score, env_factors = self._environmental.score(
            payload.environment_temp, payload.ambient_noise_db
        )

        composite = _clamp(
            self._W_FATIGUE * fatigue_score
            + self._W_BIOMETRIC * biometric_score
            + self._W_ENVIRONMENT * env_score
        )

        all_factors = fatigue_factors + biometric_factors + env_factors

        return RiskScore(
            worker_id=payload.worker_id,
            timestamp=payload.timestamp,
            score=round(composite, 2),
            level=_risk_level(composite),
            fatigue_component=round(fatigue_score, 2),
            biometric_component=round(biometric_score, 2),
            environmental_component=round(env_score, 2),
            contributing_factors=all_factors,
        )


# ─────────────────────────────────────────── singleton
risk_engine = CompositeRiskEngine()
