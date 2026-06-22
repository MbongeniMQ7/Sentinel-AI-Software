// ─── enums ────────────────────────────────────────────────────────────────
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AlertType =
  | 'FATIGUE'
  | 'HEART_RATE'
  | 'SKIN_CONDUCTANCE'
  | 'PERCLOS'
  | 'YAWNING'
  | 'INACTIVITY'
export type WorkerStatus = 'ACTIVE' | 'INACTIVE' | 'ON_BREAK' | 'OFFLINE'

// ─── worker ───────────────────────────────────────────────────────────────
export interface Worker {
  id: string
  name: string
  employee_id: string
  role: string
  zone: string
  status: WorkerStatus
  created_at: string
}

export interface WorkerWithRisk extends Worker {
  risk_score: number
  risk_level: RiskLevel
  last_seen: string | null
}

export interface WorkerCreate {
  name: string
  employee_id: string
  role: string
  zone: string
}

// ─── telemetry ────────────────────────────────────────────────────────────
export interface BiometricReading {
  heart_rate?: number
  skin_conductance?: number
  blood_oxygen?: number
  temperature?: number
  accelerometer_x?: number
  accelerometer_y?: number
  accelerometer_z?: number
}

export interface CVReading {
  ear?: number
  mar?: number
  head_pose_pitch?: number
  head_pose_yaw?: number
  perclos?: number
  blink_rate?: number
}

export interface TelemetryPayload {
  worker_id: string
  timestamp?: string
  biometrics?: BiometricReading
  cv?: CVReading
  environment_temp?: number
  ambient_noise_db?: number
}

// ─── risk ─────────────────────────────────────────────────────────────────
export interface RiskScore {
  worker_id: string
  timestamp: string
  score: number
  level: RiskLevel
  fatigue_component: number
  biometric_component: number
  environmental_component: number
  contributing_factors: string[]
}

// ─── alerts ───────────────────────────────────────────────────────────────
export interface Alert {
  id: string
  worker_id: string
  alert_type: AlertType
  risk_level: RiskLevel
  message: string
  timestamp: string
  acknowledged: boolean
  acknowledged_by: string | null
}

// ─── WebSocket events ─────────────────────────────────────────────────────
export type WSEventType = 'risk_update' | 'alert'

export interface WSEvent {
  event: WSEventType
  data: RiskScore | Alert
  timestamp: string
}
