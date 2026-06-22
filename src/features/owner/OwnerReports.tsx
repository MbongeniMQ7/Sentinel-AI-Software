import { PageHeader } from '@/components/shared/PageHeader'
import { ReportsBuilder } from '@/components/shared/ReportsBuilder'
import { TrendArea } from '@/components/shared/Charts'
import { useRevenueTrend } from '@/lib/api'

export function OwnerReports() {
  const { data: revenueTrend } = useRevenueTrend()
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
          { label: 'MRR', value: '$246K' },
          { label: 'ARR', value: '$2.95M' },
          { label: 'NRR', value: '112%' },
          { label: 'Churn', value: '1.8%' },
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
