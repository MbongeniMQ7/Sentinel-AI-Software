import { ArrowDownRight, DollarSign, TrendingUp, Users, Percent } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/shared/KpiCard'
import { TrendArea, TrendLine, BarSeries } from '@/components/shared/Charts'
import { useRevenueTrend } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const churnData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({ month: m, churn: 2.8 - i * 0.18 + Math.random() * 0.3, retention: 96 + i * 0.4 }))
const mrrMovement = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({ month: m, new: 14 + i * 2, expansion: 6 + i, churned: -(3 + (i % 3)) }))

export function OwnerRevenue() {
  const { data: revenueTrend } = useRevenueTrend()
  const latest = revenueTrend[revenueTrend.length - 1] ?? { month: '', mrr: 0, arr: 0 }

  return (
    <div>
      <PageHeader
        title="Revenue"
        description="MRR, ARR, expansion and churn analysis."
        actions={<Select defaultValue="12m" className="w-40"><option value="6m">Last 6 months</option><option value="12m">Last 12 months</option><option value="ytd">Year to date</option></Select>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="MRR" value={formatCurrency(latest.mrr)} icon={<DollarSign className="h-5 w-5" />} tone="success" delta={12} />
        <KpiCard label="ARR" value={formatCurrency(latest.arr)} icon={<TrendingUp className="h-5 w-5" />} tone="brand" delta={14} />
        <KpiCard label="Net revenue retention" value="112%" icon={<Percent className="h-5 w-5" />} tone="purple" delta={3} />
        <KpiCard label="Churn rate" value="1.8%" icon={<ArrowDownRight className="h-5 w-5" />} tone="danger" delta={-0.4} invertDelta />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="MRR & ARR growth" subtitle="Trailing 12 months" icon={<TrendingUp className="h-4 w-4" />} />
          <CardBody>
            <TrendArea data={revenueTrend} xKey="month" series={[{ key: 'mrr', label: 'MRR', color: '#10b981' }]} height={280} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Revenue breakdown" />
          <CardBody className="space-y-4">
            {[
              { l: 'Subscriptions', v: 86, tone: 'bg-emerald-500' },
              { l: 'Device leasing', v: 9, tone: 'bg-brand-500' },
              { l: 'Professional services', v: 3, tone: 'bg-violet-500' },
              { l: 'Add-ons', v: 2, tone: 'bg-amber-500' },
            ].map((r) => (
              <div key={r.l}>
                <div className="mb-1 flex justify-between text-sm"><span className="text-ink-muted">{r.l}</span><span className="font-medium text-ink">{r.v}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className={`h-full rounded-full ${r.tone}`} style={{ width: `${r.v}%` }} /></div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="MRR movement" subtitle="New, expansion & churned revenue ($K)" />
          <CardBody>
            <BarSeries data={mrrMovement} xKey="month" series={[{ key: 'new', label: 'New', color: '#10b981' }, { key: 'expansion', label: 'Expansion', color: '#3563ff' }, { key: 'churned', label: 'Churned', color: '#f43f5e' }]} height={260} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Churn & retention" subtitle="Monthly churn vs retention %" />
          <CardBody>
            <TrendLine data={churnData} xKey="month" series={[{ key: 'churn', label: 'Churn %', color: '#f43f5e' }, { key: 'retention', label: 'Retention %', color: '#10b981' }]} height={260} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5 border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20">
        <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white"><Users className="h-5 w-5" /></span>
          <div className="flex-1">
            <div className="flex items-center gap-2"><p className="text-sm font-semibold text-ink">Healthy growth trajectory</p><Badge tone="success">+14% YoY</Badge></div>
            <p className="text-sm text-ink-muted">Net revenue retention above 110% indicates strong expansion. Churn is trending down for the 4th consecutive month.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
