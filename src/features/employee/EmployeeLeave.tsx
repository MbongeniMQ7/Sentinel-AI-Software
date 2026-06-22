import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/shared/Badges'
import { KpiCard } from '@/components/shared/KpiCard'
import { useLeaveRequests, submitLeaveRequest, type LeaveRequest } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const columns: Column<LeaveRequest>[] = [
  { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-xs text-ink-muted">{r.id}</span> },
  { key: 'type', header: 'Type', render: (r) => <Badge tone="info">{r.type}</Badge> },
  { key: 'from', header: 'From', render: (r) => r.from, hideOnMobile: true },
  { key: 'to', header: 'To', render: (r) => r.to, hideOnMobile: true },
  { key: 'days', header: 'Days', render: (r) => `${r.days}d` },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const leaveDays = new Set([8, 9, 10, 18, 22, 23])

export function EmployeeLeave() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { data: leaveRequests, refetch } = useLeaveRequests()
  const [type, setType] = useState('Annual')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cells = Array.from({ length: 35 }, (_, i) => i - 2) // offset start

  const reset = () => {
    setType('Annual')
    setFrom('')
    setTo('')
    setReason('')
    setError(null)
  }

  const submit = async () => {
    if (!user?.companyId) {
      setError('Your account is not linked to a company.')
      return
    }
    if (!from || !to) {
      setError('Please choose both start and end dates.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await submitLeaveRequest({
        employeeId: user.id,
        companyId: user.companyId,
        type,
        startDate: from,
        endDate: to,
        reason,
      })
      setOpen(false)
      reset()
      refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Leave Management"
        description="Plan time off and track approval status."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Request leave
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Annual balance" value="14d" icon={<CalendarDays className="h-5 w-5" />} tone="brand" hint="of 21 days" />
        <KpiCard label="Sick leave" value="7d" icon={<CalendarDays className="h-5 w-5" />} tone="info" hint="remaining" />
        <KpiCard label="Pending" value={leaveRequests.filter((l) => l.status === 'pending').length} icon={<CalendarDays className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Approved YTD" value="6" icon={<CalendarDays className="h-5 w-5" />} tone="success" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader
            title="July 2026"
            action={
              <div className="flex gap-1">
                <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            }
          />
          <CardBody>
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS.map((d) => (
                <div key={d} className="py-1 text-xs font-medium text-ink-subtle">{d}</div>
              ))}
              {cells.map((day, i) => {
                const valid = day >= 1 && day <= 31
                const isLeave = valid && leaveDays.has(day)
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-lg text-sm',
                      !valid && 'text-transparent',
                      isLeave ? 'bg-brand-600 font-semibold text-white' : valid && 'text-ink hover:bg-surface-muted',
                    )}
                  >
                    {valid ? day : '0'}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Leave</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-surface-muted ring-1 ring-line" /> Available</span>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Leave requests" subtitle="Your time-off history and status" />
          <CardBody className="p-0">
            <DataTable columns={columns} data={leaveRequests} rowKey={(r) => r.id} />
          </CardBody>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request leave"
        description="Submit a new time-off request for approval."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit request'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">{error}</p>}
          <Field label="Leave type" required>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option>Annual</option>
              <option>Sick</option>
              <option>Personal</option>
              <option>Emergency</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From" required>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To" required>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
          <Field label="Reason">
            <Textarea rows={3} placeholder="Briefly describe your reason…" value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
