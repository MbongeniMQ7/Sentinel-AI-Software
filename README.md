# Sentinel AI – Workforce Safety Platform

> AI-powered fatigue and biometric risk monitoring built for the world's most demanding work environments.

Sentinel AI continuously fuses **computer vision**, **IoT telemetry**, and **physiological signals** to score every worker's risk — in real time, at industrial scale — designed around three uncompromising principles: **safety**, **prevention**, and **real-time intelligence**.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Cloudflare Workers (Edge)               │
│  POST /edge/ingest  ·  POST /edge/cv-frame           │
│  Low-latency IoT ingestion · CF datacenter routing   │
└───────────────────┬─────────────────────────────────┘
                    │ proxies to
┌───────────────────▼─────────────────────────────────┐
│              Python / FastAPI Backend                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ CV Service   │  │ Risk Engine  │  │ Telemetry │  │
│  │ (MediaPipe)  │  │  (composite) │  │  Service  │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
│                                                      │
│  REST API  /api/v1/workers  /telemetry  /alerts      │
│  WebSocket /ws/risk-feed  (real-time fan-out)        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│           React / TypeScript Frontend                │
│  Live dashboard · Worker cards · Risk gauges         │
│  Signal breakdown · Alert panel · History charts     │
└─────────────────────────────────────────────────────┘
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Python 3.12, FastAPI, Pydantic v2, Uvicorn |
| ML / AI | TensorFlow 2, MediaPipe Face Mesh |
| Edge | Cloudflare Workers (TypeScript) |
| Realtime | WebSocket fan-out (native FastAPI) |
| Storage | In-memory ring buffer (Redis optional) |
| Container | Docker / Docker Compose |

---

## Risk Scoring Engine

The `CompositeRiskEngine` fuses three independent sub-scorers into a single **0 – 100** risk score per worker, updated with every telemetry frame:

```
Risk Score = 0.55 × Fatigue + 0.35 × Biometric + 0.10 × Environmental
```

### Fatigue Scorer (Computer Vision)
| Signal | Threshold | Weight |
|---|---|---|
| Eye Aspect Ratio (EAR) | < 0.25 | 35 % |
| PERCLOS (% time eyes closed) | > 15 % / 60 s | 35 % |
| Mouth Aspect Ratio / Yawning | > 0.60 | 15 % |
| Blink rate | < 10 or > 40 blinks/min | 10 % |
| Head pose pitch (nodding) | > 20° | 5 % |

### Biometric Scorer (IoT Wearables)
Heart rate, skin conductance (stress), SpO₂, core temperature, accelerometer magnitude.

### Environmental Scorer
Ambient temperature (> 35 °C) and noise level (> 85 dB).

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node ≥ 22, Python ≥ 3.12 (for local dev without Docker)

### Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- WebSocket: ws://localhost:8000/ws/risk-feed

### Local development

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/workers/` | Register a worker |
| `GET`  | `/api/v1/workers/` | List all workers with risk scores |
| `POST` | `/api/v1/telemetry/ingest` | Ingest telemetry payload → returns risk score |
| `GET`  | `/api/v1/risk/{id}/latest` | Latest risk score for a worker |
| `GET`  | `/api/v1/alerts/` | List active alerts |
| `POST` | `/api/v1/alerts/{id}/acknowledge` | Acknowledge an alert |
| `WS`   | `/ws/risk-feed` | Real-time risk & alert events |

Full interactive docs available at `/docs` (Swagger UI) and `/redoc`.

---

## Cloudflare Workers Edge Layer

```bash
cd workers
npm install
wrangler dev          # local dev on port 8787
wrangler deploy       # deploy to Cloudflare
```

Set the backend URL and shared secret:
```bash
wrangler secret put API_SECRET
```
Then update `BACKEND_URL` in `wrangler.toml`.

---

## ML Models

```bash
# Generate synthetic training data
python -m ml.training.generate_data

# Build model (requires TensorFlow)
python -c "from ml.models.sentinel_models import build_fusion_model; m = build_fusion_model(); m.summary()"
```

Inference falls back to the built-in rule-based classifier when TensorFlow is unavailable, so the backend runs on any machine.

---

## Testing

**Backend (28 tests)**
```bash
cd backend
pytest -v
```

**Frontend**
```bash
cd frontend
npm test
```

---

## Project Structure

```
sentinel-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST endpoints
│   │   ├── core/            # Config, in-memory store
│   │   ├── models/          # Pydantic schemas
│   │   └── services/        # Risk engine, CV service, telemetry service
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Dashboard, WorkerCard, Charts, AlertPanel
│   │   ├── hooks/           # useWorkers, useRiskFeed (WebSocket)
│   │   ├── services/        # REST API client
│   │   └── types/           # TypeScript interfaces
│   └── package.json
├── ml/
│   ├── models/              # TensorFlow model definitions
│   └── training/            # Synthetic data generator
├── workers/
│   └── src/index.ts         # Cloudflare Workers edge handler
└── docker-compose.yml
```

---

## License

MIT © 2026 Mbongeni Qwabe
