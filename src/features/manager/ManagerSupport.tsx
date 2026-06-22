import { useMemo, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Clock, LifeBuoy, Search, TicketCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { KpiCard } from '@/components/shared/KpiCard'
import { useSupportTickets, escalateTicket, updateTicketStatus, type Ticket } from '@/lib/api'

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
