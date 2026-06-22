import { useMemo } from 'react'
import { Activity, Cpu, MapPin, Wifi, WifiOff, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { KpiCard } from '@/components/shared/KpiCard'
import { BarSeries, Donut } from '@/components/shared/Charts'
import { EmptyState } from '@/components/shared/States'
import { useCompanies, useDevices, type DeviceItem } from '@/lib/api'

const typeColors: Record<DeviceItem['type'], string> = {
  Camera: '#3563ff',
  'Wearable Band': '#10b981',
  'Edge Gateway': '#8b5cf6',
  'Helmet Sensor': '#f59e0b',
}

const firmwareTones = ['success', 'brand', 'warning', 'danger'] as const

export function OwnerFleet() {
  const { data: companies } = useCompanies()
  const { data: devices } = useDevices()

  const total = devices.length
  const online = devices.filter((d) => d.status === 'online').length
  const offline = devices.filter((d) => d.status === 'offline').length
  const maintenance = devices.filter((d) => d.status === 'maintenance').length
  const onlinePct = total ? Math.round((online / total) * 100) : 0

  const composition = useMemo(() => {
    const counts = new Map<DeviceItem['type'], number>()
    for (const d of devices) counts.set(d.type, (counts.get(d.type) ?? 0) + 1)
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value, color: typeColors[name] ?? '#94a3b8' }))
  }, [devices])

  const byRegion = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of devices) counts.set(d.location, (counts.get(d.location) ?? 0) + 1)
    return Array.from(counts.entries())
      .map(([region, count]) => ({ region, devices: count }))
      .sort((a, b) => b.devices - a.devices)
      .slice(0, 8)
  }, [devices])

  const firmware = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of devices) counts.set(d.firmware, (counts.get(d.firmware) ?? 0) + 1)
    return Array.from(counts.entries())
      .map(([v, count]) => ({ v, pct: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4)
  }, [devices, total])

  return (
    <div>
      <PageHeader title="IoT Fleet" description="Live device inventory and deployment analytics." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total devices" value={total.toLocaleString()} icon={<Cpu className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Online" value={`${onlinePct}%`} icon={<Wifi className="h-5 w-5" />} tone="success" />
        <KpiCard label="Offline" value={offline.toLocaleString()} icon={<WifiOff className="h-5 w-5" />} tone="danger" />
        <KpiCard label="In maintenance" value={maintenance.toLocaleString()} icon={<Wrench className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Fleet composition" />
          <CardBody>
            {composition.length === 0 ? (
              <EmptyState icon={<Cpu className="h-6 w-6" />} title="No devices yet" description="Registered devices will appear here." />
            ) : (
              <>
                <Donut data={composition} />
                <div className="mt-3 space-y-2">
                  {composition.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-ink-muted">{d.name}</span>
                      <span className="ml-auto font-medium text-ink">{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Deployment by location" subtitle="Active devices across sites" icon={<MapPin className="h-4 w-4" />} />
          <CardBody>
            {byRegion.length === 0 ? (
              <EmptyState icon={<MapPin className="h-6 w-6" />} title="No deployment data" description="Device locations will appear here." />
            ) : (
              <BarSeries data={byRegion} xKey="region" series={[{ key: 'devices', label: 'Devices', color: '#3563ff' }]} height={280} />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Firmware adoption" subtitle="Distribution across the fleet" />
          <CardBody className="space-y-4">
            {firmware.length === 0 ? (
              <EmptyState icon={<Activity className="h-6 w-6" />} title="No firmware data" description="Firmware versions will appear here." />
            ) : (
              firmware.map((f, i) => (
                <div key={f.v}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-ink-muted">{f.v}</span><span className="font-medium text-ink">{f.pct}%</span></div>
                  <Progress value={f.pct} tone={firmwareTones[i % firmwareTones.length]} />
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Recent fleet activity" subtitle="Latest device events across companies" />
          <CardBody className="space-y-2 p-3">
            {devices.length === 0 ? (
              <EmptyState icon={<Cpu className="h-6 w-6" />} title="No device activity" description="Device events will appear here once devices report in." />
            ) : (
              devices.slice(0, 6).map((d, i) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-muted">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-muted"><Cpu className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{d.name}</p><p className="text-xs text-ink-subtle">{(companies.length ? companies[i % companies.length].name : '—')} · {d.location}</p></div>
                  <Badge tone={d.status === 'online' ? 'success' : d.status === 'offline' ? 'neutral' : 'warning'} dot className="capitalize">{d.status}</Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
