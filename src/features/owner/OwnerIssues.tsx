import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, LifeBuoy, Search, TicketCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { KpiCard } from '@/components/shared/KpiCard'
import { useSupportTickets, updateTicketStatus, type Ticket } from '@/lib/api'

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
