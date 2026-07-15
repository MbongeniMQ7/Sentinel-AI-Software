import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, Clock, LifeBuoy, MessageSquare, Search, Send, TicketCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { KpiCard } from '@/components/shared/KpiCard'
import { useSupportTickets, updateTicketStatus, replyToTicket, type Ticket } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const priorityTone = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' } as const
const statusTone = { open: 'info', pending: 'warning', resolved: 'success', closed: 'neutral' } as const
const statusLabel = { open: 'Open', pending: 'In progress', resolved: 'Resolved', closed: 'Closed' } as const

export function OwnerIssues() {
  const { user } = useAuth()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [sendingReply, setSendingReply] = useState<string | null>(null)
  const { data: allTickets, refetch } = useSupportTickets()

  const escalated = useMemo(() => allTickets.filter((t) => t.escalated), [allTickets])
  const nonEscalated = useMemo(() => allTickets.filter((t) => !t.escalated), [allTickets])
  const source = tab === 'escalated' ? escalated : tab === 'team' ? nonEscalated : allTickets

  const filtered = useMemo(
    () =>
      source.filter(
        (t) =>
          (statusFilter === 'all' || t.status === statusFilter) &&
          (priorityFilter === 'all' || t.priority === priorityFilter) &&
          (!query ||
            t.subject.toLowerCase().includes(query.toLowerCase()) ||
            t.number.toLowerCase().includes(query.toLowerCase()) ||
            t.company.toLowerCase().includes(query.toLowerCase()) ||
            t.openedBy.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, statusFilter, priorityFilter, source],
  )

  const changeStatus = async (t: Ticket, status: Ticket['status']) => {
    setBusy(t.id)
    try {
      await updateTicketStatus(t.id, status)
      refetch()
    } finally {
      setBusy(null)
    }
  }

  const sendReply = async (t: Ticket) => {
    const body = (replyText[t.id] ?? '').trim()
    if (!body || !user) return
    setSendingReply(t.id)
    try {
      await replyToTicket(t.id, user.id, body)
      setReplyText((prev) => ({ ...prev, [t.id]: '' }))
      refetch()
    } finally {
      setSendingReply(null)
    }
  }

  const columns: Column<Ticket>[] = [
    {
      key: 'subject',
      header: 'Issue',
      render: (t) => (
        <div>
          <p className="font-medium text-ink">{t.subject}</p>
          <p className="text-xs text-ink-subtle">{t.number} · {t.company}</p>
        </div>
      ),
    },
    { key: 'openedBy', header: 'Reported by', render: (t) => t.openedBy, hideOnMobile: true },
    { key: 'category', header: 'Category', render: (t) => <span className="capitalize text-sm">{t.category}</span>, hideOnMobile: true },
    { key: 'priority', header: 'Priority', render: (t) => <Badge tone={priorityTone[t.priority]} className="capitalize">{t.priority}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
          {t.escalated && <Badge tone="purple">Escalated</Badge>}
        </div>
      ),
    },
    { key: 'created', header: 'Reported', render: (t) => t.created, hideOnMobile: true },
    {
      key: 'expand',
      header: '',
      render: (t) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(expanded === t.id ? null : t.id)}
        >
          <MessageSquare className="h-4 w-4" />
          {t.replies.length > 0 && <span className="ml-1 text-xs">{t.replies.length}</span>}
          <ChevronDown className={cn('ml-1 h-3 w-3 transition-transform', expanded === t.id && 'rotate-180')} />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Issues"
        description="All support tickets submitted across the platform. Reply, escalate and resolve issues here."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Total tickets" value={allTickets.length} icon={<LifeBuoy className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Open" value={allTickets.filter((t) => t.status === 'open').length} icon={<TicketCheck className="h-5 w-5" />} tone="info" />
        <KpiCard label="Escalated to SentinelAI" value={escalated.length} icon={<MessageSquare className="h-5 w-5" />} tone="purple" />
        <KpiCard label="Resolved" value={allTickets.filter((t) => t.status === 'resolved').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>

      <div className="mb-4">
        <Tabs
          tabs={[
            { id: 'all', label: 'All tickets', count: allTickets.length },
            { id: 'escalated', label: 'Escalated to SentinelAI', count: escalated.length },
            { id: 'team', label: 'Team tickets', count: nonEscalated.length },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search by subject, ticket #, company or reporter…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="pending">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-36">
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<LifeBuoy className="h-6 w-6" />} title="No tickets found" description="No tickets match your current filters." />
          ) : (
            <div className="divide-y divide-line">
              {filtered.map((t) => (
                <div key={t.id}>
                  {/* Row rendered manually to support inline expansion */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] items-center gap-4 px-4 py-3">
                    <div>
                      <p className="font-medium text-sm text-ink">{t.subject}</p>
                      <p className="text-xs text-ink-subtle">{t.number} · {t.company} · {t.openedBy}</p>
                    </div>
                    <span className="hidden capitalize text-sm text-ink-muted md:block">{t.category}</span>
                    <Badge tone={priorityTone[t.priority]} className="capitalize">{t.priority}</Badge>
                    <div className="flex items-center gap-1.5">
                      <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
                      {t.escalated && <Badge tone="purple" className="hidden md:inline-flex">Escalated</Badge>}
                    </div>
                    <span className="hidden text-xs text-ink-subtle md:block">{t.created}</span>
                    <div className="flex items-center gap-1">
                      {t.status !== 'resolved' && t.status !== 'closed' && (
                        <Button variant="outline" size="sm" onClick={() => changeStatus(t, 'resolved')} disabled={busy === t.id}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                        </Button>
                      )}
                      {t.status === 'open' && (
                        <Button variant="ghost" size="sm" onClick={() => changeStatus(t, 'pending')} disabled={busy === t.id}>
                          <Clock className="h-3.5 w-3.5" /> In progress
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t.replies.length > 0 && <span className="ml-1 text-xs">{t.replies.length}</span>}
                      <ChevronDown className={cn('ml-1 h-3 w-3 transition-transform', expanded === t.id && 'rotate-180')} />
                    </Button>
                  </div>

                  {expanded === t.id && (
                    <div className="border-t border-line bg-surface-subtle px-4 py-4 space-y-4">
                      {/* Message thread */}
                      <div className="space-y-3">
                        {t.replies.length === 0 ? (
                          <p className="text-sm text-ink-muted">No messages yet.</p>
                        ) : (
                          t.replies.map((r) => (
                            <div key={r.id} className={cn('flex flex-col', r.author === (user?.name ?? '') ? 'items-end' : 'items-start')}>
                              <div className={cn('max-w-[80%] rounded-xl px-3 py-2 text-sm', r.author === (user?.name ?? '') ? 'bg-brand-600 text-white' : 'bg-surface text-ink ring-1 ring-line')}>
                                {r.body}
                              </div>
                              <span className="mt-1 text-[11px] text-ink-subtle">{r.author} · {r.created}</span>
                            </div>
                          ))
                        )}
                      </div>
                      {/* Reply box */}
                      <div className="flex gap-2">
                        <Textarea
                          rows={2}
                          placeholder="Reply to this ticket…"
                          value={replyText[t.id] ?? ''}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [t.id]: e.target.value }))}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => sendReply(t)}
                          disabled={!replyText[t.id]?.trim() || sendingReply === t.id}
                        >
                          <Send className="h-4 w-4" />
                          {sendingReply === t.id ? 'Sending…' : 'Send'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}


const priorityTone = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' } as const
const statusTone = { open: 'info', pending: 'warning', resolved: 'success', closed: 'neutral' } as const

export function OwnerIssues() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [busy, setBusy] = useState<string | null>(null)
  const { data: allTickets, refetch } = useSupportTickets()

  // Owners only see tickets that managers have escalated to SentinelAI.
  const tickets = useMemo(() => allTickets.filter((t) => t.escalated), [allTickets])

  const filtered = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (status === 'all' || t.status === status) &&
          (!query || t.subject.toLowerCase().includes(query.toLowerCase()) || t.number.toLowerCase().includes(query.toLowerCase()) || t.company.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, status, tickets],
  )

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
          <p className="text-xs text-ink-subtle">{t.number} · {t.company}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (t) => t.category, hideOnMobile: true },
    { key: 'openedBy', header: 'Opened by', render: (t) => t.openedBy, hideOnMobile: true },
    { key: 'priority', header: 'Priority', render: (t) => <Badge tone={priorityTone[t.priority]} className="capitalize">{t.priority}</Badge> },
    { key: 'status', header: 'Status', render: (t) => <Badge tone={statusTone[t.status]} className="capitalize">{t.status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (t) =>
        t.status !== 'resolved' && t.status !== 'closed' ? (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => resolve(t)} disabled={busy === t.id}>Mark resolved</Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div>
      <PageHeader title="Issues" description="Technical issues escalated to SentinelAI by company managers." />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Escalated" value={tickets.length} icon={<LifeBuoy className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Open" value={tickets.filter((t) => t.status === 'open').length} icon={<TicketCheck className="h-5 w-5" />} tone="info" />
        <KpiCard label="In progress" value={tickets.filter((t) => t.status === 'pending').length} icon={<Clock className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Resolved" value={tickets.filter((t) => t.status === 'resolved').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search issues…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
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
            <EmptyState icon={<LifeBuoy className="h-6 w-6" />} title="No escalated issues" description="Tickets escalated by managers will appear here." />
          ) : (
            <DataTable columns={columns} data={filtered} rowKey={(t) => t.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
