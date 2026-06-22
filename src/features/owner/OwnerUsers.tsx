import { useMemo, useState } from 'react'
import { Download, MoreVertical, Search, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Field } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/Badges'
import { KpiCard } from '@/components/shared/KpiCard'
import { employees, companies } from '@/lib/mockData'

interface GlobalUser {
  id: string
  name: string
  email: string
  role: 'Employee' | 'Manager' | 'Owner' | 'Admin'
  company: string
  status: 'active' | 'offline' | 'on-leave'
  lastActive: string
}

const roleTones = { Employee: 'neutral', Manager: 'purple', Owner: 'success', Admin: 'info' } as const

const users: GlobalUser[] = employees.map((e, i) => ({
  id: e.id,
  name: e.name,
  email: e.email,
  role: (['Employee', 'Employee', 'Manager', 'Admin', 'Owner'] as const)[i % 5],
  company: companies[i % companies.length].name,
  status: e.status === 'on-leave' ? 'on-leave' : e.status === 'offline' ? 'offline' : 'active',
  lastActive: e.lastActive,
}))

export function OwnerUsers() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(
    () => users.filter((u) => (role === 'all' || u.role === role) && (!query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))),
    [query, role],
  )

  const columns: Column<GlobalUser>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} size="sm" status={u.status === 'active' ? 'online' : u.status === 'offline' ? 'offline' : 'away'} />
          <div><p className="font-medium text-ink">{u.name}</p><p className="text-xs text-ink-subtle">{u.email}</p></div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => <Badge tone={roleTones[u.role]}>{u.role}</Badge> },
    { key: 'company', header: 'Company', render: (u) => u.company, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} />, hideOnMobile: true },
    { key: 'last', header: 'Last active', render: (u) => u.lastActive, hideOnMobile: true },
    {
      key: 'actions',
      header: '',
      render: () => (
        <Dropdown trigger={<Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>}>
          <DropdownItem icon={<ShieldCheck className="h-4 w-4" />}>Edit role</DropdownItem>
          <DropdownItem>Reset password</DropdownItem>
          <DropdownDivider />
          <DropdownItem danger>Suspend user</DropdownItem>
        </Dropdown>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Global directory of every user across the platform."
        actions={<Button size="sm" onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4" /> Invite user</Button>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Total users" value={users.length} icon={<Users className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Active" value={users.filter((u) => u.status === 'active').length} icon={<Users className="h-5 w-5" />} tone="success" />
        <KpiCard label="Managers" value={users.filter((u) => u.role === 'Manager').length} icon={<ShieldCheck className="h-5 w-5" />} tone="purple" />
        <KpiCard label="Admins" value={users.filter((u) => u.role === 'Admin').length} icon={<ShieldCheck className="h-5 w-5" />} tone="info" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search users…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-40">
              <option value="all">All roles</option>
              <option>Employee</option><option>Manager</option><option>Admin</option><option>Owner</option>
            </Select>
            <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
          </div>
        </div>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<Users className="h-6 w-6" />} title="No users found" description="Adjust your search or filters." />
          ) : (
            <DataTable columns={columns} data={filtered} rowKey={(u) => u.id} />
          )}
        </CardBody>
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Invite user"
        description="Send an invitation to join the platform."
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => setAddOpen(false)}>Send invite</Button></>}
      >
        <div className="space-y-4">
          <Field label="Email" required><Input type="email" placeholder="name@company.com" /></Field>
          <Field label="Role" required><Select><option>Employee</option><option>Manager</option><option>Admin</option><option>Owner</option></Select></Field>
          <Field label="Company"><Select>{companies.map((c) => <option key={c.id}>{c.name}</option>)}</Select></Field>
        </div>
      </Modal>
    </div>
  )
}
