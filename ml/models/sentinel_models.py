"""TensorFlow model definitions for Sentinel AI.

Models:
  1. FatigueClassifier – binary/multiclass classifier on EAR/MAR/PERCLOS features
  2. BiometricRiskRegressor – regression model on physiological signals → risk score
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional, Tuple

import numpy as np

# TensorFlow import is optional – fall back gracefully for environments without GPU
try:
    import tensorflow as tf
    from tensorflow import keras

    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


MODELS_DIR = Path(__file__).parent / "saved"
MODELS_DIR.mkdir(exist_ok=True)


# ─────────────────────────────────────────── feature engineering
def build_cv_feature_vector(
    ear: float,
    mar: float,
    perclos: float,
    blink_rate: float,
    head_pitch: float,
    head_yaw: float,
) -> np.ndarray:
    """Normalise raw CV measurements into a model-ready feature vector."""
    return np.array(
        [
            ear / 0.5,                  # normalise to ~[0, 1]
            mar / 1.5,
            perclos,                    # already [0, 1]
            blink_rate / 30.0,          # typical max ~30 blinks/min
            (head_pitch + 90) / 180.0,  # normalise angle to [0, 1]
            (head_yaw + 90) / 180.0,
        ],
        dtype=np.float32,
    )


def build_biometric_feature_vector(
    heart_rate: float,
    skin_conductance: float,
    blood_oxygen: float,
    temperature: float,
) -> np.ndarray:
    """Normalise physiological readings into a model-ready feature vector."""
    return np.array(
        [
            heart_rate / 200.0,
            skin_conductance / 50.0,
            blood_oxygen / 100.0,
            (temperature - 35) / 7.0,  # normalise around 35-42 °C range
        ],
        dtype=np.float32,
    )


# ─────────────────────────────────────────── model builders
def build_fatigue_classifier(input_dim: int = 6, num_classes: int = 4) -> "keras.Model":
    """Build a lightweight MLP fatigue classifier.

    Output classes: 0=No Fatigue, 1=Mild, 2=Moderate, 3=Severe
    """
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow is not installed")

    inputs = keras.Input(shape=(input_dim,), name="cv_features")
    x = keras.layers.Dense(64, activation="relu")(inputs)
    x = keras.layers.Dropout(0.2)(x)
    x = keras.layers.Dense(32, activation="relu")(x)
    x = keras.layers.Dropout(0.2)(x)
    outputs = keras.layers.Dense(num_classes, activation="softmax", name="fatigue_class")(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name="FatigueClassifier")
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def build_biometric_risk_regressor(input_dim: int = 4) -> "keras.Model":
    """Build a lightweight MLP regressor mapping biometrics → risk score (0-100)."""
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow is not installed")

    inputs = keras.Input(shape=(input_dim,), name="bio_features")
    x = keras.layers.Dense(32, activation="relu")(inputs)
    x = keras.layers.Dense(16, activation="relu")(x)
    output = keras.layers.Dense(1, activation="sigmoid", name="risk_score")(x)
    # scale output to 0-100
    scaled = keras.layers.Lambda(lambda t: t * 100, name="risk_0_100")(output)

    model = keras.Model(inputs=inputs, outputs=scaled, name="BiometricRiskRegressor")
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model


def build_fusion_model(cv_dim: int = 6, bio_dim: int = 4) -> "keras.Model":
    """Late-fusion model combining CV and biometric branches.

    Returns a single risk score in [0, 100].
    """
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow is not installed")

    # CV branch
    cv_input = keras.Input(shape=(cv_dim,), name="cv_input")
    cv_x = keras.layers.Dense(64, activation="relu")(cv_input)
    cv_x = keras.layers.Dense(32, activation="relu")(cv_x)

    # Biometric branch
    bio_input = keras.Input(shape=(bio_dim,), name="bio_input")
    bio_x = keras.layers.Dense(32, activation="relu")(bio_input)
    bio_x = keras.layers.Dense(16, activation="relu")(bio_x)

    # Fusion
    merged = keras.layers.Concatenate()([cv_x, bio_x])
    z = keras.layers.Dense(32, activation="relu")(merged)
    z = keras.layers.Dropout(0.2)(z)
    raw_score = keras.layers.Dense(1, activation="sigmoid")(z)
    risk_score = keras.layers.Lambda(lambda t: t * 100, name="risk_score")(raw_score)

    model = keras.Model(
        inputs=[cv_input, bio_input],
        outputs=risk_score,
        name="SentinelFusionModel",
    )
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model


# ─────────────────────────────────────────── rule-based fallback (no TF required)
class RuleBasedFatigueClassifier:
    """Deterministic fallback when TensorFlow is unavailable.

    Returns a fatigue class (0-3) based on hard thresholds.
    """

    EAR_THRESHOLD = 0.25
    PERCLOS_THRESHOLD = 0.15
    MAR_THRESHOLD = 0.60

    def predict(
        self,
        ear: float,
        mar: float,
        perclos: float,
        **kwargs,
    ) -> Tuple[int, str]:
        score = 0
        if perclos >= 0.30:
            score += 2
        elif perclos >= self.PERCLOS_THRESHOLD:
            score += 1
        if ear < self.EAR_THRESHOLD:
            score += 1
        if mar > self.MAR_THRESHOLD:
            score += 1

        clipped = min(score, 3)
        labels = ["No Fatigue", "Mild Fatigue", "Moderate Fatigue", "Severe Fatigue"]
        return clipped, labels[clipped]


class SentinelModelInference:
    """Unified inference interface.

    Uses the TF fusion model when available; falls back to the rule-based
    classifier otherwise.
    """

    def __init__(self, model_path: Optional[Path] = None) -> None:
        self._model = None
        self._fallback = RuleBasedFatigueClassifier()

        if TF_AVAILABLE and model_path and model_path.exists():
            try:
                self._model = tf.saved_model.load(str(model_path))
            except Exception:
                self._model = None

    def predict_risk(
        self,
        cv_features: Optional[np.ndarray] = None,
        bio_features: Optional[np.ndarray] = None,
    ) -> float:
        """Return a risk score in [0, 100]."""
        if self._model is not None and cv_features is not None and bio_features is not None:
            cv_t = tf.convert_to_tensor(cv_features[None, :], dtype=tf.float32)
            bio_t = tf.convert_to_tensor(bio_features[None, :], dtype=tf.float32)
            score = self._model([cv_t, bio_t], training=False)
            return float(score.numpy().squeeze())

        # Rule-based fallback
        if cv_features is not None and len(cv_features) >= 3:
            ear, mar, perclos = cv_features[0], cv_features[1], cv_features[2]
            clss, _ = self._fallback.predict(ear=ear, mar=mar, perclos=perclos)
            return float(clss / 3 * 100)

        return 0.0


# Singleton
inference = SentinelModelInference()
