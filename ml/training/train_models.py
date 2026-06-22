"""Training script for Sentinel AI fatigue classifier and biometric regressor.

Usage:
    python -m ml.training.train_models [--epochs 30] [--output ml/models/saved]

Requires TensorFlow.  Falls back gracefully when TF is not installed by
printing a message and exiting – the runtime uses the rule-based classifier.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np

DATA_DIR = Path(__file__).parent.parent / "data"
DEFAULT_OUTPUT = Path(__file__).parent.parent / "models" / "saved"


def _require_tf():
    try:
        import tensorflow as tf
        return tf
    except ImportError:
        print(
            "TensorFlow is not installed. "
            "Install it with:  pip install tensorflow\n"
            "The backend will use the built-in rule-based classifier at runtime."
        )
        sys.exit(0)


def train_fatigue_classifier(epochs: int, output: Path) -> None:
    tf = _require_tf()
    from ml.models.sentinel_models import build_fatigue_classifier

    X = np.load(DATA_DIR / "cv_features.npy")
    y = np.load(DATA_DIR / "cv_labels.npy")

    split = int(0.8 * len(X))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    model = build_fatigue_classifier()
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=64,
        verbose=1,
    )

    save_path = output / "fatigue_classifier"
    save_path.mkdir(parents=True, exist_ok=True)
    model.save(str(save_path))
    print(f"Fatigue classifier saved → {save_path}")


def train_biometric_regressor(epochs: int, output: Path) -> None:
    _require_tf()
    from ml.models.sentinel_models import build_biometric_risk_regressor

    X = np.load(DATA_DIR / "bio_features.npy")
    y = np.load(DATA_DIR / "bio_labels.npy")

    split = int(0.8 * len(X))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    model = build_biometric_risk_regressor()
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=64,
        verbose=1,
    )

    save_path = output / "biometric_regressor"
    save_path.mkdir(parents=True, exist_ok=True)
    model.save(str(save_path))
    print(f"Biometric regressor saved → {save_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Sentinel AI models")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if not (DATA_DIR / "cv_features.npy").exists():
        print("Training data not found. Generate it first:")
        print("  python -m ml.training.generate_data")
        sys.exit(1)

    print("Training fatigue classifier …")
    train_fatigue_classifier(args.epochs, args.output)

    print("\nTraining biometric regressor …")
    train_biometric_regressor(args.epochs, args.output)

    print("\nAll models trained successfully.")
