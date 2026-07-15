import { Network, Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/States'
import { useEmployees, usePlatformUsers } from '@/lib/api'

interface Node {
  name: string
  title: string
  avatarUrl?: string
  reports?: Node[]
  count?: number
}

function OrgNode({ node, root }: { node: Node; root?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-56 rounded-2xl border p-4 text-center shadow-card ${root ? 'border-brand-300 bg-brand-50/50 dark:bg-brand-950/30' : 'border-line bg-surface'}`}>
        <Avatar name={node.name} src={node.avatarUrl} className="mx-auto" status="online" />
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
  const { data: employees } = useEmployees()
  const { data: platformUsers } = usePlatformUsers()

  const managers = platformUsers.filter((u) => u.role === 'manager')
  const totalManagers = managers.length
  const totalEmployees = employees.length

  // Build a simple tree: owner/managers as roots, employees as leaf nodes
  const tree: Node | null = managers.length > 0
    ? {
        name: managers[0]?.name ?? 'Management',
        title: managers[0] ? 'Manager' : 'Team Lead',
        reports: managers.slice(1).map((m) => ({
          name: m.name,
          title: 'Manager',
          count: employees.length > 0 ? Math.ceil(employees.length / Math.max(managers.length, 1)) : undefined,
        })),
      }
    : null

  return (
    <div>
      <PageHeader
        title="Hierarchy"
        description="Manage your reporting structure and management chain."
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Add manager</Button>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { l: 'Managers', v: totalManagers, icon: Network },
          { l: 'Employees', v: totalEmployees, icon: Users },
          { l: 'Platform users', v: platformUsers.length, icon: Users },
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
            <EmptyState icon={<Network className="h-6 w-6" />} title="No managers found" description="Add managers to build the hierarchy chart." />
          )}
        </CardBody>
      </Card>
    </div>
  )
}

