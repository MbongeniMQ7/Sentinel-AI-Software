import { seeded } from './utils'
import { workerPhoto } from './avatars'

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'
export type AlertType = 'fatigue' | 'drowsiness' | 'distraction' | 'absence' | 'heart-rate' | 'no-helmet'
export type AlertStatus = 'open' | 'acknowledged' | 'escalated' | 'resolved'

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  shift: 'Morning' | 'Evening' | 'Night'
  status: 'active' | 'on-break' | 'offline' | 'on-leave'
  fatigue: number
  heartRate: number
  riskLevel: RiskLevel
  monitoring: 'camera' | 'wearable' | 'hybrid'
  device: string
  avatarStatus: 'online' | 'offline' | 'busy' | 'away'
  lastActive: string
  avatarUrl: string
}

export interface AlertItem {
  id: string
  employee: string
  employeeId: string
  type: AlertType
  severity: RiskLevel
  status: AlertStatus
  message: string
  timestamp: string
  location: string
}

export interface DeviceItem {
  id: string
  name: string
  type: 'Camera' | 'Wearable Band' | 'Edge Gateway' | 'Helmet Sensor'
  status: 'online' | 'offline' | 'maintenance'
  battery: number
  firmware: string
  assignedTo: string | null
  location: string
  lastSeen: string
}

