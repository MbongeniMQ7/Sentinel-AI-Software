import { useMemo, useState } from 'react'
import { Camera, CheckCircle2, Search, Video, WifiOff } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { KpiCard } from '@/components/shared/KpiCard'
import { useDevices, type DeviceItem } from '@/lib/api'

const statusTone = { online: 'success', offline: 'danger', maintenance: 'warning' } as const

export function OwnerCamera() {
  const [query, setQuery] = useState('')
  const { data: devices } = useDevices()

  const cameras = useMemo(() => devices.filter((d) => d.type === 'Camera'), [devices])
  const filtered = useMemo(
    () =>
      cameras.filter(
        (d) => !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.location.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, cameras],
  )

  const columns: Column<DeviceItem>[] = [
    {
      key: 'name',
      header: 'Camera',
      render: (d) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40">
            <Video className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-ink">{d.name}</p>
            <p className="text-xs text-ink-subtle">{d.location}</p>
          </div>
        </div>
      ),
    },
    { key: 'assigned', header: 'Assigned to', render: (d) => d.assignedTo ?? 'Unassigned', hideOnMobile: true },
    { key: 'firmware', header: 'Firmware', render: (d) => <span className="font-mono text-xs text-ink-muted">{d.firmware}</span>, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (d) => <Badge tone={statusTone[d.status]} className="capitalize">{d.status}</Badge> },
    { key: 'lastSeen', header: 'Last seen', render: (d) => d.lastSeen, hideOnMobile: true },
  ]

  return (
    <div>
      <PageHeader title="Camera Analysis" description="Camera-based fatigue monitoring devices across the platform." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Cameras" value={cameras.length} icon={<Camera className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Online" value={cameras.filter((d) => d.status === 'online').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <KpiCard label="Offline" value={cameras.filter((d) => d.status === 'offline').length} icon={<WifiOff className="h-5 w-5" />} tone="danger" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search cameras…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
        </div>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<Camera className="h-6 w-6" />} title="No cameras" description="No camera devices have been registered yet." />
          ) : (
            <DataTable columns={columns} data={filtered} rowKey={(d) => d.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
