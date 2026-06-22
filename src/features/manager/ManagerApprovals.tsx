import { useState } from 'react'
import { CalendarDays, Check, Coffee, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/Badges'
import { KpiCard } from '@/components/shared/KpiCard'
import { useLeaveRequests, useBreakRequests, useEmployees, reviewLeaveRequest, reviewBreakRequest } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export function ManagerApprovals() {
  const [tab, setTab] = useState('leave')
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'rejected'>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const { user } = useAuth()
  const { data: leaveRequests, refetch: refetchLeave } = useLeaveRequests()
  const { data: breakRequests, refetch: refetchBreaks } = useBreakRequests()
  const { data: employees } = useEmployees()

  const photoByName = new Map(employees.map((e) => [e.name, e.avatarUrl]))

  const decideLeave = async (id: string, d: 'approved' | 'rejected') => {
    if (!user) return
    setBusy(id)
    try {
      await reviewLeaveRequest(id, d, user.id)
      setDecisions((p) => ({ ...p, [id]: d }))
      refetchLeave()
    } finally {
      setBusy(null)
    }
  }

  const decideBreak = async (id: string, d: 'approved' | 'rejected') => {
    if (!user) return
    setBusy(id)
    try {
      await reviewBreakRequest(id, d, user.id)
      setDecisions((p) => ({ ...p, [id]: d }))
      refetchBreaks()
    } finally {
      setBusy(null)
    }
  }

  const pendingLeave = leaveRequests.filter((l) => l.status === 'pending')
  const pendingBreaks = breakRequests.filter((b) => b.status === 'pending')

  return (
    <div>
      <PageHeader title="Leave & Break Approvals" description="Review and action your team's time-off and break requests." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Pending leave" value={pendingLeave.length} icon={<CalendarDays className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Pending breaks" value={pendingBreaks.length} icon={<Coffee className="h-5 w-5" />} tone="info" />
        <KpiCard label="Actioned today" value={Object.keys(decisions).length} icon={<Check className="h-5 w-5" />} tone="success" />
      </div>

      <Card>
        <div className="px-4 pt-3">
          <Tabs tabs={[{ id: 'leave', label: 'Leave requests', count: pendingLeave.length }, { id: 'breaks', label: 'Break requests', count: pendingBreaks.length }]} active={tab} onChange={setTab} />
        </div>
        <CardBody className="space-y-3">
          {tab === 'leave' &&
            (pendingLeave.length === 0 ? (
              <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No pending leave" description="You're all caught up." />
            ) : (
              pendingLeave.map((l) => {
                const decision = decisions[l.id]
                return (
                  <div key={l.id} className="flex flex-col gap-4 rounded-xl border border-line p-4 sm:flex-row sm:items-center">
                    <Avatar name={l.employee} src={photoByName.get(l.employee)} status="online" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{l.employee}</p>
                        <Badge tone="info">{l.type}</Badge>
                        <Badge tone="neutral">{l.days}d</Badge>
                      </div>
                      <p className="text-sm text-ink-muted">{l.from} → {l.to} · {l.reason}</p>
                    </div>
                    {decision ? (
                      <StatusBadge status={decision} />
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={busy === l.id} onClick={() => decideLeave(l.id, 'rejected')}><X className="h-4 w-4" /> Reject</Button>
                        <Button size="sm" disabled={busy === l.id} onClick={() => decideLeave(l.id, 'approved')}><Check className="h-4 w-4" /> Approve</Button>
                      </div>
                    )}
                  </div>
                )
              })
            ))}

          {tab === 'breaks' &&
            (pendingBreaks.length === 0 ? (
              <EmptyState icon={<Coffee className="h-6 w-6" />} title="No pending breaks" description="No break requests awaiting review." />
            ) : (
              pendingBreaks.map((b) => {
                const decision = decisions[b.id]
                return (
                  <div key={b.id} className="flex flex-col gap-4 rounded-xl border border-line p-4 sm:flex-row sm:items-center">
                    <Avatar name={b.employee} src={photoByName.get(b.employee)} status="away" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{b.employee}</p>
                        <Badge tone="warning">{b.duration} min</Badge>
                      </div>
                      <p className="text-sm text-ink-muted">{b.reason} · requested {b.requestedAt}</p>
                    </div>
                    {decision ? (
                      <StatusBadge status={decision} />
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={busy === b.id} onClick={() => decideBreak(b.id, 'rejected')}><X className="h-4 w-4" /> Reject</Button>
                        <Button size="sm" disabled={busy === b.id} onClick={() => decideBreak(b.id, 'approved')}><Check className="h-4 w-4" /> Approve</Button>
                      </div>
                    )}
                  </div>
                )
              })
            ))}
        </CardBody>
      </Card>
    </div>
  )
}
