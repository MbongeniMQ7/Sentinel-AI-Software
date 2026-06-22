import { PageHeader } from '@/components/shared/PageHeader'
import { ReportsBuilder } from '@/components/shared/ReportsBuilder'
import { TrendArea } from '@/components/shared/Charts'
import { useRevenueTrend } from '@/lib/api'
import { formatCompact } from '@/lib/utils'

export function OwnerReports() {
  const { data: revenueTrend } = useRevenueTrend()
  const latest = revenueTrend[revenueTrend.length - 1]
  const mrr = latest?.mrr ?? 0
  const arr = latest?.arr ?? 0
  return (
    <div>
      <PageHeader title="Reports" description="Generate platform, compliance and revenue reports." />
      <ReportsBuilder
        templates={[
          { id: 'revenue', title: 'Revenue Report', desc: 'MRR, ARR, expansion and churn breakdown.' },
          { id: 'compliance', title: 'Compliance Report', desc: 'Platform-wide safety and audit summary.' },
          { id: 'usage', title: 'Platform Usage Report', desc: 'Sessions, active users and device utilization.' },
          { id: 'company', title: 'Company Performance', desc: 'Per-company adoption and health scores.' },
        ]}
        previewTitle="Revenue Report"
        previewSubtitle="All companies · FY 2026"
        kpis={[
          { label: 'MRR', value: `R${formatCompact(mrr)}` },
          { label: 'ARR', value: `R${formatCompact(arr)}` },
          { label: 'NRR', value: '—' },
          { label: 'Churn', value: '—' },
        ]}
        chart={
          <>
            <p className="mb-2 text-sm font-semibold text-ink">MRR growth</p>
            <TrendArea data={revenueTrend} xKey="month" series={[{ key: 'mrr', label: 'MRR', color: '#10b981' }]} height={200} />
          </>
        }
      />
    </div>
  )
}
