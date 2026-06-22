"""FastAPI application entry point.

Starts the Sentinel AI Workforce Safety Platform backend.
"""

from __future__ import annotations

import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import alerts, risk, telemetry, workers
from app.core.config import settings
from app.core.store import store

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered fatigue and biometric risk monitoring system. "
        "Fuses computer vision, IoT telemetry, and physiological signals "
        "to score every worker's risk in real time at industrial scale."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────── CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────── REST routers
app.include_router(workers.router, prefix=settings.API_V1_PREFIX)
app.include_router(telemetry.router, prefix=settings.API_V1_PREFIX)
app.include_router(alerts.router, prefix=settings.API_V1_PREFIX)
app.include_router(risk.router, prefix=settings.API_V1_PREFIX)


# ─────────────────────────────────────────── WebSocket real-time feed
@app.websocket("/ws/risk-feed")
async def risk_feed(websocket: WebSocket) -> None:
    """Real-time risk and alert events pushed to connected dashboards."""
    await websocket.accept()
    await store.add_connection(websocket)
    try:
        while True:
            # Keep the connection alive; clients may send ping/pong frames.
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        await store.remove_connection(websocket)


# ─────────────────────────────────────────── health
@app.get("/health", tags=["system"])
async def health() -> dict:
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "service": settings.APP_NAME,
    }


@app.get("/", tags=["system"])
async def root() -> dict:
    return {
        "message": "Sentinel AI Workforce Safety Platform",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }
