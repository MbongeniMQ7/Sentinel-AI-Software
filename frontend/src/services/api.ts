import type {
  Alert,
  RiskScore,
  TelemetryPayload,
  Worker,
  WorkerCreate,
  WorkerStatus,
  WorkerWithRisk,
} from '../types'

const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail?.detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── workers ──────────────────────────────────────────────────────────────
export const workerApi = {
  list: () => request<WorkerWithRisk[]>('/workers/'),
  get: (id: string) => request<WorkerWithRisk>(`/workers/${id}`),
  create: (data: WorkerCreate) =>
    request<Worker>('/workers/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: WorkerStatus) =>
    request<Worker>(`/workers/${id}/status?status=${status}`, { method: 'PATCH' }),
}

// ─── telemetry ────────────────────────────────────────────────────────────
export const telemetryApi = {
  ingest: (payload: TelemetryPayload) =>
    request<RiskScore>('/telemetry/ingest', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  history: (workerId: string, limit = 60) =>
    request<RiskScore[]>(`/telemetry/${workerId}/history?limit=${limit}`),
}

// ─── risk ─────────────────────────────────────────────────────────────────
export const riskApi = {
  latest: (workerId: string) => request<RiskScore>(`/risk/${workerId}/latest`),
  history: (workerId: string, limit = 60) =>
    request<RiskScore[]>(`/risk/${workerId}/history?limit=${limit}`),
}

// ─── alerts ───────────────────────────────────────────────────────────────
export const alertApi = {
  list: (workerId?: string, limit = 50) => {
    const qs = workerId ? `?worker_id=${workerId}&limit=${limit}` : `?limit=${limit}`
    return request<Alert[]>(`/alerts/${qs}`)
  },
  acknowledge: (alertId: string, acknowledgedBy: string) =>
    request<Alert>(`/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ acknowledged_by: acknowledgedBy }),
    }),
}
