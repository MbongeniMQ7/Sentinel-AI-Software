import { PageHeader } from '@/components/shared/PageHeader'
import { ReportsBuilder } from '@/components/shared/ReportsBuilder'
import { BarSeries } from '@/components/shared/Charts'
import { useAlerts, useDepartmentFatigue, useEmployees } from '@/lib/api'

export function ManagerReports() {
  const { data: departmentFatigue } = useDepartmentFatigue()
  const { data: employees } = useEmployees()
  const { data: alerts } = useAlerts()
  const avgFatigue = employees.length
    ? Math.round(employees.reduce((s, e) => s + e.fatigue, 0) / employees.length)
    : 0
  return (
    <div>
      <PageHeader title="Reports" description="Generate team performance and compliance reports." />
      <ReportsBuilder
        templates={[
          { id: 'team', title: 'Team Wellness Report', desc: 'Fatigue, alerts and breaks per team member.' },
          { id: 'compliance', title: 'Safety Compliance Report', desc: 'PPE, break adherence and incident summary.' },
          { id: 'shift', title: 'Shift Performance Report', desc: 'Cross-shift fatigue and productivity comparison.' },
          { id: 'incident', title: 'Incident Report', desc: 'Detailed log of escalated and critical alerts.' },
        ]}
        previewTitle="Team Wellness Report"
        previewSubtitle="Operations · Jun 1–30, 2026"
        kpis={[
          { label: 'Team size', value: String(employees.length) },
          { label: 'Avg fatigue', value: String(avgFatigue) },
          { label: 'Alerts', value: String(alerts.length) },
        ]}
        chart={
          <>
            <p className="mb-2 text-sm font-semibold text-ink">Fatigue by department</p>
            <BarSeries data={departmentFatigue} xKey="department" series={[{ key: 'avgFatigue', label: 'Avg fatigue', color: '#567c8d' }]} height={200} />
          </>
        }
      />
    </div>
  )
}
