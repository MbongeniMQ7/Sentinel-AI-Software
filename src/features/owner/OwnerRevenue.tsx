import { ArrowDownRight, DollarSign, TrendingUp, Users, Percent } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { KpiCard } from '@/components/shared/KpiCard'
import { TrendArea, BarSeries } from '@/components/shared/Charts'
import { useRevenueTrend, useCompanies } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export function OwnerRevenue() {
  const { data: revenueTrend } = useRevenueTrend()
  const { data: companies } = useCompanies()

  const latest = revenueTrend[revenueTrend.length - 1] ?? { month: '', mrr: 0, arr: 0 }
  const prev = revenueTrend[revenueTrend.length - 2] ?? { mrr: 0, arr: 0 }

  const mrrGrowthPct = prev.mrr ? Math.round(((latest.mrr - prev.mrr) / prev.mrr) * 100) : null
  const arrGrowthPct = prev.arr ? Math.round(((latest.arr - prev.arr) / prev.arr) * 100) : null

  const totalMrr = companies.reduce((s, c) => s + c.mrr, 0)
  const activeCompanies = companies.filter((c) => c.status === 'active' || c.status === 'trial')
  const churnedCompanies = companies.filter((c) => c.status === 'churned')
  const churnRate = activeCompanies.length + churnedCompanies.length
    ? Math.round((churnedCompanies.length / (activeCompanies.length + churnedCompanies.length)) * 1000) / 10
    : 0

  // MRR movement derived from consecutive months
  const mrrMovement = revenueTrend.slice(-6).map((pt, i, arr) => {
    const prevMrr = i > 0 ? arr[i - 1].mrr : pt.mrr
    const delta = pt.mrr - prevMrr
    return {
      month: pt.month,
      new: Math.max(0, delta),
      expansion: 0,
      churned: Math.min(0, delta),
    }
  })

  return (
    <div>
      <PageHeader
        title="Revenue"
        description="MRR, ARR, expansion and churn analysis."
        actions={<Select defaultValue="12m" className="w-40"><option value="6m">Last 6 months</option><option value="12m">Last 12 months</option><option value="ytd">Year to date</option></Select>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="MRR" value={formatCurrency(latest.mrr)} icon={<DollarSign className="h-5 w-5" />} tone="success" delta={mrrGrowthPct ?? undefined} />
        <KpiCard label="ARR" value={formatCurrency(latest.arr)} icon={<TrendingUp className="h-5 w-5" />} tone="brand" delta={arrGrowthPct ?? undefined} />
        <KpiCard label="Total MRR (all companies)" value={formatCurrency(totalMrr)} icon={<Percent className="h-5 w-5" />} tone="purple" />
        <KpiCard label="Churn rate" value={`${churnRate}%`} icon={<ArrowDownRight className="h-5 w-5" />} tone="danger" invertDelta />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="MRR & ARR growth" subtitle="Trailing 12 months" icon={<TrendingUp className="h-4 w-4" />} />
          <CardBody>
            <TrendArea data={revenueTrend} xKey="month" series={[{ key: 'mrr', label: 'MRR', color: '#10b981' }]} height={280} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="MRR by plan" subtitle="Distribution across subscription tiers" />
          <CardBody className="space-y-4">
            {(['Enterprise', 'Growth', 'Starter'] as const).map((plan) => {
              const planMrr = companies.filter((c) => c.plan === plan).reduce((s, c) => s + c.mrr, 0)
              const pct = totalMrr ? Math.round((planMrr / totalMrr) * 100) : 0
              const toneMap = { Enterprise: 'bg-emerald-500', Growth: 'bg-brand-500', Starter: 'bg-violet-500' } as const
              return (
                <div key={plan}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-ink-muted">{plan}</span><span className="font-medium text-ink">{pct}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className={`h-full rounded-full ${toneMap[plan]}`} style={{ width: `${pct}%` }} /></div>
                </div>
              )
            })}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="MRR movement" subtitle="Month-over-month change ($)" />
          <CardBody>
            <BarSeries data={mrrMovement} xKey="month" series={[{ key: 'new', label: 'Growth', color: '#10b981' }, { key: 'churned', label: 'Decline', color: '#f43f5e' }]} height={260} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Company status" subtitle="Active vs churned companies" />
          <CardBody className="space-y-4">
            {[
              { l: 'Active', v: companies.filter((c) => c.status === 'active').length, tone: 'bg-emerald-500' },
              { l: 'Trial', v: companies.filter((c) => c.status === 'trial').length, tone: 'bg-brand-500' },
              { l: 'Past due', v: companies.filter((c) => c.status === 'past-due').length, tone: 'bg-amber-500' },
              { l: 'Churned', v: companies.filter((c) => c.status === 'churned').length, tone: 'bg-rose-500' },
            ].map((r) => (
              <div key={r.l}>
                <div className="mb-1 flex justify-between text-sm"><span className="text-ink-muted">{r.l}</span><span className="font-medium text-ink">{r.v}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div className={`h-full rounded-full ${r.tone}`} style={{ width: companies.length ? `${(r.v / companies.length) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {mrrGrowthPct !== null && mrrGrowthPct > 0 && (
        <Card className="mt-5 border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white"><Users className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Positive MRR growth this month</p>
              <p className="text-sm text-ink-muted">MRR grew {mrrGrowthPct}% month-over-month from {formatCurrency(prev.mrr)} to {formatCurrency(latest.mrr)}.</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
