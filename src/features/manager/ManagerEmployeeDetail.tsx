import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bell, Coffee, HeartPulse, Mail, MapPin, Phone, Video } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { TrendArea } from '@/components/shared/Charts'
import { RiskBadge, StatusBadge, AlertStatusBadge } from '@/components/shared/Badges'
import { KpiCard } from '@/components/shared/KpiCard'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useEmployees, useAlerts, useFatigueTrend, type AlertItem } from '@/lib/api'
import { useState } from 'react'

const sessionColumns: Column<{ id: string; date: string; duration: string; avgFatigue: number; alerts: number; status: string }>[] = [
  { key: 'id', header: 'Session', render: (s) => <span className="font-mono text-xs text-ink-muted">{s.id}</span> },
  { key: 'date', header: 'Date', render: (s) => s.date },
  { key: 'duration', header: 'Duration', render: (s) => s.duration, hideOnMobile: true },
  { key: 'avgFatigue', header: 'Avg fatigue', render: (s) => s.avgFatigue, hideOnMobile: true },
  { key: 'alerts', header: 'Alerts', render: (s) => <Badge tone={s.alerts > 2 ? 'danger' : 'neutral'}>{s.alerts}</Badge> },
  { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
]

const sessions = Array.from({ length: 6 }).map((_, i) => ({
  id: `SES-${700 + i}`,
  date: `Jun ${22 - i}, 2026`,
  duration: `${7 + (i % 2)}h ${10 + i * 6}m`,
  avgFatigue: 30 + ((i * 9) % 50),
  alerts: i % 4,
  status: i === 0 ? 'active' : 'offline',
}))

export function ManagerEmployeeDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('trends')
  const { data: employees, loading } = useEmployees()
  const { data: alerts } = useAlerts()
  const { data: fatigueTrend } = useFatigueTrend(id)
  const emp = employees.find((e) => e.id === id) ?? employees[0]
  const empAlerts = alerts.filter((a) => a.employeeId === emp?.id)
  const alertList = empAlerts.length ? empAlerts : alerts.slice(0, 3)

  const alertCols: Column<AlertItem>[] = [
    { key: 'message', header: 'Alert', render: (a) => <span className="font-medium text-ink">{a.message}</span> },
    { key: 'type', header: 'Type', render: (a) => <span className="capitalize">{a.type}</span>, hideOnMobile: true },
    { key: 'severity', header: 'Severity', render: (a) => <RiskBadge level={a.severity} /> },
    { key: 'time', header: 'When', render: (a) => a.timestamp, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (a) => <AlertStatusBadge status={a.status} /> },
  ]

  if (!emp) {
    return (
      <div className="py-20 text-center text-sm text-ink-muted">
        {loading ? 'Loading employee…' : 'Employee not found.'}
      </div>
    )
  }

  return (
    <div>
      <Link to="/admin/workforce" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to workforce
      </Link>

      <Card className="mb-5">
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={emp.name} src={emp.avatarUrl} size="lg" status={emp.avatarStatus} className="scale-125" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-ink">{emp.name}</h1>
              <RiskBadge level={emp.riskLevel} />
              <StatusBadge status={emp.status} />
            </div>
            <p className="text-sm text-ink-muted">{emp.role} · {emp.department} · {emp.shift} shift</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-muted">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {emp.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {emp.device}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +1 (555) 0142</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Video className="h-4 w-4" /> Live feed</Button>
            <Button size="sm"><Bell className="h-4 w-4" /> Send alert</Button>
          </div>
        </CardBody>
      </Card>

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Fatigue index" value={emp.fatigue} icon={<HeartPulse className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Heart rate" value={`${emp.heartRate} bpm`} icon={<HeartPulse className="h-5 w-5" />} tone="danger" />
        <KpiCard label="Alerts (7d)" value={alertList.length} icon={<Bell className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Breaks taken" value="9" icon={<Coffee className="h-5 w-5" />} tone="purple" />
      </div>

      <Card>
        <div className="px-4 pt-3">
          <Tabs
            tabs={[
              { id: 'trends', label: 'Fatigue trends' },
              { id: 'sessions', label: 'Session history', count: sessions.length },
              { id: 'alerts', label: 'Alerts', count: alertList.length },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
        <CardBody className={tab === 'trends' ? '' : 'p-0'}>
          {tab === 'trends' && (
            <TrendArea data={fatigueTrend} xKey="time" series={[{ key: 'fatigue', label: 'Fatigue', color: '#f59e0b' }, { key: 'heartRate', label: 'Heart rate', color: '#f43f5e' }, { key: 'focus', label: 'Focus', color: '#10b981' }]} height={300} />
          )}
          {tab === 'sessions' && <DataTable columns={sessionColumns} data={sessions} rowKey={(s) => s.id} />}
          {tab === 'alerts' && <DataTable columns={alertCols} data={alertList} rowKey={(a) => a.id} />}
        </CardBody>
      </Card>
    </div>
  )
}
