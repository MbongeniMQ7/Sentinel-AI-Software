import { Badge } from '@/components/ui/Badge'
import type { RiskLevel, AlertStatus } from '@/lib/api'

const riskTone: Record<RiskLevel, 'success' | 'warning' | 'danger' | 'info'> = {
  low: 'success',
  moderate: 'warning',
  high: 'danger',
  critical: 'danger',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <Badge tone={riskTone[level]} dot className="capitalize">
      {level}
    </Badge>
  )
}

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand' | 'purple'> = {
  active: 'success',
  online: 'success',
  approved: 'success',
  resolved: 'success',
  'on-break': 'warning',
  away: 'warning',
  pending: 'warning',
  maintenance: 'warning',
  trial: 'info',
  acknowledged: 'info',
  offline: 'neutral',
  'on-leave': 'purple',
  open: 'danger',
  escalated: 'danger',
  rejected: 'danger',
  'past-due': 'danger',
  churned: 'neutral',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTone[status] ?? 'neutral'} dot className="capitalize">
      {status.replace('-', ' ')}
    </Badge>
  )
}

const alertTone: Record<AlertStatus, 'danger' | 'info' | 'success' | 'warning'> = {
  open: 'danger',
  acknowledged: 'info',
  escalated: 'warning',
  resolved: 'success',
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <Badge tone={alertTone[status]} className="capitalize">
      {status}
    </Badge>
  )
}
