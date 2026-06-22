import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, Bell, CheckCircle2, Filter, Radio, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Tabs } from '@/components/ui/Tabs'
import { Drawer } from '@/components/ui/Drawer'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { KpiCard } from '@/components/shared/KpiCard'
import { RiskBadge, AlertStatusBadge } from '@/components/shared/Badges'
import { BarSeries } from '@/components/shared/Charts'
import { alerts, employees, weeklyAlerts, type AlertItem } from '@/lib/mockData'

export function ManagerAlerts() {
  const [tab, setTab] = useState('feed')
  const [query, setQuery] = useState('')
  const [sev, setSev] = useState('all')
  const [selected, setSelected] = useState<AlertItem | null>(null)

  const filtered = useMemo(
    () => alerts.filter((a) => (sev === 'all' || a.severity === sev) && (!query || a.employee.toLowerCase().includes(query.toLowerCase()) || a.message.toLowerCase().includes(query.toLowerCase()))),
    [query, sev],
  )

  const columns: Column<AlertItem>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (a) => {
        const emp = employees.find((e) => e.id === a.employeeId)
        return (
          <div className="flex items-center gap-3">
            <Avatar name={a.employee} src={emp?.avatarUrl} size="sm" status={emp?.avatarStatus} />
            <div><p className="font-medium text-ink">{a.employee}</p><p className="text-xs text-ink-subtle">{a.location}</p></div>
          </div>
        )
      },
    },
    { key: 'message', header: 'Alert', render: (a) => a.message, hideOnMobile: true },
    { key: 'severity', header: 'Severity', render: (a) => <RiskBadge level={a.severity} /> },
    { key: 'time', header: 'When', render: (a) => a.timestamp, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (a) => <AlertStatusBadge status={a.status} /> },
    { key: 'action', header: '', render: () => <ArrowUpRight className="h-4 w-4 text-ink-subtle" /> },
  ]

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Real-time fatigue and safety alerts across your teams."
        actions={<Badge tone="danger" dot><Radio className="h-3.5 w-3.5" /> Live</Badge>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Open" value={alerts.filter((a) => a.status === 'open').length} icon={<Bell className="h-5 w-5" />} tone="danger" />
        <KpiCard label="Escalated" value={alerts.filter((a) => a.status === 'escalated').length} icon={<ArrowUpRight className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Acknowledged" value={alerts.filter((a) => a.status === 'acknowledged').length} icon={<AlertTriangle className="h-5 w-5" />} tone="info" />
        <KpiCard label="Resolved (24h)" value={alerts.filter((a) => a.status === 'resolved').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>

      <Card>
        <div className="px-4 pt-3"><Tabs tabs={[{ id: 'feed', label: 'Live feed', count: filtered.length }, { id: 'analytics', label: 'Analytics' }]} active={tab} onChange={setTab} /></div>

        {tab === 'feed' ? (
          <>
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
              <Input icon={<Search className="h-4 w-4" />} placeholder="Search alerts…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
              <div className="flex items-center gap-2 sm:ml-auto">
                <Filter className="h-4 w-4 text-ink-subtle" />
                <Select value={sev} onChange={(e) => setSev(e.target.value)} className="w-40">
                  <option value="all">All severities</option>
                  <option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option><option value="critical">Critical</option>
                </Select>
              </div>
            </div>
            <CardBody className="p-0">
              {filtered.length === 0 ? (
                <EmptyState icon={<Bell className="h-6 w-6" />} title="No alerts" description="All clear — no alerts match your filters." />
              ) : (
                <DataTable columns={columns} data={filtered} rowKey={(a) => a.id} onRowClick={setSelected} />
              )}
            </CardBody>
          </>
        ) : (
          <CardBody className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="Alerts by day & type" />
              <CardBody>
                <BarSeries data={weeklyAlerts} xKey="day" series={[{ key: 'fatigue', label: 'Fatigue', color: '#f59e0b' }, { key: 'drowsiness', label: 'Drowsiness', color: '#f43f5e' }, { key: 'distraction', label: 'Distraction', color: '#8b5cf6' }]} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Top alert drivers" />
              <CardBody className="space-y-3">
                {[
                  { label: 'Sustained fatigue', value: 38, tone: 'bg-amber-500' },
                  { label: 'Micro-sleep events', value: 24, tone: 'bg-rose-500' },
                  { label: 'Attention deviation', value: 19, tone: 'bg-violet-500' },
                  { label: 'PPE compliance', value: 12, tone: 'bg-sky-500' },
                  { label: 'Zone absence', value: 7, tone: 'bg-emerald-500' },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="mb-1 flex justify-between text-sm"><span className="text-ink-muted">{d.label}</span><span className="font-medium text-ink">{d.value}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className={`h-full rounded-full ${d.tone}`} style={{ width: `${d.value}%` }} /></div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </CardBody>
        )}
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.employee}
        subtitle={selected ? `${selected.id} · ${selected.location}` : ''}
        footer={
          <>
            <Button variant="danger" className="flex-1"><ArrowUpRight className="h-4 w-4" /> Escalate</Button>
            <Button className="flex-1"><CheckCircle2 className="h-4 w-4" /> Resolve</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><RiskBadge level={selected.severity} /><AlertStatusBadge status={selected.status} /></div>
            <div className="rounded-xl bg-surface-subtle p-4">
              <p className="text-sm font-medium text-ink">{selected.message}</p>
              <p className="mt-1 text-xs text-ink-muted">Detected {selected.timestamp} · {selected.type}</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Escalation path</p>
              <div className="space-y-3">
                {[{ n: 'Operator notified', done: true }, { n: 'Shift supervisor', done: true }, { n: 'Manager review', done: false }, { n: 'Safety officer', done: false }].map((s) => (
                  <div key={s.n} className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${s.done ? 'bg-emerald-500 text-white' : 'bg-surface-muted text-ink-subtle'}`}>{s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : '·'}</span>
                    <span className={`text-sm ${s.done ? 'text-ink' : 'text-ink-muted'}`}>{s.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
