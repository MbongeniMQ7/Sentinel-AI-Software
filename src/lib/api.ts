import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { workerPhoto } from './avatars'

// ============================================================================
// Shared display types (kept identical to the former mock layer so feature
// pages consume the same shapes — now sourced live from Supabase via RLS).
// ============================================================================

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

export interface AuditLog {
  id: string
  actor: string
  action: string
  target: string
  ip: string
  timestamp: string
}

export interface Faq {
  q: string
  a: string
}

// ============================================================================
// Robust Offline/Simulation Mock Datastore Fallbacks
// ============================================================================

export const IS_DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder') || 
  import.meta.env.VITE_SUPABASE_URL.includes('mock')

export function getLocal<T>(key: string, initial: T): T {
  const existing = localStorage.getItem(key)
  if (existing) {
    try {
      return JSON.parse(existing)
    } catch {
      return initial
    }
  }
  localStorage.setItem(key, JSON.stringify(initial))
  return initial
}

export function setLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

const defaultEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@northbay.sentinel.ai',
    role: 'Forklift Operator',
    department: 'Logistics',
    shift: 'Morning',
    status: 'active',
    fatigue: 28,
    heartRate: 72,
    riskLevel: 'low',
    monitoring: 'hybrid',
    device: 'Wearable Band 3',
    avatarStatus: 'online',
    lastActive: 'Just now',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
  {
    id: 'emp-2',
    name: 'Sarah Finch',
    email: 'sarah.finch@northbay.sentinel.ai',
    role: 'Line Operator',
    department: 'Processing Tower',
    shift: 'Morning',
    status: 'active',
    fatigue: 64,
    heartRate: 85,
    riskLevel: 'moderate',
    monitoring: 'camera',
    device: 'Fixed Cam A4',
    avatarStatus: 'busy',
    lastActive: '2m ago',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'emp-3',
    name: 'Daniel Chen',
    email: 'daniel.chen@northbay.sentinel.ai',
    role: 'Dispatch Coordinator',
    department: 'Dispatch Center',
    shift: 'Morning',
    status: 'on-break',
    fatigue: 78,
    heartRate: 92,
    riskLevel: 'critical',
    monitoring: 'hybrid',
    device: 'Hybrid Band Alpha',
    avatarStatus: 'away',
    lastActive: '12m ago',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  },
  {
    id: 'emp-4',
    name: 'Lena Frost',
    email: 'lena.frost@northbay.sentinel.ai',
    role: 'Technician',
    department: 'Logistics',
    shift: 'Evening',
    status: 'offline',
    fatigue: 15,
    heartRate: 0,
    riskLevel: 'low',
    monitoring: 'camera',
    device: '—',
    avatarStatus: 'offline',
    lastActive: '5h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'emp-5',
    name: 'Omar Hadid',
    email: 'omar.hadid@northbay.sentinel.ai',
    role: 'QA Inspector',
    department: 'Operations',
    shift: 'Evening',
    status: 'active',
    fatigue: 42,
    heartRate: 78,
    riskLevel: 'low',
    monitoring: 'wearable',
    device: 'Vitals Band B2',
    avatarStatus: 'online',
    lastActive: 'Just now',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  }
]

const defaultAlerts: AlertItem[] = [
  {
    id: 'alert-1',
    employee: 'Daniel Chen',
    employeeId: 'emp-3',
    type: 'fatigue',
    severity: 'critical',
    status: 'open',
    message: 'Sustained fatigue index above critical alarm threshold',
    timestamp: '15m ago',
    location: 'Dispatch Room A',
  },
  {
    id: 'alert-2',
    employee: 'Sarah Finch',
    employeeId: 'emp-2',
    type: 'drowsiness',
    severity: 'high',
    status: 'open',
    message: 'Micro-sleep / eye-closure triggers registered',
    timestamp: '32m ago',
    location: 'Processing Tower B',
  },
  {
    id: 'alert-3',
    employee: 'Marcus Vance',
    employeeId: 'emp-1',
    type: 'distraction',
    severity: 'moderate',
    status: 'resolved',
    message: 'Prolonged safety zone focus deviation',
    timestamp: '2h ago',
    location: 'Warehouse Loading Zone 3',
  }
]

