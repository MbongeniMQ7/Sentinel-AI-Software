import { useMemo, useState } from 'react'
import { ArrowUpRight, CheckCircle2, ChevronDown, Clock, Inbox, LifeBuoy, Send, Search, TicketCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { KpiCard } from '@/components/shared/KpiCard'
import { useSupportTickets, useMyTickets, escalateTicket, updateTicketStatus, submitSupportTicket, type Ticket } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const priorityTone = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' } as const
const statusTone = { open: 'info', pending: 'warning', resolved: 'success', closed: 'neutral' } as const
const statusLabel = { open: 'Open', pending: 'In progress', resolved: 'Resolved', closed: 'Closed' } as const

export function ManagerSupport() {
  const { user } = useAuth()
  const [tab, setTab] = useState('team')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [busy, setBusy] = useState<string | null>(null)
  const { data: tickets, refetch } = useSupportTickets()
  const { data: myTickets, refetch: refetchMine } = useMyTickets(user?.id)
  const [openTicket, setOpenTicket] = useState<string | null>(null)

  // Report form state
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('technical')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (status === 'all' || t.status === status) &&
          (!query || t.subject.toLowerCase().includes(query.toLowerCase()) || t.number.toLowerCase().includes(query.toLowerCase()) || t.openedBy.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, status, tickets],
  )

  const escalate = async (t: Ticket) => {
    setBusy(t.id)
    try {
      await escalateTicket(t.id)
      refetch()
    } finally {
      setBusy(null)
    }
  }

  const resolve = async (t: Ticket) => {
    setBusy(t.id)
    try {
      await updateTicketStatus(t.id, 'resolved')
      refetch()
    } finally {
      setBusy(null)
    }
  }

  const submitReport = async () => {
    if (!user) return
    if (!subject.trim() || !message.trim()) {
      setFormError('Subject and message are required.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await submitSupportTicket({
        openedBy: user.id,
        companyId: user.companyId,
        subject,
        category,
        priority,
        message,
        escalated: true,
      })
      setSubject('')
      setMessage('')
      setSent(true)
      refetchMine()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const teamColumns: Column<Ticket>[] = [
    {
      key: 'subject',
      header: 'Issue',
      render: (t) => (
        <div>
          <p className="font-medium text-ink">{t.subject}</p>
          <p className="text-xs text-ink-subtle">{t.number} · {t.category}</p>
        </div>
      ),
    },
    { key: 'openedBy', header: 'Reported by', render: (t) => t.openedBy, hideOnMobile: true },
    { key: 'priority', header: 'Priority', render: (t) => <Badge tone={priorityTone[t.priority]} className="capitalize">{t.priority}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <Badge tone={statusTone[t.status]} className="capitalize">{t.status}</Badge>
          {t.escalated && <Badge tone="purple">Escalated</Badge>}
        </div>
      ),
    },
    { key: 'created', header: 'Reported', render: (t) => t.created, hideOnMobile: true },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div className="flex items-center justify-end gap-2">
          {!t.escalated && t.status !== 'resolved' && t.status !== 'closed' && (
            <Button variant="outline" size="sm" onClick={() => escalate(t)} disabled={busy === t.id}>
              <ArrowUpRight className="h-4 w-4" /> Escalate
            </Button>
          )}
          {t.status !== 'resolved' && t.status !== 'closed' && (
            <Button variant="ghost" size="sm" onClick={() => resolve(t)} disabled={busy === t.id}>
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Support"
        description="Manage your team's issues and report technical problems directly to SentinelAI."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Total tickets" value={tickets.length} icon={<LifeBuoy className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Open" value={tickets.filter((t) => t.status === 'open').length} icon={<TicketCheck className="h-5 w-5" />} tone="info" />
        <KpiCard label="Escalated to SentinelAI" value={tickets.filter((t) => t.escalated).length} icon={<ArrowUpRight className="h-5 w-5" />} tone="purple" />
        <KpiCard label="Resolved" value={tickets.filter((t) => t.status === 'resolved').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>

      <div className="mb-4">
        <Tabs
          tabs={[
            { id: 'team', label: 'Team tickets', count: tickets.length },
            { id: 'report', label: 'Report to SentinelAI' },
            { id: 'mine', label: 'My reports', count: myTickets.length },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'team' && (
        <Card>
          <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
            <Input icon={<Search className="h-4 w-4" />} placeholder="Search tickets…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:ml-auto sm:w-40">
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="pending">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
          <CardBody className="p-0">
            {filtered.length === 0 ? (
              <EmptyState icon={<Clock className="h-6 w-6" />} title="No tickets" description="Issues reported by your team will appear here." />
            ) : (
              <DataTable columns={teamColumns} data={filtered} rowKey={(t) => t.id} />
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'report' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <Card className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">Direct to SentinelAI</p>
              <p className="mt-1 text-sm text-ink-muted">Your report is sent directly to the SentinelAI platform team, bypassing the employee ticket queue. Use this for platform-level technical issues.</p>
            </Card>
            <Card className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                <Clock className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">Response times</p>
              <p className="mt-1 text-sm text-ink-muted">Urgent issues are reviewed within 1 hour. High within 4 hours. Normal within 24 hours.</p>
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader title="Report a technical issue" subtitle="Submitted directly to SentinelAI support" />
            <CardBody className="space-y-4">
              {sent ? (
                <div className="rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
                  <Badge tone="success" className="mb-2">Report sent to SentinelAI</Badge>
                  <p className="text-sm text-ink-muted">Your issue has been submitted and escalated directly to the SentinelAI platform team. Track it under <strong>My reports</strong>.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setSent(false)}>Report another issue</Button>
                </div>
              ) : (
                <>
                  {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">{formError}</p>}
                  <Field label="Subject" required>
                    <Input placeholder="Briefly describe the technical issue" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Category">
                      <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="technical">Technical issue</option>
                        <option value="device">Device & monitoring</option>
                        <option value="account">Account & access</option>
                        <option value="integration">Integration / API</option>
                        <option value="billing">Billing</option>
                        <option value="other">Other</option>
                      </Select>
                    </Field>
                    <Field label="Priority">
                      <Select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
                        <option value="low">Low</option>
                        <option value="medium">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Description" required>
                    <Textarea rows={5} placeholder="Describe the issue in detail — what happened, when, and any error messages you saw…" value={message} onChange={(e) => setMessage(e.target.value)} />
                  </Field>
                  <Button className="w-full" onClick={submitReport} disabled={submitting}>
                    <Send className="h-4 w-4" /> {submitting ? 'Sending…' : 'Send to SentinelAI'}
                  </Button>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'mine' && (
        <Card>
          <CardHeader title="My reports" subtitle="Issues you reported directly to SentinelAI" icon={<Inbox className="h-4 w-4" />} />
          <CardBody>
            {myTickets.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-ink-subtle"><Inbox className="h-6 w-6" /></span>
                <p className="text-sm font-medium text-ink">No reports yet</p>
                <p className="text-sm text-ink-muted">Issues you report to SentinelAI will appear here so you can track their progress.</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {myTickets.map((t) => (
                  <div key={t.id} className="py-3">
                    <button
                      onClick={() => setOpenTicket(openTicket === t.id ? null : t.id)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-ink">{t.subject}</span>
                          {t.escalated && <Badge tone="purple">SentinelAI</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-ink-subtle">{t.number} · {t.created}</p>
                      </div>
                      <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
                      <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-subtle transition-transform', openTicket === t.id && 'rotate-180')} />
                    </button>
                    {openTicket === t.id && (
                      <div className="mt-3 space-y-3 rounded-xl bg-surface-subtle p-3">
                        {t.replies.length === 0 ? (
                          <p className="text-sm text-ink-muted">No messages yet. SentinelAI will respond here.</p>
                        ) : (
                          t.replies.map((r) => (
                            <div key={r.id} className={cn('flex flex-col', r.mine ? 'items-end' : 'items-start')}>
                              <div className={cn('max-w-[85%] rounded-xl px-3 py-2 text-sm', r.mine ? 'bg-brand-600 text-white' : 'bg-surface text-ink ring-1 ring-line')}>
                                {r.body}
                              </div>
                              <span className="mt-1 text-[11px] text-ink-subtle">{r.author} · {r.created}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}


const priorityTone = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' } as const
const statusTone = { open: 'info', pending: 'warning', resolved: 'success', closed: 'neutral' } as const

export function ManagerSupport() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [busy, setBusy] = useState<string | null>(null)
  const { data: tickets, refetch } = useSupportTickets()

  const filtered = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (status === 'all' || t.status === status) &&
          (!query || t.subject.toLowerCase().includes(query.toLowerCase()) || t.number.toLowerCase().includes(query.toLowerCase()) || t.openedBy.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, status, tickets],
  )

  const escalate = async (t: Ticket) => {
    setBusy(t.id)
    try {
      await escalateTicket(t.id)
      refetch()
    } finally {
      setBusy(null)
    }
  }

  const resolve = async (t: Ticket) => {
    setBusy(t.id)
    try {
      await updateTicketStatus(t.id, 'resolved')
      refetch()
    } finally {
      setBusy(null)
    }
  }

  const columns: Column<Ticket>[] = [
    {
      key: 'subject',
      header: 'Issue',
      render: (t) => (
        <div>
          <p className="font-medium text-ink">{t.subject}</p>
          <p className="text-xs text-ink-subtle">{t.number} · {t.category}</p>
        </div>
      ),
    },
    { key: 'openedBy', header: 'Reported by', render: (t) => t.openedBy, hideOnMobile: true },
    { key: 'priority', header: 'Priority', render: (t) => <Badge tone={priorityTone[t.priority]} className="capitalize">{t.priority}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <Badge tone={statusTone[t.status]} className="capitalize">{t.status}</Badge>
          {t.escalated && <Badge tone="purple">Escalated</Badge>}
        </div>
      ),
    },
    { key: 'created', header: 'Reported', render: (t) => t.created, hideOnMobile: true },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div className="flex items-center justify-end gap-2">
          {!t.escalated && t.status !== 'resolved' && t.status !== 'closed' && (
            <Button variant="outline" size="sm" onClick={() => escalate(t)} disabled={busy === t.id}>
              <ArrowUpRight className="h-4 w-4" /> Escalate
            </Button>
          )}
          {t.status !== 'resolved' && t.status !== 'closed' && (
            <Button variant="ghost" size="sm" onClick={() => resolve(t)} disabled={busy === t.id}>
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Support Tickets" description="Issues reported by your team. Escalate technical problems to SentinelAI." />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Total" value={tickets.length} icon={<LifeBuoy className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Open" value={tickets.filter((t) => t.status === 'open').length} icon={<TicketCheck className="h-5 w-5" />} tone="info" />
        <KpiCard label="Escalated" value={tickets.filter((t) => t.escalated).length} icon={<ArrowUpRight className="h-5 w-5" />} tone="purple" />
        <KpiCard label="Resolved" value={tickets.filter((t) => t.status === 'resolved').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search tickets…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:ml-auto sm:w-40">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="pending">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<Clock className="h-6 w-6" />} title="No tickets" description="Issues reported by your team will appear here." />
          ) : (
            <DataTable columns={columns} data={filtered} rowKey={(t) => t.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
