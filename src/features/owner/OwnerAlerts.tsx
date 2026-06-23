import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, Bell, CheckCircle2, Radio, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { KpiCard } from '@/components/shared/KpiCard'
import { RiskBadge, AlertStatusBadge } from '@/components/shared/Badges'
import { useAlerts, type AlertItem } from '@/lib/api'

export function OwnerAlerts() {
  const [query, setQuery] = useState('')
  const [sev, setSev] = useState('all')
  const { data: alerts } = useAlerts()

  const filtered = useMemo(
    () =>
      alerts.filter(
        (a) =>
          (sev === 'all' || a.severity === sev) &&
          (!query || a.employee.toLowerCase().includes(query.toLowerCase()) || a.message.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, sev, alerts],
  )

  const columns: Column<AlertItem>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (a) => (
        <div className="flex items-center gap-3">
          <Avatar name={a.employee} size="sm" />
          <div>
            <p className="font-medium text-ink">{a.employee}</p>
            <p className="text-xs text-ink-subtle">{a.location}</p>
          </div>
        </div>
      ),
    },
    { key: 'message', header: 'Alert', render: (a) => a.message, hideOnMobile: true },
    { key: 'severity', header: 'Severity', render: (a) => <RiskBadge level={a.severity} /> },
    { key: 'time', header: 'When', render: (a) => a.timestamp, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (a) => <AlertStatusBadge status={a.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Platform-wide fatigue and safety alerts across all companies."
        actions={<Badge tone="danger" dot><Radio className="h-3.5 w-3.5" /> Live</Badge>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Open" value={alerts.filter((a) => a.status === 'open').length} icon={<Bell className="h-5 w-5" />} tone="danger" />
        <KpiCard label="Escalated" value={alerts.filter((a) => a.status === 'escalated').length} icon={<ArrowUpRight className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Acknowledged" value={alerts.filter((a) => a.status === 'acknowledged').length} icon={<AlertTriangle className="h-5 w-5" />} tone="info" />
        <KpiCard label="Resolved" value={alerts.filter((a) => a.status === 'resolved').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search alerts…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <Select value={sev} onChange={(e) => setSev(e.target.value)} className="sm:ml-auto sm:w-40">
            <option value="all">All severities</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </div>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<Bell className="h-6 w-6" />} title="No alerts" description="All clear — no alerts match your filters." />
          ) : (
            <DataTable columns={columns} data={filtered} rowKey={(a) => a.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