export interface LeaveRequest {
  id: string
  employee: string
  type: 'Annual' | 'Sick' | 'Personal' | 'Emergency'
  from: string
  to: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface BreakRequest {
  id: string
  employee: string
  reason: string
  requestedAt: string
  duration: number
  status: 'pending' | 'approved' | 'rejected' | 'active'
}

export interface Company {
  id: string
  name: string
  plan: 'Starter' | 'Growth' | 'Enterprise'
  seats: number
  activeUsers: number
  devices: number
  mrr: number
  status: 'active' | 'trial' | 'past-due' | 'churned'
  industry: string
  since: string
}

const FIRST = ['Alex', 'Priya', 'Marcus', 'Lena', 'Omar', 'Sofia', 'Kai', 'Nadia', 'Diego', 'Yuki', 'Ravi', 'Grace', 'Tom', 'Ivy', 'Noah', 'Zara', 'Liam', 'Maya', 'Ethan', 'Chloe']
const LAST = ['Mercer', 'Nair', 'Cole', 'Frost', 'Hadid', 'Reyes', 'Tanaka', 'Khan', 'Santos', 'Sato', 'Patel', 'Lee', 'Brooks', 'Wong', 'Adams', 'Ali', 'Murphy', 'Singh', 'Hughes', 'Park']
const DEPTS = ['Operations', 'Logistics', 'Assembly', 'Quality', 'Maintenance', 'Warehouse']
const ROLES = ['Line Operator', 'Forklift Driver', 'Technician', 'QA Inspector', 'Supervisor', 'Picker']

function riskFromFatigue(f: number): RiskLevel {
  if (f >= 80) return 'critical'
  if (f >= 60) return 'high'
  if (f >= 40) return 'moderate'
  return 'low'
}

export const employees: Employee[] = Array.from({ length: 28 }).map((_, i) => {
  const rand = seeded(i + 7)
  const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`
  const fatigue = Math.round(rand() * 95)
  const statuses: Employee['status'][] = ['active', 'active', 'active', 'on-break', 'offline', 'on-leave']
  const status = statuses[Math.floor(rand() * statuses.length)]
  const monitoring: Employee['monitoring'][] = ['camera', 'wearable', 'hybrid']
  return {
    id: `EMP-${1000 + i}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@sentinel.ai`,
    role: ROLES[i % ROLES.length],
    department: DEPTS[i % DEPTS.length],
    shift: (['Morning', 'Evening', 'Night'] as const)[i % 3],
    status,
    fatigue,
    heartRate: 62 + Math.round(rand() * 46),
    riskLevel: riskFromFatigue(fatigue),
    monitoring: monitoring[i % 3],
    device: `DEV-${2200 + i}`,
    avatarStatus: status === 'offline' ? 'offline' : status === 'on-break' ? 'away' : 'online',
    lastActive: `${1 + Math.floor(rand() * 58)}m ago`,
    avatarUrl: workerPhoto(i),
  }
})

const ALERT_MSG: Record<AlertType, string> = {
  fatigue: 'Sustained fatigue index above threshold',
  drowsiness: 'Micro-sleep / eye-closure detected',
  distraction: 'Prolonged attention deviation detected',
  absence: 'Operator left monitored zone',
  'heart-rate': 'Abnormal heart-rate spike detected',
  'no-helmet': 'PPE compliance breach — helmet missing',
}

export const alerts: AlertItem[] = Array.from({ length: 24 }).map((_, i) => {
  const rand = seeded(i + 31)
  const emp = employees[Math.floor(rand() * employees.length)]
  const types: AlertType[] = ['fatigue', 'drowsiness', 'distraction', 'absence', 'heart-rate', 'no-helmet']
  const type = types[i % types.length]
  const sev: RiskLevel[] = ['low', 'moderate', 'high', 'critical']
  const status: AlertStatus[] = ['open', 'acknowledged', 'escalated', 'resolved']
  return {
    id: `ALR-${5000 + i}`,
    employee: emp.name,
    employeeId: emp.id,
    type,
    severity: sev[Math.floor(rand() * 4)],
    status: status[Math.floor(rand() * 4)],
    message: ALERT_MSG[type],
    timestamp: `${1 + Math.floor(rand() * 240)}m ago`,
    location: `${emp.department} · Zone ${1 + (i % 6)}`,
  }
})

export const devices: DeviceItem[] = Array.from({ length: 22 }).map((_, i) => {
  const rand = seeded(i + 53)
  const types: DeviceItem['type'][] = ['Camera', 'Wearable Band', 'Edge Gateway', 'Helmet Sensor']
  const statuses: DeviceItem['status'][] = ['online', 'online', 'online', 'offline', 'maintenance']
  const assigned = rand() > 0.3 ? employees[i % employees.length].name : null
  return {
    id: `DEV-${2200 + i}`,
    name: `${types[i % types.length]} ${String.fromCharCode(65 + (i % 6))}-${10 + i}`,
    type: types[i % types.length],
    status: statuses[Math.floor(rand() * statuses.length)],
    battery: Math.round(rand() * 100),
    firmware: `v${2 + (i % 3)}.${i % 9}.${i % 5}`,
    assignedTo: assigned,
    location: `${DEPTS[i % DEPTS.length]} · Zone ${1 + (i % 6)}`,
    lastSeen: `${1 + Math.floor(rand() * 30)}m ago`,
  }
})

export const leaveRequests: LeaveRequest[] = Array.from({ length: 12 }).map((_, i) => {
  const rand = seeded(i + 71)
  const emp = employees[i % employees.length]
  const days = 1 + Math.floor(rand() * 6)
  const types: LeaveRequest['type'][] = ['Annual', 'Sick', 'Personal', 'Emergency']
  const status: LeaveRequest['status'][] = ['pending', 'pending', 'approved', 'rejected']
  return {
    id: `LV-${800 + i}`,
    employee: emp.name,
    type: types[i % types.length],
    from: `Jul ${5 + i}, 2026`,
    to: `Jul ${5 + i + days}, 2026`,
    days,
    reason: ['Family event', 'Medical appointment', 'Personal matters', 'Travel', 'Recovery'][i % 5],
    status: status[Math.floor(rand() * 4)],
  }
})

export const breakRequests: BreakRequest[] = Array.from({ length: 8 }).map((_, i) => {
  const rand = seeded(i + 91)
  const emp = employees[i % employees.length]
  const status: BreakRequest['status'][] = ['pending', 'approved', 'active', 'rejected']
  return {
    id: `BRK-${300 + i}`,
    employee: emp.name,
    reason: ['Fatigue recovery', 'Meal break', 'Rest period', 'Hydration', 'Stretch break'][i % 5],
    requestedAt: `${2 + Math.floor(rand() * 40)}m ago`,
    duration: [10, 15, 20, 30][i % 4],
    status: status[Math.floor(rand() * 4)],
  }
})

const COMPANY_NAMES = ['NorthBay Logistics', 'Vertex Manufacturing', 'Apex Freight', 'Helios Mining', 'Orbit Assembly', 'Granite Steelworks', 'BlueLine Transit', 'Cobalt Robotics', 'Summit Warehousing', 'Ironclad Industrial', 'Pulse Healthcare', 'Meridian Energy']

export const companies: Company[] = COMPANY_NAMES.map((name, i) => {
  const rand = seeded(i + 113)
  const plans: Company['plan'][] = ['Starter', 'Growth', 'Enterprise']
  const plan = plans[i % 3]
  const seats = [25, 120, 500][i % 3] + Math.floor(rand() * 80)
  const status: Company['status'][] = ['active', 'active', 'active', 'trial', 'past-due', 'churned']
  const rate = { Starter: 12, Growth: 9, Enterprise: 7 }[plan]
  return {
    id: `CMP-${400 + i}`,
    name,
    plan,
    seats,
    activeUsers: Math.round(seats * (0.6 + rand() * 0.35)),
    devices: Math.round(seats * 1.3),
    mrr: seats * rate,
    status: status[Math.floor(rand() * status.length)],
    industry: ['Logistics', 'Manufacturing', 'Mining', 'Healthcare', 'Energy', 'Transit'][i % 6],
    since: `${2021 + (i % 5)}`,
  }
})

// Time-series helpers
export const fatigueTrend = Array.from({ length: 12 }).map((_, i) => {
  const rand = seeded(i + 200)
  return {
    time: `${(i * 2).toString().padStart(2, '0')}:00`,
    fatigue: Math.round(20 + rand() * 60),
    heartRate: Math.round(64 + rand() * 30),
    focus: Math.round(50 + rand() * 45),
  }
})

export const weeklyAlerts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
  const rand = seeded(i + 240)
  return {
    day: d,
    fatigue: Math.round(rand() * 18),
    drowsiness: Math.round(rand() * 12),
    distraction: Math.round(rand() * 9),
  }
})

export const departmentFatigue = DEPTS.map((d, i) => {
  const rand = seeded(i + 280)
  return { department: d, avgFatigue: Math.round(28 + rand() * 50), employees: 4 + Math.floor(rand() * 9) }
})

export const revenueTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
  const base = 142000 + i * 8600
  const rand = seeded(i + 320)
  return { month: m, mrr: Math.round(base + rand() * 6000), arr: Math.round((base + rand() * 6000) * 12) }
})

export const auditLogs = Array.from({ length: 18 }).map((_, i) => {
  const rand = seeded(i + 360)
  const actions = ['approved leave request', 'escalated alert', 'assigned device', 'updated employee profile', 'resolved alert', 'exported report', 'added employee', 'changed shift schedule', 'revoked device']
  const actor = employees[Math.floor(rand() * employees.length)].name
  return {
    id: `LOG-${9000 + i}`,
    actor,
    action: actions[i % actions.length],
    target: `${['EMP', 'ALR', 'DEV', 'RPT'][i % 4]}-${1000 + i}`,
    ip: `10.0.${i % 255}.${(i * 7) % 255}`,
    timestamp: `${1 + Math.floor(rand() * 300)}m ago`,
  }
})

export const faqs = [
  { q: 'How does SentinelAI detect fatigue?', a: 'SentinelAI fuses computer-vision signals (eye-closure, head pose, micro-expressions) with optional wearable biometrics (heart-rate variability) to compute a real-time fatigue index, processed on-edge for privacy.' },
  { q: 'Is my camera always recording?', a: 'No. The camera processes frames on-device in real time and only stores anonymized metrics. Raw video is never uploaded unless you explicitly enable incident clips.' },
  { q: 'How do I request a break?', a: 'Open Break Management, tap “Request Break”, choose a reason and duration. Your manager is notified instantly and you’ll see the status update live.' },
  { q: 'What happens when I get a high-fatigue alert?', a: 'You receive an in-app prompt recommending a rest period. Critical alerts are also surfaced to your manager for support.' },
  { q: 'Can I use SentinelAI without a wearable?', a: 'Yes. Camera-only monitoring works standalone. Wearables add heart-rate context for higher accuracy in hybrid mode.' },
  { q: 'How is my data protected?', a: 'All biometric processing is encrypted in transit and at rest. Personally identifiable video never leaves the edge device by default.' },
]
