import { Network, Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

interface Node {
  name: string
  title: string
  reports?: Node[]
  count?: number
}

const tree: Node = {
  name: 'Jordan Vale',
  title: 'VP Operations',
  reports: [
    {
      name: 'Priya Nair',
      title: 'Shift Manager · Operations',
      count: 12,
      reports: [
        { name: 'Marcus Cole', title: 'Team Lead · Assembly', count: 6 },
        { name: 'Lena Frost', title: 'Team Lead · Quality', count: 5 },
      ],
    },
    {
      name: 'Omar Hadid',
      title: 'Shift Manager · Logistics',
      count: 9,
      reports: [
        { name: 'Sofia Reyes', title: 'Team Lead · Warehouse', count: 7 },
      ],
    },
  ],
}

function OrgNode({ node, root }: { node: Node; root?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-56 rounded-2xl border p-4 text-center shadow-card ${root ? 'border-brand-300 bg-brand-50/50 dark:bg-brand-950/30' : 'border-line bg-surface'}`}>
        <Avatar name={node.name} className="mx-auto" status="online" />
        <p className="mt-2 text-sm font-semibold text-ink">{node.name}</p>
        <p className="text-xs text-ink-muted">{node.title}</p>
        {node.count !== undefined && <Badge tone="neutral" className="mt-2"><Users className="h-3 w-3" /> {node.count} reports</Badge>}
      </div>
      {node.reports && node.reports.length > 0 && (
        <>
          <div className="h-6 w-px bg-line" />
          <div className="flex flex-wrap items-start justify-center gap-6">
            {node.reports.map((r) => (
              <div key={r.name} className="relative flex flex-col items-center">
                <OrgNode node={r} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function ManagerHierarchy() {
  return (
    <div>
      <PageHeader
        title="Hierarchy"
        description="Manage your reporting structure and management chain."
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Add manager</Button>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { l: 'Total managers', v: '4', icon: Network },
          { l: 'Team leads', v: '4', icon: Users },
          { l: 'Direct reports', v: '28', icon: Users },
        ].map((s) => (
          <Card key={s.l} className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40"><s.icon className="h-5 w-5" /></span>
            <div><p className="text-2xl font-bold text-ink">{s.v}</p><p className="text-sm text-ink-muted">{s.l}</p></div>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="overflow-x-auto py-8">
          <div className="flex min-w-max justify-center px-4">
            <OrgNode node={tree} root />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