const defaultDevices: DeviceItem[] = [
  {
    id: 'dev-1',
    name: 'Thermal Camera Hub A',
    type: 'Camera',
    status: 'online',
    battery: 100,
    firmware: 'v3.1.2',
    assignedTo: 'Sarah Finch',
    location: 'Tower Loader B',
    lastSeen: '1m ago',
  },
  {
    id: 'dev-2',
    name: 'Biometric Wristband 12',
    type: 'Wearable Band',
    status: 'online',
    battery: 84,
    firmware: 'v2.8.9',
    assignedTo: 'Marcus Vance',
    location: 'Warehouse Hub',
    lastSeen: '2m ago',
  },
  {
    id: 'dev-3',
    name: 'Operations Edge Gateway',
    type: 'Edge Gateway',
    status: 'online',
    battery: 100,
    firmware: 'v4.0.1',
    assignedTo: null,
    location: 'Office Roster Desk',
    lastSeen: 'Just now',
  },
  {
    id: 'dev-4',
    name: 'SmartHelmet-V3 Sensor',
    type: 'Helmet Sensor',
    status: 'offline',
    battery: 0,
    firmware: 'v1.4.3',
    assignedTo: 'Lena Frost',
    location: 'Logistics Dock',
    lastSeen: '1d ago',
  }
]

const defaultLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    employee: 'Lena Frost',
    type: 'Annual',
    from: 'Jul 10, 2026',
    to: 'Jul 15, 2026',
    days: 5,
    reason: 'Family summer roadtrip rest cycle.',
    status: 'pending',
  },
  {
    id: 'leave-2',
    employee: 'Marcus Vance',
    type: 'Sick',
    from: 'Jun 22, 2026',
    to: 'Jun 23, 2026',
    days: 1,
    reason: 'Doctor checkup dental.',
    status: 'approved',
  }
]

const defaultBreakRequests: BreakRequest[] = [
  {
    id: 'break-1',
    employee: 'Daniel Chen',
    reason: 'Elevated mental weariness threshold alarm.',
    requestedAt: '3m ago',
    duration: 15,
    status: 'pending',
  },
  {
    id: 'break-2',
    employee: 'Marcus Vance',
    reason: 'Hydration and active rest cycle.',
    requestedAt: '2h ago',
    duration: 10,
    status: 'approved',
  }
]

const defaultCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'NorthBay Logistics',
    plan: 'Enterprise',
    seats: 120,
    activeUsers: 42,
    devices: 24,
    mrr: 1080,
    status: 'active',
    industry: 'Logistics Depot',
    since: '2023',
  },
  {
    id: 'comp-2',
    name: 'Vertex Manufacturing',
    plan: 'Growth',
    seats: 80,
    activeUsers: 32,
    devices: 15,
    mrr: 720,
    status: 'active',
    industry: 'Automotive Parts',
    since: '2024',
  },
  {
    id: 'comp-3',
    name: 'Apex Freight',
    plan: 'Starter',
    seats: 30,
    activeUsers: 12,
    devices: 8,
    mrr: 360,
    status: 'trial',
    industry: 'Freight Ports',
    since: '2026',
  }
]

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    actor: 'Marcus Cole',
    action: 'Approved Roster Break Request',
    target: 'Daniel Chen',
    ip: '192.168.1.144',
    timestamp: '5m ago',
  },
  {
    id: 'audit-2',
    actor: 'Priya Nair',
    action: 'Updated Device Assignment',
    target: 'Thermal Cam Loader',
    ip: '192.168.1.102',
    timestamp: '1h ago',
  }
]

const defaultFaqs: Faq[] = [
  {
    q: 'How does SentinelAI detect fatigue?',
    a: 'SentinelAI fuses computer-vision signals (eye-closure, head pose, micro-expressions) with optional wearable biometrics (heart-rate variability) to compute a real-time fatigue index, processed on-edge for privacy.'
  },
  {
    q: 'Is my camera always recording?',
    a: 'No. The camera processes frames on-device in real time and only stores anonymized metrics. Raw video is never uploaded unless you explicitly enable incident clips.'
  },
  {
    q: 'How do I request a break?',
    a: 'Open Break Management, tap Request Break, choose a reason and duration. Your manager is notified instantly and you will see the status update live.'
  }
]

