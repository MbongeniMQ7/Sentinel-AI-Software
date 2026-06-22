import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowRight, Bell, Coffee, ShieldCheck, TrendingDown, Users } from 'lucide-react'
import { PageHeader, Section } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { KpiCard } from '@/components/shared/KpiCard'
import { TrendArea, Donut } from '@/components/shared/Charts'
import { RiskBadge } from '@/components/shared/Badges'
import { useEmployees, useAlerts, useFatigueTrend, useDepartmentFatigue } from '@/lib/api'
import { cn } from '@/lib/utils'

function heatColor(v: number) {
  if (v >= 75) return 'bg-rose-500 text-white'
  if (v >= 60) return 'bg-orange-400 text-white'
  if (v >= 40) return 'bg-amber-300 text-amber-900'
  if (v >= 25) return 'bg-emerald-300 text-emerald-900'
  return 'bg-emerald-200 text-emerald-900'
}

export function ManagerDashboard() {
  const { data: employees } = useEmployees()
  const { data: alerts } = useAlerts()
  const { data: fatigueTrend } = useFatigueTrend()
  const { data: departmentFatigue } = useDepartmentFatigue()
  const liveAlerts = alerts.slice(0, 6)
  const avgFatigue = employees.length ? Math.round(employees.reduce((s, e) => s + e.fatigue, 0) / employees.length) : 0
  const riskDist = [
    { name: 'Low', value: employees.filter((e) => e.riskLevel === 'low').length, color: '#10b981' },
    { name: 'Moderate', value: employees.filter((e) => e.riskLevel === 'moderate').length, color: '#f59e0b' },
    { name: 'High', value: employees.filter((e) => e.riskLevel === 'high').length, color: '#fb923c' },
    { name: 'Critical', value: employees.filter((e) => e.riskLevel === 'critical').length, color: '#f43f5e' },
  ]

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        description="Live workforce wellness across your teams."
        actions={
          <>
            <Link to="/admin/workforce"><Button variant="outline" size="sm"><Activity className="h-4 w-4" /> Live view</Button></Link>
            <Link to="/admin/reports"><Button size="sm">Generate report</Button></Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active workforce" value={employees.filter((e) => e.status === 'active').length} icon={<Users className="h-5 w-5" />} tone="brand" hint="On shift now" />
        <KpiCard label="Avg fatigue" value={avgFatigue} icon={<Activity className="h-5 w-5" />} tone="warning" hint="Across all teams" />
        <KpiCard label="Open alerts" value={alerts.filter((a) => a.status === 'open').length} icon={<Bell className="h-5 w-5" />} tone="danger" />
        <KpiCard label="On break / leave" value={employees.filter((e) => e.status === 'on-break' || e.status === 'on-leave').length} icon={<Coffee className="h-5 w-5" />} tone="purple" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Workforce fatigue trend" subtitle="Rolling fatigue & focus across the shift" icon={<TrendingDown className="h-4 w-4" />} />
          <CardBody>
            <TrendArea data={fatigueTrend} xKey="time" series={[{ key: 'fatigue', label: 'Avg fatigue', color: '#f59e0b' }, { key: 'focus', label: 'Avg focus', color: '#10b981' }]} height={260} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Risk distribution" />
          <CardBody>
            <Donut data={riskDist} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {riskDist.map((r) => (
                <div key={r.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                  <span className="text-ink-muted">{r.name}</span>
                  <span className="ml-auto font-medium text-ink">{r.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader title="Risk heatmap" subtitle="Average fatigue by department & shift" />
          <CardBody>
            <div className="overflow-x-auto">
              <div className="min-w-[480px]">
                <div className="mb-2 grid grid-cols-[120px_repeat(3,1fr)] gap-2 text-xs font-medium text-ink-subtle">
                  <span />
                  {['Morning', 'Evening', 'Night'].map((s) => <span key={s} className="text-center">{s}</span>)}
                </div>
                {departmentFatigue.map((d, di) => (
                  <div key={d.department} className="mb-2 grid grid-cols-[120px_repeat(3,1fr)] items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">{d.department}</span>
                    {[0, 1, 2].map((si) => {
                      const v = Math.max(8, Math.min(95, d.avgFatigue + (si - 1) * 12 + di * 3))
                      return (
                        <div key={si} className={cn('flex h-11 items-center justify-center rounded-lg text-sm font-semibold', heatColor(v))}>
                          {Math.round(v)}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-3 text-xs text-ink-muted">
              <span>Low</span>
              <div className="flex gap-1">
                {['bg-emerald-200', 'bg-emerald-300', 'bg-amber-300', 'bg-orange-400', 'bg-rose-500'].map((c) => (
                  <span key={c} className={cn('h-3 w-6 rounded', c)} />
                ))}
              </div>
              <span>High</span>
            </div>
          </CardBody>
        </Card>

        {/* Live alert feed */}
        <Card>
          <CardHeader title="Live alert feed" icon={<AlertTriangle className="h-4 w-4" />} action={<Link to="/admin/alerts" className="text-xs font-medium text-brand-600 hover:underline">All <ArrowRight className="inline h-3 w-3" /></Link>} />
          <CardBody className="space-y-2 p-3">
            {liveAlerts.map((a) => {
              const emp = employees.find((e) => e.id === a.employeeId)
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-muted">
                  <Avatar name={a.employee} src={emp?.avatarUrl} size="sm" status={emp?.avatarStatus} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{a.employee}</p>
                    <p className="truncate text-xs text-ink-subtle">{a.message}</p>
                  </div>
                  <RiskBadge level={a.severity} />
                </div>
              )
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
