"""Synthetic training data generator for Sentinel AI models.

Generates labelled datasets for:
  1. FatigueClassifier  – CV features → fatigue class (0-3)
  2. BiometricRiskRegressor – physiological features → risk score

Run:  python -m ml.training.generate_data
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Tuple

import numpy as np

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

RNG = np.random.default_rng(42)


# ─────────────────────────────────────────── CV / fatigue dataset
def _sample_cv_features(label: int, n: int) -> np.ndarray:
    """Generate synthetic CV features for a given fatigue class."""
    if label == 0:  # No fatigue
        ear = RNG.normal(0.32, 0.03, n).clip(0.25, 0.45)
        mar = RNG.normal(0.25, 0.05, n).clip(0.0, 0.5)
        perclos = RNG.uniform(0.0, 0.08, n)
        blink = RNG.normal(15, 3, n).clip(8, 25)
        pitch = RNG.normal(0, 5, n)
        yaw = RNG.normal(0, 5, n)
    elif label == 1:  # Mild
        ear = RNG.normal(0.27, 0.03, n).clip(0.20, 0.35)
        mar = RNG.normal(0.35, 0.08, n).clip(0.0, 0.7)
        perclos = RNG.uniform(0.05, 0.12, n)
        blink = RNG.normal(12, 3, n).clip(5, 20)
        pitch = RNG.normal(5, 8, n)
        yaw = RNG.normal(0, 8, n)
    elif label == 2:  # Moderate
        ear = RNG.normal(0.22, 0.03, n).clip(0.15, 0.30)
        mar = RNG.normal(0.55, 0.10, n).clip(0.3, 0.9)
        perclos = RNG.uniform(0.12, 0.25, n)
        blink = RNG.normal(8, 3, n).clip(2, 15)
        pitch = RNG.normal(15, 10, n)
        yaw = RNG.normal(0, 10, n)
    else:  # Severe (label == 3)
        ear = RNG.normal(0.14, 0.04, n).clip(0.05, 0.22)
        mar = RNG.normal(0.80, 0.12, n).clip(0.5, 1.2)
        perclos = RNG.uniform(0.25, 0.60, n)
        blink = RNG.normal(4, 2, n).clip(0, 10)
        pitch = RNG.normal(30, 12, n)
        yaw = RNG.normal(0, 15, n)

    return np.column_stack([ear, mar, perclos, blink, pitch, yaw]).astype(np.float32)


def generate_fatigue_dataset(
    n_per_class: int = 2000,
) -> Tuple[np.ndarray, np.ndarray]:
    X_list, y_list = [], []
    for label in range(4):
        X_list.append(_sample_cv_features(label, n_per_class))
        y_list.append(np.full(n_per_class, label, dtype=np.int32))
    X = np.vstack(X_list)
    y = np.concatenate(y_list)
    shuffle = RNG.permutation(len(X))
    return X[shuffle], y[shuffle]


# ─────────────────────────────────────────── biometric dataset
def generate_biometric_dataset(n: int = 8000) -> Tuple[np.ndarray, np.ndarray]:
    """Generate synthetic biometric features with a continuous risk score label."""
    hr = RNG.normal(80, 20, n).clip(40, 200)
    sc = RNG.exponential(8, n).clip(0, 50)
    spo2 = RNG.normal(97, 2, n).clip(85, 100)
    temp = RNG.normal(37.0, 0.8, n).clip(34, 42)

    # Risk score heuristic (ground truth label)
    risk = np.zeros(n)
    risk += np.where(hr > 120, (hr - 120) / 80 * 50, 0)
    risk += np.where(hr < 50, (50 - hr) / 50 * 40, 0)
    risk += (sc / 50) * 30
    risk += np.where(spo2 < 95, (95 - spo2) / 10 * 50, 0)
    risk += np.where(temp > 38.5, (temp - 38.5) / 3 * 40, 0)
    risk = risk.clip(0, 100).astype(np.float32)

    X = np.column_stack(
        [hr / 200.0, sc / 50.0, spo2 / 100.0, (temp - 35) / 7.0]
    ).astype(np.float32)
    return X, risk


# ─────────────────────────────────────────── main
if __name__ == "__main__":
    print("Generating fatigue dataset …")
    X_cv, y_cv = generate_fatigue_dataset()
    np.save(DATA_DIR / "cv_features.npy", X_cv)
    np.save(DATA_DIR / "cv_labels.npy", y_cv)
    print(f"  Saved {len(X_cv)} samples → {DATA_DIR / 'cv_features.npy'}")

    print("Generating biometric dataset …")
    X_bio, y_bio = generate_biometric_dataset()
    np.save(DATA_DIR / "bio_features.npy", X_bio)
    np.save(DATA_DIR / "bio_labels.npy", y_bio)
    print(f"  Saved {len(X_bio)} samples → {DATA_DIR / 'bio_features.npy'}")

    stats = {
        "cv_samples": int(len(X_cv)),
        "bio_samples": int(len(X_bio)),
        "cv_classes": 4,
        "bio_risk_mean": float(y_bio.mean()),
        "bio_risk_std": float(y_bio.std()),
    }
    with open(DATA_DIR / "dataset_stats.json", "w") as f:
        json.dump(stats, f, indent=2)
    print("Done. Stats:", json.dumps(stats, indent=2))
