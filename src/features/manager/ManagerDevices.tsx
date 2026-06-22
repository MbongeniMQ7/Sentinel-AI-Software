import { useMemo, useState } from 'react'
import { Battery, BatteryLow, Cpu, Plus, RefreshCw, Search, Wifi, WifiOff, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Field } from '@/components/ui/Input'
import { Drawer } from '@/components/ui/Drawer'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/Badges'
import { KpiCard } from '@/components/shared/KpiCard'
import { devices, employees, type DeviceItem } from '@/lib/mockData'

export function ManagerDevices() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<DeviceItem | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(
    () => devices.filter((d) => (status === 'all' || d.status === status) && (!query || d.name.toLowerCase().includes(query.toLowerCase()) || d.id.toLowerCase().includes(query.toLowerCase()))),
    [query, status],
  )

  const columns: Column<DeviceItem>[] = [
    {
      key: 'name',
      header: 'Device',
      render: (d) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-muted"><Cpu className="h-4 w-4" /></span>
          <div><p className="font-medium text-ink">{d.name}</p><p className="font-mono text-xs text-ink-subtle">{d.id}</p></div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (d) => d.type, hideOnMobile: true },
    {
      key: 'battery',
      header: 'Battery',
      render: (d) => (
        <div className="flex w-28 items-center gap-2">
          {d.battery < 20 ? <BatteryLow className="h-4 w-4 text-rose-500" /> : <Battery className="h-4 w-4 text-ink-subtle" />}
          <Progress value={d.battery} tone={d.battery < 20 ? 'danger' : d.battery < 50 ? 'warning' : 'success'} />
        </div>
      ),
      hideOnMobile: true,
    },
    { key: 'assigned', header: 'Assigned to', render: (d) => d.assignedTo ?? <span className="text-ink-subtle">Unassigned</span>, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Devices"
        description="Manage your camera, wearable and gateway fleet."
        actions={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add device</Button>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Total devices" value={devices.length} icon={<Cpu className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Online" value={devices.filter((d) => d.status === 'online').length} icon={<Wifi className="h-5 w-5" />} tone="success" />
        <KpiCard label="Offline" value={devices.filter((d) => d.status === 'offline').length} icon={<WifiOff className="h-5 w-5" />} tone="danger" />
        <KpiCard label="Maintenance" value={devices.filter((d) => d.status === 'maintenance').length} icon={<Wrench className="h-5 w-5" />} tone="warning" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search devices…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
              <option value="all">All statuses</option>
              <option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maintenance</option>
            </Select>
            <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </div>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<Cpu className="h-6 w-6" />} title="No devices found" description="Try a different search or add a new device." action={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add device</Button>} />
          ) : (
            <DataTable columns={columns} data={filtered} rowKey={(d) => d.id} onRowClick={setSelected} />
          )}
        </CardBody>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={selected?.id}
        footer={<><Button variant="outline" className="flex-1">Reassign</Button><Button className="flex-1">Run diagnostics</Button></>}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><StatusBadge status={selected.status} /><Badge tone="neutral">{selected.type}</Badge></div>
            <dl className="space-y-3 text-sm">
              {[
                { l: 'Firmware', v: selected.firmware },
                { l: 'Battery', v: `${selected.battery}%` },
                { l: 'Location', v: selected.location },
                { l: 'Assigned to', v: selected.assignedTo ?? 'Unassigned' },
                { l: 'Last seen', v: selected.lastSeen },
              ].map((r) => (
                <div key={r.l} className="flex justify-between border-b border-line pb-3"><dt className="text-ink-muted">{r.l}</dt><dd className="font-medium text-ink">{r.v}</dd></div>
              ))}
            </dl>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Health</p>
              <div className="space-y-3">
                {[{ l: 'Signal strength', v: 92 }, { l: 'Uptime', v: 99 }, { l: 'Storage used', v: 41 }].map((h) => (
                  <div key={h.l}><div className="mb-1 flex justify-between text-xs text-ink-muted"><span>{h.l}</span><span>{h.v}%</span></div><Progress value={h.v} /></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add device"
        description="Register a new device to your fleet."
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => setAddOpen(false)}>Add device</Button></>}
      >
        <div className="space-y-4">
          <Field label="Device name" required><Input placeholder="e.g. Camera A-14" /></Field>
          <Field label="Type" required><Select><option>Camera</option><option>Wearable Band</option><option>Edge Gateway</option><option>Helmet Sensor</option></Select></Field>
          <Field label="Assign to"><Select><option value="">Unassigned</option>{employees.slice(0, 8).map((e) => <option key={e.id}>{e.name}</option>)}</Select></Field>
          <Field label="Location"><Input placeholder="e.g. Assembly · Zone 3" /></Field>
        </div>
      </Modal>
    </div>
  )
}
