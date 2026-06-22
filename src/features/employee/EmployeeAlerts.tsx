import { useMemo, useState } from 'react'
import { AlertTriangle, Bell, CheckCircle2, Filter, MapPin, Search, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Tabs } from '@/components/ui/Tabs'
import { Drawer } from '@/components/ui/Drawer'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/States'
import { RiskBadge, AlertStatusBadge } from '@/components/shared/Badges'
import { KpiCard } from '@/components/shared/KpiCard'
import { useAlerts, acknowledgeAlert, type AlertItem } from '@/lib/api'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'acknowledged', label: 'Acknowledged' },
  { id: 'resolved', label: 'Resolved' },
]

export function EmployeeAlerts() {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('all')
  const [selected, setSelected] = useState<AlertItem | null>(null)
  const { data: alerts, refetch } = useAlerts()
  const [acking, setAcking] = useState(false)

  const acknowledge = async () => {
    if (!selected) return
    setAcking(true)
    try {
      await acknowledgeAlert(selected.id)
      setSelected(null)
      refetch()
    } finally {
      setAcking(false)
    }
  }

  const filtered = useMemo(
    () =>
      alerts.filter((a) => {
        if (tab !== 'all' && a.status !== tab) return false
        if (severity !== 'all' && a.severity !== severity) return false
        if (query && !a.message.toLowerCase().includes(query.toLowerCase()) && !a.location.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [tab, severity, query, alerts],
  )

  return (
    <div>
      <PageHeader title="Alert Center" description="Your fatigue and wellness alert history." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Open alerts" value={alerts.filter((a) => a.status === 'open').length} icon={<Bell className="h-5 w-5" />} tone="danger" />
        <KpiCard label="This week" value={alerts.length} icon={<AlertTriangle className="h-5 w-5" />} tone="warning" delta={-8} invertDelta />
        <KpiCard label="Resolved" value={alerts.filter((a) => a.status === 'resolved').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search alerts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Filter className="h-4 w-4 text-ink-subtle" />
            <Select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-40">
              <option value="all">All severities</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </div>
        </div>

        <div className="px-4 pt-2">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
        </div>

        <CardBody className="p-3">
          {filtered.length === 0 ? (
            <EmptyState icon={<Bell className="h-6 w-6" />} title="No alerts found" description="Try adjusting your filters or search query." />
          ) : (
            <div className="space-y-2">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:border-line hover:bg-surface-muted"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{a.message}</p>
                    <p className="flex items-center gap-2 text-xs text-ink-subtle">
                      <MapPin className="h-3 w-3" /> {a.location} · {a.timestamp}
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <RiskBadge level={a.severity} />
                    <AlertStatusBadge status={a.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.message}
        subtitle={selected ? `${selected.id} · ${selected.type}` : ''}
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Dismiss</Button>
            <Button className="flex-1" onClick={acknowledge} disabled={acking || selected?.status === 'acknowledged' || selected?.status === 'resolved'}>
              {acking ? 'Saving…' : selected?.status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <RiskBadge level={selected.severity} />
              <AlertStatusBadge status={selected.status} />
            </div>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Location', value: selected.location, icon: MapPin },
                { label: 'Detected', value: selected.timestamp, icon: Clock },
                { label: 'Type', value: selected.type, icon: AlertTriangle },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-line pb-3">
                  <dt className="flex items-center gap-2 text-ink-muted">
                    <row.icon className="h-4 w-4" /> {row.label}
                  </dt>
                  <dd className="font-medium capitalize text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-xl bg-surface-subtle p-4">
              <p className="text-sm font-medium text-ink">Recommended action</p>
              <p className="mt-1 text-sm text-ink-muted">
                Take a 10–15 minute rest break and hydrate. Your fatigue index should recover within 20 minutes.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Timeline</p>
              <div className="space-y-3">
                {['Detected by Camera A-12', 'Operator notified', 'Awaiting acknowledgement'].map((t, i) => (
                  <div key={t} className="flex items-start gap-3">
                    <span className={`mt-1 h-2 w-2 rounded-full ${i === 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <div>
                      <p className="text-sm text-ink">{t}</p>
                      <p className="text-xs text-ink-subtle">{selected.timestamp}</p>
                    </div>
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
