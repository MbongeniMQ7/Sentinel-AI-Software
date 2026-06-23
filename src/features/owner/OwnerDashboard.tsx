import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Cpu, DollarSign, TrendingUp, Users, Activity } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/shared/KpiCard'
import { TrendArea, Donut, BarSeries } from '@/components/shared/Charts'
import { StatusBadge } from '@/components/shared/Badges'
import { useCompanies, useRevenueTrend, useWeeklyAlerts } from '@/lib/api'
import { formatCompact, formatCurrency } from '@/lib/utils'

export function OwnerDashboard() {
  const { data: companies } = useCompanies()
  const { data: revenueTrend } = useRevenueTrend()
  const { data: weeklyAlerts } = useWeeklyAlerts()
  const totalMrr = companies.reduce((s, c) => s + c.mrr, 0)
  const totalUsers = companies.reduce((s, c) => s + c.activeUsers, 0)
  const totalDevices = companies.reduce((s, c) => s + c.devices, 0)

  const planDist = [
    { name: 'Starter', value: companies.filter((c) => c.plan === 'Starter').length, color: '#06b6d4' },
    { name: 'Growth', value: companies.filter((c) => c.plan === 'Growth').length, color: '#567c8d' },
    { name: 'Enterprise', value: companies.filter((c) => c.plan === 'Enterprise').length, color: '#8b5cf6' },
  ]

  return (
    <div>
      <PageHeader
        title="Platform Overview"
        description="Company-wide performance across the SentinelAI platform."
        actions={
          <>
            <Badge tone="success" dot>All systems operational</Badge>
            <Link to="/owner/reports"><Button size="sm">Generate report</Button></Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="MRR" value={formatCurrency(totalMrr)} icon={<DollarSign className="h-5 w-5" />} tone="success" hint="Recurring revenue" />
        <KpiCard label="Active companies" value={companies.filter((c) => c.status === 'active').length} icon={<Building2 className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Total users" value={formatCompact(totalUsers)} icon={<Users className="h-5 w-5" />} tone="info" />
        <KpiCard label="Devices deployed" value={formatCompact(totalDevices)} icon={<Cpu className="h-5 w-5" />} tone="purple" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue growth" subtitle="MRR over the trailing 12 months" icon={<TrendingUp className="h-4 w-4" />} />
          <CardBody>
            <TrendArea data={revenueTrend} xKey="month" series={[{ key: 'mrr', label: 'MRR', color: '#10b981' }]} height={260} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Plan distribution" />
          <CardBody>
            <Donut data={planDist} />
            <div className="mt-3 space-y-2">
              {planDist.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-ink-muted">{p.name}</span>
                  <span className="ml-auto font-medium text-ink">{p.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Top companies by revenue" action={<Link to="/owner/companies" className="text-xs font-medium text-brand-600 hover:underline">All <ArrowRight className="inline h-3 w-3" /></Link>} />
          <CardBody className="space-y-2 p-3">
            {[...companies].sort((a, b) => b.mrr - a.mrr).slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-muted">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40"><Building2 className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{c.name}</p><p className="text-xs text-ink-subtle">{c.plan} · {c.activeUsers} users</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-ink">{formatCurrency(c.mrr)}</p><StatusBadge status={c.status} /></div>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Weekly alerts" subtitle="Safety events this week" icon={<Activity className="h-4 w-4" />} />
          <CardBody>
            <BarSeries
              data={weeklyAlerts}
              xKey="day"
              series={[
                { key: 'fatigue', label: 'Fatigue', color: '#f59e0b' },
                { key: 'drowsiness', label: 'Drowsiness', color: '#f43f5e' },
                { key: 'distraction', label: 'Distraction', color: '#567c8d' },
              ]}
              height={220}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