const defaultFatigueTrend: TrendPoint[] = [
  { time: '08:00', fatigue: 25, heartRate: 70, focus: 95 },
  { time: '10:00', fatigue: 30, heartRate: 72, focus: 90 },
  { time: '12:00', fatigue: 45, heartRate: 74, focus: 82 },
  { time: '14:00', fatigue: 52, heartRate: 80, focus: 75 },
  { time: '16:00', fatigue: 35, heartRate: 71, focus: 88 }
]

const defaultWeeklyAlerts: WeeklyAlertPoint[] = [
  { day: 'Mon', fatigue: 3, drowsiness: 1, distraction: 2 },
  { day: 'Tue', fatigue: 1, drowsiness: 2, distraction: 0 },
  { day: 'Wed', fatigue: 5, drowsiness: 0, distraction: 4 },
  { day: 'Thu', fatigue: 2, drowsiness: 1, distraction: 1 },
  { day: 'Fri', fatigue: 6, drowsiness: 3, distraction: 3 },
  { day: 'Sat', fatigue: 1, drowsiness: 0, distraction: 0 },
  { day: 'Sun', fatigue: 0, drowsiness: 0, distraction: 0 }
]

const defaultDepartmentFatigue: DepartmentFatiguePoint[] = [
  { department: 'Logistics', avgFatigue: 32, employees: 14 },
  { department: 'Processing Tower', avgFatigue: 58, employees: 8 },
  { department: 'Dispatch Center', avgFatigue: 68, employees: 4 },
  { department: 'Operations QA', avgFatigue: 41, employees: 12 }
]

const defaultRevenueTrend: RevenuePoint[] = [
  { month: 'Jan', mrr: 1800, arr: 21600 },
  { month: 'Feb', mrr: 2100, arr: 25200 },
  { month: 'Mar', mrr: 2200, arr: 26400 },
  { month: 'Apr', mrr: 2450, arr: 29400 },
  { month: 'May', mrr: 2700, arr: 32400 },
  { month: 'Jun', mrr: 2980, arr: 35760 }
]

export interface TrendPoint {
  time: string
  fatigue: number
  heartRate: number
  focus: number
  [key: string]: string | number
}

// ============================================================================
// Formatting helpers
// ============================================================================

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.max(1, Math.round(diffMs / 60000))
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const ENUM_TO_DISPLAY = {
  empStatus: { active: 'active', on_break: 'on-break', offline: 'offline', on_leave: 'on-leave' } as Record<string, Employee['status']>,
  alertType: { fatigue: 'fatigue', drowsiness: 'drowsiness', distraction: 'distraction', absence: 'absence', heart_rate: 'heart-rate', no_helmet: 'no-helmet' } as Record<string, AlertType>,
  deviceType: { camera: 'Camera', wearable_band: 'Wearable Band', edge_gateway: 'Edge Gateway', helmet_sensor: 'Helmet Sensor' } as Record<string, DeviceItem['type']>,
  companyStatus: { active: 'active', trial: 'trial', past_due: 'past-due', churned: 'churned' } as Record<string, Company['status']>,
  leaveType: { annual: 'Annual', sick: 'Sick', personal: 'Personal', emergency: 'Emergency' } as Record<string, LeaveRequest['type']>,
}

// ============================================================================
// Generic async hook
// ============================================================================

export interface QueryState<T> {
  data: T
  loading: boolean
  error: string | null
  refetch: () => void
}

function useQuery<T>(fetcher: () => Promise<T>, fallback: T, deps: unknown[] = []): QueryState<T> {
  const [state, setState] = useState<{ data: T; loading: boolean; error: string | null }>({
    data: fallback,
    loading: true,
    error: null,
  })
  const [nonce, setNonce] = useState(0)
  const refetch = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fetcher()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((e: unknown) =>
        active && setState({ data: fallback, loading: false, error: e instanceof Error ? e.message : 'Failed to load' }),
      )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { ...state, refetch }
}

// ============================================================================
// Fetchers + hooks
// ============================================================================

