"""Tests for the composite risk scoring engine."""

import pytest
from uuid import uuid4
from datetime import datetime

from app.models import (
    BiometricReading,
    CVReading,
    RiskLevel,
    TelemetryPayload,
)
from app.services.risk_engine import (
    BiometricScorer,
    CompositeRiskEngine,
    FatigueScorer,
    EnvironmentalScorer,
    _risk_level,
)


# ──────────────────────────────────────────── helpers
def make_payload(**kwargs) -> TelemetryPayload:
    return TelemetryPayload(worker_id=uuid4(), timestamp=datetime.utcnow(), **kwargs)


# ──────────────────────────────────────────── FatigueScorer
class TestFatigueScorer:
    def setup_method(self):
        self.scorer = FatigueScorer()

    def test_no_cv_data_returns_zero(self):
        score, factors = self.scorer.score(None)
        assert score == 0.0
        assert factors == []

    def test_normal_ear_no_score(self):
        cv = CVReading(ear=0.30)  # above EAR_THRESHOLD of 0.25
        score, factors = self.scorer.score(cv)
        assert score == 0.0

    def test_low_ear_raises_score(self):
        cv = CVReading(ear=0.10)  # well below threshold
        score, factors = self.scorer.score(cv)
        assert score > 0
        assert any("eye aspect ratio" in f.lower() for f in factors)

    def test_high_mar_yawning(self):
        cv = CVReading(mar=0.9)  # above MAR_THRESHOLD of 0.6
        score, factors = self.scorer.score(cv)
        assert score > 0
        assert any("yawn" in f.lower() for f in factors)

    def test_high_perclos_raises_score(self):
        cv = CVReading(perclos=0.20)  # 20 % – above 15 % alert threshold
        score, factors = self.scorer.score(cv)
        assert score > 0
        assert any("perclos" in f.lower() for f in factors)

    def test_head_nodding_raises_score(self):
        cv = CVReading(head_pose_pitch=35.0)  # > 20-degree threshold
        score, factors = self.scorer.score(cv)
        assert score > 0
        assert any("nod" in f.lower() or "droop" in f.lower() for f in factors)

    def test_score_clamped_0_to_100(self):
        cv = CVReading(ear=0.0, mar=2.0, perclos=1.0, head_pose_pitch=90.0, blink_rate=0.0)
        score, _ = self.scorer.score(cv)
        assert 0.0 <= score <= 100.0


# ──────────────────────────────────────────── BiometricScorer
class TestBiometricScorer:
    def setup_method(self):
        self.scorer = BiometricScorer()

    def test_no_biometrics_returns_zero(self):
        score, factors = self.scorer.score(None)
        assert score == 0.0

    def test_normal_hr_no_score(self):
        bio = BiometricReading(heart_rate=75)
        score, _ = self.scorer.score(bio)
        assert score == 0.0

    def test_high_hr_raises_score(self):
        bio = BiometricReading(heart_rate=145)
        score, factors = self.scorer.score(bio)
        assert score > 0
        assert any("heart rate" in f.lower() for f in factors)

    def test_low_hr_raises_score(self):
        bio = BiometricReading(heart_rate=35)
        score, factors = self.scorer.score(bio)
        assert score > 0

    def test_low_spo2_raises_score(self):
        bio = BiometricReading(blood_oxygen=90.0)
        score, factors = self.scorer.score(bio)
        assert score > 0
        assert any("spo" in f.lower() for f in factors)

    def test_high_skin_conductance_raises_score(self):
        bio = BiometricReading(skin_conductance=35.0)
        score, factors = self.scorer.score(bio)
        assert score > 0
        assert any("conductance" in f.lower() for f in factors)

    def test_score_clamped_0_to_100(self):
        bio = BiometricReading(
            heart_rate=220, blood_oxygen=50, skin_conductance=100, temperature=42.0
        )
        score, _ = self.scorer.score(bio)
        assert 0.0 <= score <= 100.0


# ──────────────────────────────────────────── EnvironmentalScorer
class TestEnvironmentalScorer:
    def setup_method(self):
        self.scorer = EnvironmentalScorer()

    def test_normal_conditions_return_zero(self):
        score, factors = self.scorer.score(25.0, 70.0)
        assert score == 0.0
        assert factors == []

    def test_high_temperature_raises_score(self):
        score, factors = self.scorer.score(40.0, None)
        assert score > 0

    def test_high_noise_raises_score(self):
        score, factors = self.scorer.score(None, 95.0)
        assert score > 0


# ──────────────────────────────────────────── CompositeRiskEngine
class TestCompositeRiskEngine:
    def setup_method(self):
        self.engine = CompositeRiskEngine()

    def test_empty_payload_low_risk(self):
        payload = make_payload()
        result = self.engine.compute(payload)
        assert result.score == 0.0
        assert result.level == RiskLevel.LOW

    def test_fatigue_signals_produce_medium_or_higher(self):
        payload = make_payload(
            cv=CVReading(ear=0.12, mar=0.8, perclos=0.20),
        )
        result = self.engine.compute(payload)
        assert result.score > 0
        assert result.level != RiskLevel.LOW

    def test_combined_signals_produce_high_risk(self):
        payload = make_payload(
            cv=CVReading(ear=0.08, mar=0.95, perclos=0.35, head_pose_pitch=40.0),
            biometrics=BiometricReading(heart_rate=170, skin_conductance=45.0),
            environment_temp=38.0,
        )
        result = self.engine.compute(payload)
        assert result.score >= 60.0

    def test_contributing_factors_populated(self):
        payload = make_payload(
            cv=CVReading(ear=0.10, perclos=0.25),
        )
        result = self.engine.compute(payload)
        assert len(result.contributing_factors) > 0

    def test_worker_id_preserved(self):
        wid = uuid4()
        payload = TelemetryPayload(worker_id=wid, timestamp=datetime.utcnow())
        result = self.engine.compute(payload)
        assert result.worker_id == wid


# ──────────────────────────────────────────── _risk_level
def test_risk_level_mapping():
    assert _risk_level(0) == RiskLevel.LOW
    assert _risk_level(29) == RiskLevel.LOW
    assert _risk_level(50) == RiskLevel.MEDIUM
    assert _risk_level(80) == RiskLevel.HIGH
    assert _risk_level(92) == RiskLevel.CRITICAL
