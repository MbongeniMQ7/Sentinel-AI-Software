import { Activity, Cpu, MapPin, Wifi, WifiOff, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { KpiCard } from '@/components/shared/KpiCard'
import { BarSeries, Donut, TrendArea } from '@/components/shared/Charts'
import { useCompanies, useDevices } from '@/lib/api'

const deviceTypes = [
  { name: 'Cameras', value: 1840, color: '#3563ff' },
  { name: 'Wearables', value: 2210, color: '#10b981' },
  { name: 'Gateways', value: 420, color: '#8b5cf6' },
  { name: 'Helmet sensors', value: 760, color: '#f59e0b' },
]

const deployByRegion = [
  { region: 'N. America', devices: 2100 },
  { region: 'Europe', devices: 1640 },
  { region: 'APAC', devices: 980 },
  { region: 'LATAM', devices: 510 },
  { region: 'MEA', devices: 300 },
]

const uptimeTrend = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((w, i) => ({ week: w, uptime: 98 + ((i * 3) % 2) + Math.random() }))

export function OwnerFleet() {
  const { data: companies } = useCompanies()
  const { data: devices } = useDevices()
  const total = deviceTypes.reduce((s, d) => s + d.value, 0)

  return (
    <div>
      <PageHeader title="IoT Fleet" description="Global device inventory and deployment analytics." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total devices" value={total.toLocaleString()} icon={<Cpu className="h-5 w-5" />} tone="brand" delta={6} />
        <KpiCard label="Online" value="96.4%" icon={<Wifi className="h-5 w-5" />} tone="success" delta={1} />
        <KpiCard label="Offline" value="142" icon={<WifiOff className="h-5 w-5" />} tone="danger" delta={-9} invertDelta />
        <KpiCard label="In maintenance" value="68" icon={<Wrench className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Fleet composition" />
          <CardBody>
            <Donut data={deviceTypes} />
            <div className="mt-3 space-y-2">
              {deviceTypes.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-ink-muted">{d.name}</span>
                  <span className="ml-auto font-medium text-ink">{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Deployment by region" subtitle="Active devices across regions" icon={<MapPin className="h-4 w-4" />} />
          <CardBody>
            <BarSeries data={deployByRegion} xKey="region" series={[{ key: 'devices', label: 'Devices', color: '#3563ff' }]} height={280} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Fleet uptime" subtitle="Weekly average uptime %" icon={<Activity className="h-4 w-4" />} />
          <CardBody>
            <TrendArea data={uptimeTrend} xKey="week" series={[{ key: 'uptime', label: 'Uptime %', color: '#10b981' }]} height={240} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Firmware adoption" />
          <CardBody className="space-y-4">
            {[
              { v: 'v3.4.x (latest)', pct: 72, tone: 'success' as const },
              { v: 'v3.3.x', pct: 18, tone: 'brand' as const },
              { v: 'v3.2.x', pct: 7, tone: 'warning' as const },
              { v: 'Legacy', pct: 3, tone: 'danger' as const },
            ].map((f) => (
              <div key={f.v}>
                <div className="mb-1 flex justify-between text-sm"><span className="text-ink-muted">{f.v}</span><span className="font-medium text-ink">{f.pct}%</span></div>
                <Progress value={f.pct} tone={f.tone} />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Recent fleet activity" subtitle="Latest device events across companies" />
        <CardBody className="space-y-2 p-3">
          {devices.slice(0, 6).map((d, i) => (
            <div key={d.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-muted">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-muted"><Cpu className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{d.name}</p><p className="text-xs text-ink-subtle">{(companies.length ? companies[i % companies.length].name : '—')} · {d.location}</p></div>
              <Badge tone={d.status === 'online' ? 'success' : d.status === 'offline' ? 'neutral' : 'warning'} dot className="capitalize">{d.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
