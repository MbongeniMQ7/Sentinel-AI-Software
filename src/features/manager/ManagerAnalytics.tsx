import { Brain, Layers, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { KpiCard } from '@/components/shared/KpiCard'
import { BarSeries, TrendArea } from '@/components/shared/Charts'
import { EmptyState } from '@/components/shared/States'
import { useDepartmentFatigue, useFatigueTrend } from '@/lib/api'

export function ManagerAnalytics() {
  const { data: departmentFatigue } = useDepartmentFatigue()
  const { data: fatigueTrend } = useFatigueTrend()
  const totalMonitored = departmentFatigue.reduce((s, d) => s + d.employees, 0)
  const orgAvg = totalMonitored
    ? Math.round(departmentFatigue.reduce((s, d) => s + d.avgFatigue * d.employees, 0) / totalMonitored)
    : 0
  const highest = departmentFatigue.reduce<(typeof departmentFatigue)[number] | null>(
    (a, d) => (a && a.avgFatigue >= d.avgFatigue ? a : d),
    null,
  )
  return (
    <div>
      <PageHeader
        title="Fatigue Analytics"
        description="Department comparisons, trends and AI-driven predictions."
        actions={
          <Select defaultValue="30d" className="w-40">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="quarter">This quarter</option>
          </Select>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Org avg fatigue" value={orgAvg || '—'} icon={<TrendingDown className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Departments" value={departmentFatigue.length} icon={<Layers className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Highest dept" value={highest?.department ?? '—'} icon={<TrendingUp className="h-5 w-5" />} tone="purple" hint={highest ? `${highest.avgFatigue} avg index` : undefined} />
        <KpiCard label="Employees monitored" value={totalMonitored} icon={<Users className="h-5 w-5" />} tone="success" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Department comparison" subtitle="Average fatigue index by department" />
          <CardBody>
            <BarSeries data={departmentFatigue} xKey="department" series={[{ key: 'avgFatigue', label: 'Avg fatigue', color: '#567c8d' }]} height={280} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Risk by headcount" />
          <CardBody className="space-y-3">
            {departmentFatigue.map((d) => (
              <div key={d.department} className="flex items-center justify-between rounded-xl border border-line p-3">
                <div>
                  <p className="text-sm font-medium text-ink">{d.department}</p>
                  <p className="text-xs text-ink-subtle">{d.employees} employees</p>
                </div>
                <Badge tone={d.avgFatigue >= 60 ? 'danger' : d.avgFatigue >= 40 ? 'warning' : 'success'}>{d.avgFatigue}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Predictive forecast" subtitle="Model forecast tracking against measured fatigue" />
          <CardBody>
            <EmptyState icon={<Brain className="h-6 w-6" />} title="No forecast yet" description="Predictive fatigue forecasting appears here once enough shift history has been collected." />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Intraday fatigue curve" subtitle="Org-wide average across the day" />
          <CardBody>
            <TrendArea data={fatigueTrend} xKey="time" series={[{ key: 'fatigue', label: 'Fatigue', color: '#f59e0b' }]} height={260} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="AI risk predictions" subtitle="Forecasted high-risk windows in the next 24 hours" icon={<Brain className="h-4 w-4" />} />
        <CardBody>
          <EmptyState icon={<Brain className="h-6 w-6" />} title="No predictions available" description="High-risk window forecasts appear here once the prediction model has processed recent fatigue readings." />
        </CardBody>
      </Card>
    </div>
  )
}
