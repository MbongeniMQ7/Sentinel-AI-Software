import { DollarSign, TrendingUp, Activity, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { KpiCard } from '@/components/shared/KpiCard'
import { TrendArea } from '@/components/shared/Charts'
import { EmptyState } from '@/components/shared/States'
import { useRevenueTrend } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export function OwnerRevenue() {
  const { data: revenueTrend } = useRevenueTrend()
  const latest = revenueTrend[revenueTrend.length - 1] ?? { month: '', mrr: 0, arr: 0 }
  const tracked = revenueTrend.filter((r) => r.mrr > 0)
  const firstMrr = tracked[0]?.mrr ?? 0
  const growth = firstMrr ? Math.round(((latest.mrr - firstMrr) / firstMrr) * 100) : 0

  return (
    <div>
      <PageHeader
        title="Revenue"
        description="MRR, ARR, expansion and churn analysis."
        actions={<Select defaultValue="12m" className="w-40"><option value="6m">Last 6 months</option><option value="12m">Last 12 months</option><option value="ytd">Year to date</option></Select>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="MRR" value={formatCurrency(latest.mrr)} icon={<DollarSign className="h-5 w-5" />} tone="success" delta={growth || undefined} />
        <KpiCard label="ARR" value={formatCurrency(latest.arr)} icon={<TrendingUp className="h-5 w-5" />} tone="brand" />
        <KpiCard label="MRR growth" value={`${growth}%`} icon={<Activity className="h-5 w-5" />} tone="purple" hint="since first tracked month" />
        <KpiCard label="Months tracked" value={tracked.length} icon={<Calendar className="h-5 w-5" />} tone="info" />
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
          <CardBody>
            <EmptyState title="No breakdown yet" description="Revenue by product line appears here once billing categories are configured." />
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="MRR movement" subtitle="New, expansion & churned revenue" />
          <CardBody>
            <EmptyState title="No movement data yet" description="New, expansion and churned revenue breakdowns appear here as subscriptions change." />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Churn & retention" subtitle="Monthly churn vs retention" />
          <CardBody>
            <EmptyState title="No churn data yet" description="Churn and retention trends appear here once you have at least two billing periods." />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
