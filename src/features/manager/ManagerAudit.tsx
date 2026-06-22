import { useMemo, useState } from 'react'
import { Download, ScrollText, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { useAuditLogs, type AuditLog } from '@/lib/api'

type Log = AuditLog

export function ManagerAudit() {
  const [query, setQuery] = useState('')
  const [action, setAction] = useState('all')
  const { data: auditLogs } = useAuditLogs()

  const actions = [...new Set(auditLogs.map((l) => l.action))]
  const filtered = useMemo(
    () => auditLogs.filter((l) => (action === 'all' || l.action === action) && (!query || l.actor.toLowerCase().includes(query.toLowerCase()) || l.target.toLowerCase().includes(query.toLowerCase()))),
    [query, action, auditLogs],
  )

  const columns: Column<Log>[] = [
    {
      key: 'actor',
      header: 'Actor',
      render: (l) => (
        <div className="flex items-center gap-3">
          <Avatar name={l.actor} size="sm" />
          <span className="font-medium text-ink">{l.actor}</span>
        </div>
      ),
    },
    { key: 'action', header: 'Action', render: (l) => <span className="capitalize text-ink-muted">{l.action}</span> },
    { key: 'target', header: 'Target', render: (l) => <span className="font-mono text-xs text-ink-muted">{l.target}</span>, hideOnMobile: true },
    { key: 'ip', header: 'IP address', render: (l) => <span className="font-mono text-xs text-ink-subtle">{l.ip}</span>, hideOnMobile: true },
    { key: 'time', header: 'When', render: (l) => l.timestamp },
  ]

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable record of activity across your workspace."
        actions={<Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export logs</Button>}
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search actor or target…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <Select value={action} onChange={(e) => setAction(e.target.value)} className="sm:ml-auto sm:w-56">
            <option value="all">All actions</option>
            {actions.map((a) => <option key={a} className="capitalize">{a}</option>)}
          </Select>
        </div>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<ScrollText className="h-6 w-6" />} title="No log entries" description="No activity matches your filters." />
          ) : (
            <DataTable columns={columns} data={filtered} rowKey={(l) => l.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
