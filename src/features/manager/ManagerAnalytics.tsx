import { Brain, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { KpiCard } from '@/components/shared/KpiCard'
import { BarSeries, TrendArea, TrendLine } from '@/components/shared/Charts'
import { useDepartmentFatigue, useFatigueTrend } from '@/lib/api'

const predictions = [
  { window: '14:00 – 16:00', dept: 'Night · Assembly', risk: 'High', prob: 78, tone: 'danger' as const },
  { window: '22:00 – 00:00', dept: 'Night · Logistics', risk: 'High', prob: 71, tone: 'danger' as const },
  { window: '11:00 – 12:00', dept: 'Morning · Quality', risk: 'Moderate', prob: 54, tone: 'warning' as const },
  { window: '16:00 – 17:00', dept: 'Evening · Warehouse', risk: 'Moderate', prob: 49, tone: 'warning' as const },
]

const forecast = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
  day: d,
  actual: 40 + ((i * 7) % 25),
  predicted: 42 + ((i * 6) % 22),
}))

export function ManagerAnalytics() {
  const { data: departmentFatigue } = useDepartmentFatigue()
  const { data: fatigueTrend } = useFatigueTrend()
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
        <KpiCard label="Org avg fatigue" value="42" icon={<TrendingDown className="h-5 w-5" />} tone="warning" delta={-6} invertDelta />
        <KpiCard label="Peak risk window" value="14–16h" icon={<Zap className="h-5 w-5" />} tone="danger" />
        <KpiCard label="Highest dept" value="Night Ops" icon={<TrendingUp className="h-5 w-5" />} tone="purple" hint="71 avg index" />
        <KpiCard label="Model accuracy" value="94%" icon={<Brain className="h-5 w-5" />} tone="success" delta={2} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Department comparison" subtitle="Average fatigue index by department" />
          <CardBody>
            <BarSeries data={departmentFatigue} xKey="department" series={[{ key: 'avgFatigue', label: 'Avg fatigue', color: '#3563ff' }]} height={280} />
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
          <CardHeader title="Trend: actual vs predicted" subtitle="Model forecast tracking against measured fatigue" />
          <CardBody>
            <TrendLine data={forecast} xKey="day" series={[{ key: 'actual', label: 'Actual', color: '#3563ff' }, { key: 'predicted', label: 'Predicted', color: '#8b5cf6' }]} height={260} />
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
        <CardBody className="grid gap-3 sm:grid-cols-2">
          {predictions.map((p) => (
            <div key={p.window} className="flex items-center justify-between rounded-xl border border-line p-4">
              <div>
                <p className="text-sm font-semibold text-ink">{p.window}</p>
                <p className="text-xs text-ink-muted">{p.dept}</p>
              </div>
              <div className="text-right">
                <Badge tone={p.tone}>{p.risk}</Badge>
                <p className="mt-1 text-xs text-ink-subtle">{p.prob}% probability</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
