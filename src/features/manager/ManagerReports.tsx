import { PageHeader } from '@/components/shared/PageHeader'
import { ReportsBuilder } from '@/components/shared/ReportsBuilder'
import { BarSeries } from '@/components/shared/Charts'
import { useDepartmentFatigue, useEmployees, useAlerts } from '@/lib/api'

export function ManagerReports() {
  const { data: departmentFatigue } = useDepartmentFatigue()
  const { data: employees } = useEmployees()
  const { data: alerts } = useAlerts()

  const totalEmployees = employees.length
  const totalAlerts = alerts.length
  const totalEmployeesInFatigue = departmentFatigue.reduce((s, d) => s + d.employees, 0)
  const orgAvgFatigue = totalEmployeesInFatigue
    ? Math.round(departmentFatigue.reduce((s, d) => s + d.avgFatigue * d.employees, 0) / totalEmployeesInFatigue)
    : null

  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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
        previewSubtitle={monthLabel}
        kpis={[
          { label: 'Team size', value: String(totalEmployees) },
          { label: 'Avg fatigue', value: orgAvgFatigue !== null ? String(orgAvgFatigue) : '—' },
          { label: 'Alerts', value: String(totalAlerts) },
          { label: 'Departments', value: String(departmentFatigue.length) },
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