async function fetchEmployees(): Promise<Employee[]> {
  if (IS_DEMO_MODE) {
    return getLocal<Employee[]>('sentinel_mock_employees', defaultEmployees)
  }

  const { data, error } = await supabase
    .from('employee_profiles')
    .select(`
      profile_id, job_title, monitoring, status, fatigue_score, heart_rate, risk_level,
      departments(name), shifts(type),
      profiles!employee_profiles_profile_id_fkey(id, full_name, email, presence, last_active_at, avatar_url)
    `)
  if (error) throw error

  return (data ?? []).map((row: any, i: number) => {
    const p = row.profiles ?? {}
    const shiftType = row.shifts?.type ?? 'morning'
    return {
      id: p.id,
      name: p.full_name ?? 'Unknown',
      email: p.email ?? '',
      role: row.job_title ?? '—',
      department: row.departments?.name ?? '—',
      shift: cap(shiftType) as Employee['shift'],
      status: ENUM_TO_DISPLAY.empStatus[row.status] ?? 'offline',
      fatigue: row.fatigue_score ?? 0,
      heartRate: row.heart_rate ?? 0,
      riskLevel: (row.risk_level ?? 'low') as RiskLevel,
      monitoring: (row.monitoring ?? 'camera') as Employee['monitoring'],
      device: '—',
      avatarStatus: (p.presence ?? 'offline') as Employee['avatarStatus'],
      lastActive: relativeTime(p.last_active_at),
      avatarUrl: p.avatar_url ?? workerPhoto(i),
    }
  })
}

export function useEmployees() {
  return useQuery<Employee[]>(fetchEmployees, [])
}

