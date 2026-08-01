import { Network, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/States'
import { usePlatformUsers } from '@/lib/api'

interface Node {
  name: string
  title: string
  reports?: Node[]
  count?: number
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
  const { data: users } = usePlatformUsers()
  const owners = users.filter((u) => u.role === 'owner')
  const managers = users.filter((u) => u.role === 'manager')
  const employees = users.filter((u) => u.role === 'employee')
  const companies = Array.from(new Set(users.map((u) => u.company).filter((c) => c && c !== '—')))

  const tree: Node | null = users.length === 0
    ? null
    : {
        name: 'Organization',
        title: `${users.length} people`,
        reports: companies.map((c) => ({
          name: c,
          title: 'Company',
          count: employees.filter((e) => e.company === c).length,
          reports: managers.filter((m) => m.company === c).map((m) => ({ name: m.name, title: m.roleLabel })),
        })),
      }

  return (
    <div>
      <PageHeader
        title="Hierarchy"
        description="Manage your reporting structure and management chain."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { l: 'Managers', v: managers.length, icon: Network },
          { l: 'Owners', v: owners.length, icon: Users },
          { l: 'Employees', v: employees.length, icon: Users },
        ].map((s) => (
          <Card key={s.l} className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40"><s.icon className="h-5 w-5" /></span>
            <div><p className="text-2xl font-bold text-ink">{s.v}</p><p className="text-sm text-ink-muted">{s.l}</p></div>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="overflow-x-auto py-8">
          {tree ? (
            <div className="flex min-w-max justify-center px-4">
              <OrgNode node={tree} root />
            </div>
          ) : (
            <EmptyState icon={<Network className="h-6 w-6" />} title="No team members yet" description="Your reporting structure appears here once users are added to your organization." />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
