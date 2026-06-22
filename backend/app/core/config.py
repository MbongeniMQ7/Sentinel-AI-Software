from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "Sentinel AI Workforce Safety Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://sentinel-ai.workers.dev",
    ]

    # Risk scoring thresholds
    RISK_LOW_THRESHOLD: float = 30.0
    RISK_MEDIUM_THRESHOLD: float = 60.0
    RISK_HIGH_THRESHOLD: float = 80.0

    # Fatigue detection
    EAR_THRESHOLD: float = 0.25          # Eye Aspect Ratio below this => eyes closed
    MAR_THRESHOLD: float = 0.6           # Mouth Aspect Ratio above this => yawning
    PERCLOS_WINDOW_SECONDS: int = 60     # Window for PERCLOS calculation
    PERCLOS_ALERT_THRESHOLD: float = 0.15  # 15 % of time eyes closed => alert

    # IoT telemetry
    HEART_RATE_LOW: int = 45
    HEART_RATE_HIGH: int = 120
    SKIN_CONDUCTANCE_HIGH: float = 20.0  # µS

    # Redis (optional – falls back to in-memory if not available)
    REDIS_URL: str = "redis://localhost:6379"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