async function fetchAlerts(): Promise<AlertItem[]> {
  if (IS_DEMO_MODE) {
    return getLocal<AlertItem[]>('sentinel_mock_alerts', defaultAlerts)
  }

  const { data, error } = await supabase
    .from('alerts')
    .select(`
      id, type, severity, status, message, location, created_at, employee_id,
      profiles!alerts_employee_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    employee: row.profiles?.full_name ?? 'Unknown',
    employeeId: row.employee_id,
    type: ENUM_TO_DISPLAY.alertType[row.type] ?? 'fatigue',
    severity: (row.severity ?? 'low') as RiskLevel,
    status: (row.status ?? 'open') as AlertStatus,
    message: row.message ?? '',
    timestamp: relativeTime(row.created_at),
    location: row.location ?? '—',
  }))
}

export function useAlerts() {
  return useQuery<AlertItem[]>(fetchAlerts, [])
}

async function fetchDevices(): Promise<DeviceItem[]> {
  if (IS_DEMO_MODE) {
    return getLocal<DeviceItem[]>('sentinel_mock_devices', defaultDevices)
  }

  const { data, error } = await supabase
    .from('devices')
    .select(`
      id, name, type, status, battery_pct, firmware, location, last_seen_at,
      profiles!devices_assigned_to_fkey(full_name)
    `)
  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    type: ENUM_TO_DISPLAY.deviceType[row.type] ?? 'Camera',
    status: (row.status ?? 'offline') as DeviceItem['status'],
    battery: row.battery_pct ?? 0,
    firmware: row.firmware ?? '—',
    assignedTo: row.profiles?.full_name ?? null,
    location: row.location ?? '—',
    lastSeen: relativeTime(row.last_seen_at),
  }))
}

export function useDevices() {
  return useQuery<DeviceItem[]>(fetchDevices, [])
}

async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  if (IS_DEMO_MODE) {
    return getLocal<LeaveRequest[]>('sentinel_mock_leave_requests', defaultLeaveRequests)
  }

  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      id, type, start_date, end_date, days, reason, status,
      profiles!leave_requests_employee_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    employee: row.profiles?.full_name ?? 'Unknown',
    type: ENUM_TO_DISPLAY.leaveType[row.type] ?? 'Annual',
    from: formatDate(row.start_date),
    to: formatDate(row.end_date),
    days: row.days ?? 0,
    reason: row.reason ?? '',
    status: (row.status ?? 'pending') as LeaveRequest['status'],
  }))
}

export function useLeaveRequests() {
  return useQuery<LeaveRequest[]>(fetchLeaveRequests, [])
}

async function fetchBreakRequests(): Promise<BreakRequest[]> {
  if (IS_DEMO_MODE) {
    return getLocal<BreakRequest[]>('sentinel_mock_break_requests', defaultBreakRequests)
  }

  const { data, error } = await supabase
    .from('break_requests')
    .select(`
      id, reason, duration_min, status, requested_at,
      profiles!break_requests_employee_id_fkey(full_name)
    `)
    .order('requested_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    employee: row.profiles?.full_name ?? 'Unknown',
    reason: row.reason ?? '',
    requestedAt: relativeTime(row.requested_at),
    duration: row.duration_min ?? 0,
    status: (row.status === 'completed' ? 'approved' : row.status ?? 'pending') as BreakRequest['status'],
  }))
}

export function useBreakRequests() {
  return useQuery<BreakRequest[]>(fetchBreakRequests, [])
}

async function fetchCompanies(): Promise<Company[]> {
  if (IS_DEMO_MODE) {
    return getLocal<Company[]>('sentinel_mock_companies', defaultCompanies)
  }

  const [{ data: companies, error }, { data: profileRows }, { data: deviceRows }] = await Promise.all([
    supabase.from('companies').select(`
      id, name, industry, status, seats, since,
      plans(tier), subscriptions(mrr_cents)
    `),
    supabase.from('profiles').select('company_id'),
    supabase.from('devices').select('company_id'),
  ])
  if (error) throw error

  const userCounts = new Map<string, number>()
  for (const r of profileRows ?? []) if (r.company_id) userCounts.set(r.company_id, (userCounts.get(r.company_id) ?? 0) + 1)
  const deviceCounts = new Map<string, number>()
  for (const r of deviceRows ?? []) if (r.company_id) deviceCounts.set(r.company_id, (deviceCounts.get(r.company_id) ?? 0) + 1)

  return (companies ?? []).map((row: any) => {
    const sub = Array.isArray(row.subscriptions) ? row.subscriptions[0] : row.subscriptions
    return {
      id: row.id,
      name: row.name,
      plan: cap(row.plans?.tier ?? 'starter') as Company['plan'],
      seats: row.seats ?? 0,
      activeUsers: userCounts.get(row.id) ?? 0,
      devices: deviceCounts.get(row.id) ?? 0,
      mrr: Math.round((sub?.mrr_cents ?? 0) / 100),
      status: ENUM_TO_DISPLAY.companyStatus[row.status] ?? 'active',
      industry: row.industry ?? '—',
      since: row.since ? new Date(row.since).getFullYear().toString() : '—',
    }
  })
}

export function useCompanies() {
  return useQuery<Company[]>(fetchCompanies, [])
}

async function fetchAuditLogs(): Promise<AuditLog[]> {
  if (IS_DEMO_MODE) {
    return getLocal<AuditLog[]>('sentinel_mock_audit_logs', defaultAuditLogs)
  }

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id, action, target_type, target_id, ip_address, created_at,
      profiles!audit_logs_actor_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    actor: row.profiles?.full_name ?? 'System',
    action: row.action ?? '',
    target: row.target_type ?? '—',
    ip: row.ip_address ?? '—',
    timestamp: relativeTime(row.created_at),
  }))
}

export function useAuditLogs() {
  return useQuery<AuditLog[]>(fetchAuditLogs, [])
}

async function fetchFaqs(): Promise<Faq[]> {
  if (IS_DEMO_MODE) {
    return getLocal<Faq[]>('sentinel_mock_faqs', defaultFaqs)
  }

  const { data, error } = await supabase
    .from('faqs')
    .select('question, answer')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return (data ?? []).map((row: any) => ({ q: row.question, a: row.answer }))
}

export function useFaqs() {
  return useQuery<Faq[]>(fetchFaqs, [])
}

async function fetchFatigueTrend(employeeId?: string): Promise<TrendPoint[]> {
  if (IS_DEMO_MODE) {
    return defaultFatigueTrend
  }

  let query = supabase
    .from('fatigue_readings')
    .select('recorded_at, fatigue_score, heart_rate, focus_score')
    .order('recorded_at', { ascending: true })
    .limit(500)
  if (employeeId) query = query.eq('employee_id', employeeId)
  const { data, error } = await query
  if (error) throw error

  // Bucket into 2-hour slots by hour-of-day and average.
  const buckets = new Map<number, { f: number; h: number; fo: number; n: number }>()
  for (const r of data ?? []) {
    const hour = new Date(r.recorded_at).getHours()
    const slot = hour - (hour % 2)
    const b = buckets.get(slot) ?? { f: 0, h: 0, fo: 0, n: 0 }
    b.f += r.fatigue_score ?? 0
    b.h += r.heart_rate ?? 0
    b.fo += r.focus_score ?? 0
    b.n += 1
    buckets.set(slot, b)
  }
  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([slot, b]) => ({
      time: `${slot.toString().padStart(2, '0')}:00`,
      fatigue: Math.round(b.f / b.n),
      heartRate: Math.round(b.h / b.n),
      focus: Math.round(b.fo / b.n),
    }))
}

export function useFatigueTrend(employeeId?: string) {
  return useQuery<TrendPoint[]>(() => fetchFatigueTrend(employeeId), [], [employeeId])
}

export interface WeeklyAlertPoint {
  day: string
  fatigue: number
  drowsiness: number
  distraction: number
  [key: string]: string | number
}

async function fetchWeeklyAlerts(): Promise<WeeklyAlertPoint[]> {
  if (IS_DEMO_MODE) {
    return defaultWeeklyAlerts
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('alerts')
    .select('type, created_at')
    .gte('created_at', since)
  if (error) throw error

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const base: Record<string, WeeklyAlertPoint> = {}
  for (const d of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    base[d] = { day: d, fatigue: 0, drowsiness: 0, distraction: 0 }

  for (const r of data ?? []) {
    const d = days[new Date(r.created_at).getDay()]
    if (!base[d]) continue
    if (r.type === 'fatigue') base[d].fatigue += 1
    else if (r.type === 'drowsiness') base[d].drowsiness += 1
    else if (r.type === 'distraction') base[d].distraction += 1
  }
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => base[d])
}

export function useWeeklyAlerts() {
  return useQuery<WeeklyAlertPoint[]>(fetchWeeklyAlerts, [])
}

export interface DepartmentFatiguePoint {
  department: string
  avgFatigue: number
  employees: number
  [key: string]: string | number
}

async function fetchDepartmentFatigue(): Promise<DepartmentFatiguePoint[]> {
  if (IS_DEMO_MODE) {
    return defaultDepartmentFatigue
  }

  const { data, error } = await supabase
    .from('employee_profiles')
    .select('fatigue_score, departments(name)')
  if (error) throw error

  const map = new Map<string, { sum: number; n: number }>()
  for (const r of (data ?? []) as any[]) {
    const name = r.departments?.name ?? 'Unassigned'
    const b = map.get(name) ?? { sum: 0, n: 0 }
    b.sum += r.fatigue_score ?? 0
    b.n += 1
    map.set(name, b)
  }
  return Array.from(map.entries()).map(([department, b]) => ({
    department,
    avgFatigue: Math.round(b.sum / Math.max(b.n, 1)),
    employees: b.n,
  }))
}

export function useDepartmentFatigue() {
  return useQuery<DepartmentFatiguePoint[]>(fetchDepartmentFatigue, [])
}

export interface RevenuePoint {
  month: string
  mrr: number
  arr: number
  [key: string]: string | number
}

async function fetchRevenueTrend(): Promise<RevenuePoint[]> {
  const since = new Date()
  since.setMonth(since.getMonth() - 11)
  since.setDate(1)
  const { data, error } = await supabase
    .from('invoices')
    .select('amount_cents, issued_on')
    .gte('issued_on', since.toISOString().slice(0, 10))
  if (error) throw error

  const months: { key: string; label: string }[] = []
  const cursor = new Date(since)
  for (let i = 0; i < 12; i++) {
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: cursor.toLocaleDateString('en-US', { month: 'short' }),
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  const totals = new Map<string, number>()
  for (const r of data ?? []) {
    const d = new Date(r.issued_on)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    totals.set(key, (totals.get(key) ?? 0) + (r.amount_cents ?? 0) / 100)
  }
  return months.map((m) => {
    const mrr = Math.round(totals.get(m.key) ?? 0)
    return { month: m.label, mrr, arr: mrr * 12 }
  })
}

export function useRevenueTrend() {
  return useQuery<RevenuePoint[]>(fetchRevenueTrend, [])
}

// ============================================================================
// Mutations — write back to Supabase (RLS enforces who may do what)
// ============================================================================

const DISPLAY_TO_ENUM = {
  leaveType: { Annual: 'annual', Sick: 'sick', Personal: 'personal', Emergency: 'emergency' } as Record<string, string>,
  deviceType: { Camera: 'camera', 'Wearable Band': 'wearable_band', 'Edge Gateway': 'edge_gateway', 'Helmet Sensor': 'helmet_sensor' } as Record<string, string>,
}

function unwrap(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

/** Employee submits a new leave request. */
export async function submitLeaveRequest(input: {
  employeeId: string
  companyId: string
  type: string
  startDate: string
  endDate: string
  reason: string
}): Promise<void> {
  const { error } = await supabase.from('leave_requests').insert({
    employee_id: input.employeeId,
    company_id: input.companyId,
    type: DISPLAY_TO_ENUM.leaveType[input.type] ?? input.type.toLowerCase(),
    start_date: input.startDate,
    end_date: input.endDate,
    reason: input.reason || null,
    status: 'pending',
  })
  unwrap(error)
}

/** Employee submits a new break request. */
export async function submitBreakRequest(input: {
  employeeId: string
  companyId: string
  reason: string
  durationMin: number
}): Promise<void> {
  const { error } = await supabase.from('break_requests').insert({
    employee_id: input.employeeId,
    company_id: input.companyId,
    reason: input.reason,
    duration_min: input.durationMin,
    status: 'pending',
  })
  unwrap(error)
}

/** Manager/owner approves or rejects a leave request. */
export async function reviewLeaveRequest(id: string, status: 'approved' | 'rejected', reviewerId: string): Promise<void> {
  const { error } = await supabase
    .from('leave_requests')
    .update({ status, reviewed_by: reviewerId })
    .eq('id', id)
  unwrap(error)
}

/** Manager/owner approves or rejects a break request. */
export async function reviewBreakRequest(id: string, status: 'approved' | 'rejected', reviewerId: string): Promise<void> {
  const { error } = await supabase
    .from('break_requests')
    .update({ status, reviewed_by: reviewerId })
    .eq('id', id)
  unwrap(error)
}

/** Employee acknowledges their own alert. */
export async function acknowledgeAlert(id: string): Promise<void> {
  const { error } = await supabase.from('alerts').update({ status: 'acknowledged' }).eq('id', id)
  unwrap(error)
  await supabase.from('alert_events').insert({ alert_id: id, to_status: 'acknowledged', note: 'Acknowledged by employee' })
}

/** Manager/owner transitions an alert (escalate / resolve) and logs the event. */
export async function updateAlertStatus(id: string, status: AlertStatus, note?: string): Promise<void> {
  const { error } = await supabase.from('alerts').update({ status }).eq('id', id)
  unwrap(error)
  await supabase.from('alert_events').insert({ alert_id: id, to_status: status, note: note ?? `Marked ${status}` })
}

/** Update the signed-in user's own profile fields. */
export async function saveProfile(input: { id: string; fullName?: string; phone?: string; title?: string }): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.fullName !== undefined) patch.full_name = input.fullName
  if (input.phone !== undefined) patch.phone = input.phone
  if (input.title !== undefined) patch.title = input.title
  const { error } = await supabase.from('profiles').update(patch).eq('id', input.id)
  unwrap(error)
}

/** Update an employee's monitoring mode (self or manager). */
export async function saveEmployeeMonitoring(profileId: string, monitoring: 'camera' | 'wearable' | 'hybrid'): Promise<void> {
  const { error } = await supabase
    .from('employee_profiles')
    .update({ monitoring, updated_at: new Date().toISOString() })
    .eq('profile_id', profileId)
  unwrap(error)
}

export interface NotificationPrefsInput {
  fatigueAlerts?: boolean
  breakReminders?: boolean
  shiftSummaries?: boolean
  emailEnabled?: boolean
  pushEnabled?: boolean
  smsEnabled?: boolean
}

/** Upsert the signed-in user's notification preferences. */
export async function saveNotificationPreferences(profileId: string, prefs: NotificationPrefsInput): Promise<void> {
  const { error } = await supabase.from('notification_preferences').upsert(
    {
      profile_id: profileId,
      fatigue_alerts: prefs.fatigueAlerts,
      break_reminders: prefs.breakReminders,
      shift_summaries: prefs.shiftSummaries,
      email_enabled: prefs.emailEnabled,
      push_enabled: prefs.pushEnabled,
      sms_enabled: prefs.smsEnabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id' },
  )
  unwrap(error)
}

/** Load the signed-in user's notification preferences (defaults when none set). */
async function fetchNotificationPreferences(profileId?: string): Promise<Required<NotificationPrefsInput>> {
  const defaults = {
    fatigueAlerts: true,
    breakReminders: true,
    shiftSummaries: true,
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
  }
  if (!profileId) return defaults
  const { data } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (!data) return defaults
  return {
    fatigueAlerts: data.fatigue_alerts,
    breakReminders: data.break_reminders,
    shiftSummaries: data.shift_summaries,
    emailEnabled: data.email_enabled,
    pushEnabled: data.push_enabled,
    smsEnabled: data.sms_enabled,
  }
}

export function useNotificationPreferences(profileId?: string) {
  return useQuery<Required<NotificationPrefsInput>>(
    () => fetchNotificationPreferences(profileId),
    {
      fatigueAlerts: true,
      breakReminders: true,
      shiftSummaries: true,
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
    },
    [profileId],
  )
}

/** Employee opens a support ticket (creates ticket + first message). */
export async function submitSupportTicket(input: {
  openedBy: string
  companyId: string | null
  subject: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  message: string
}): Promise<void> {
  const number = `TKT-${Date.now().toString().slice(-6)}`
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      number,
      company_id: input.companyId,
      opened_by: input.openedBy,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: 'open',
    })
    .select('id')
    .single()
  unwrap(error)
  if (data && input.message) {
    await supabase.from('ticket_messages').insert({
      ticket_id: data.id,
      author_id: input.openedBy,
      body: input.message,
    })
  }
}

/** Manager/owner adds a device to the fleet. */
export async function addDevice(input: {
  companyId: string
  name: string
  type: string
  location: string
  assignedTo?: string | null
}): Promise<void> {
  const { error } = await supabase.from('devices').insert({
    company_id: input.companyId,
    name: input.name,
    type: DISPLAY_TO_ENUM.deviceType[input.type] ?? input.type,
    status: 'offline',
    location: input.location || null,
    assigned_to: input.assignedTo || null,
  })
  unwrap(error)
}

/** Manager/owner reassigns a device to an employee (or unassigns when null). */
export async function reassignDevice(id: string, assignedTo: string | null): Promise<void> {
  const { error } = await supabase.from('devices').update({ assigned_to: assignedTo }).eq('id', id)
  unwrap(error)
}

/** Owner/manager invites a user — provisions their role and emails them.
 *  Runs through the `send-invite` edge function (service-role provisioning +
 *  Resend email) so the invitee can sign in with OTP and land in the right
 *  role/company with their contact details already set. */
export async function inviteUser(input: {
  companyId: string | null
  email: string
  role: 'employee' | 'manager' | 'owner'
  invitedBy: string
  fullName?: string
  title?: string
  phone?: string
  avatarUrl?: string
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-invite', {
    body: {
      email: input.email,
      role: input.role,
      companyId: input.companyId,
      fullName: input.fullName,
      title: input.title,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    },
  })
  if (error) {
    // Surface the function's JSON error message when available.
    let message = error.message
    const ctx = (error as { context?: Response }).context
    if (ctx && typeof ctx.json === 'function') {
      try {
        const body = await ctx.json()
        if (body?.error) message = body.error
      } catch {
        /* ignore parse errors */
      }
    }
    throw new Error(message)
  }
  if (data && data.success === false) throw new Error(data.error ?? 'Could not send invite')
}

/** Owner creates a new company (tenant) plus its initial subscription.
 *  Looks up the plan by tier, generates a unique slug, and seeds an MRR
 *  from the plan's per-seat price × seats. */
export async function createCompany(input: {
  name: string
  industry?: string
  plan: 'Starter' | 'Growth' | 'Enterprise'
  seats: number
  status?: 'active' | 'trial'
}): Promise<string> {
  const name = input.name.trim()
  if (!name) throw new Error('Company name is required')

  const { data: plan, error: planErr } = await supabase
    .from('plans')
    .select('id, price_per_seat_cents')
    .eq('tier', input.plan.toLowerCase())
    .maybeSingle()
  unwrap(planErr)
  if (!plan) throw new Error('Selected plan is not available')

  const seats = Math.max(0, Math.floor(input.seats || 0))
  const baseSlug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'company'
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
  const status = input.status === 'active' ? 'active' : 'trial'

  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .insert({
      name,
      slug,
      industry: input.industry?.trim() || null,
      plan_id: plan.id,
      status,
      seats,
    })
    .select('id')
    .single()
  unwrap(companyErr)

  const companyId = company!.id
  const { error: subErr } = await supabase.from('subscriptions').insert({
    company_id: companyId,
    plan_id: plan.id,
    status: status === 'active' ? 'active' : 'trialing',
    seats,
    mrr_cents: seats * (plan.price_per_seat_cents ?? 0),
  })
  unwrap(subErr)

  return companyId
}
