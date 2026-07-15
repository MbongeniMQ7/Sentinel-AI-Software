import { Brain, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { KpiCard } from '@/components/shared/KpiCard'
import { BarSeries, TrendArea, TrendLine } from '@/components/shared/Charts'
import { useDepartmentFatigue, useFatigueTrend } from '@/lib/api'

export function ManagerAnalytics() {
  const { data: departmentFatigue } = useDepartmentFatigue()
  const { data: fatigueTrend } = useFatigueTrend()

  const totalEmployees = departmentFatigue.reduce((s, d) => s + d.employees, 0)
  const orgAvgFatigue = totalEmployees
    ? Math.round(departmentFatigue.reduce((s, d) => s + d.avgFatigue * d.employees, 0) / totalEmployees)
    : null

  const highestDept = departmentFatigue.length
    ? departmentFatigue.reduce((a, b) => (b.avgFatigue > a.avgFatigue ? b : a))
    : null

  const peakSlot = fatigueTrend.length
    ? fatigueTrend.reduce((a, b) => (b.fatigue > a.fatigue ? b : a))
    : null

  const forecast = fatigueTrend.slice(-7).map((p, i) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return { day: days[i % 7], actual: p.fatigue, baseline: Math.round(p.fatigue * 1.05) }
  })

  return (
    <div>
      <PageHeader
        title="Fatigue Analytics"
        description="Department comparisons, trends and risk overview."
        actions={
          <Select defaultValue="30d" className="w-40">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="quarter">This quarter</option>
          </Select>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Org avg fatigue" value={orgAvgFatigue ?? '—'} icon={<TrendingDown className="h-5 w-5" />} tone="warning" invertDelta />
        <KpiCard label="Peak risk time" value={peakSlot ? peakSlot.time : '—'} icon={<Zap className="h-5 w-5" />} tone="danger" />
        <KpiCard label="Highest dept" value={highestDept?.department ?? '—'} icon={<TrendingUp className="h-5 w-5" />} tone="purple" hint={highestDept ? `${highestDept.avgFatigue} avg index` : undefined} />
        <KpiCard label="Departments tracked" value={departmentFatigue.length} icon={<Brain className="h-5 w-5" />} tone="success" />
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
          <CardHeader title="Trend: actual vs baseline" subtitle="Measured fatigue against rolling baseline" />
          <CardBody>
            <TrendLine
              data={forecast}
              xKey="day"
              series={[
                { key: 'actual', label: 'Actual', color: '#567c8d' },
                { key: 'baseline', label: 'Baseline', color: '#8b5cf6' },
              ]}
              height={260}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Intraday fatigue curve" subtitle="Org-wide average across the day" />
          <CardBody>
            <TrendArea data={fatigueTrend} xKey="time" series={[{ key: 'fatigue', label: 'Fatigue', color: '#f59e0b' }]} height={260} />
          </CardBody>
        </Card>
      </div>

      {departmentFatigue.filter((d) => d.avgFatigue >= 50).length > 0 && (
        <Card className="mt-5">
          <CardHeader title="High-risk departments" subtitle="Departments with average fatigue index = 50" icon={<Brain className="h-4 w-4" />} />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {departmentFatigue
              .filter((d) => d.avgFatigue >= 50)
              .sort((a, b) => b.avgFatigue - a.avgFatigue)
              .map((d) => (
                <div key={d.department} className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{d.department}</p>
                    <p className="text-xs text-ink-muted">{d.employees} employees</p>
                  </div>
                  <div className="text-right">
                    <Badge tone={d.avgFatigue >= 70 ? 'danger' : 'warning'}>{d.avgFatigue >= 70 ? 'Critical' : 'High'}</Badge>
                    <p className="mt-1 text-xs text-ink-subtle">{d.avgFatigue} avg index</p>
                  </div>
                </div>
              ))}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
