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
import { useEmployees, useCompanies, inviteUser } from '@/lib/api'
import { useAuth } from '@/lib/auth'

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

export function OwnerUsers() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const { user } = useAuth()
  const { data: employees } = useEmployees()
  const { data: companies } = useCompanies()

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteRole, setInviteRole] = useState<'employee' | 'manager' | 'owner'>('employee')
  const [inviteCompany, setInviteCompany] = useState('')
  const [sending, setSending] = useState(false)
  const [inviteMsg, setInviteMsg] = useState<string | null>(null)
  const [inviteErr, setInviteErr] = useState<string | null>(null)

  const sendInvite = async () => {
    if (!user) return
    if (!inviteEmail.trim()) {
      setInviteErr('Email is required.')
      return
    }
    setSending(true)
    setInviteErr(null)
    setInviteMsg(null)
    try {
      // Platform owners aren't scoped to a company; everyone else is.
      const company = companies.find((c) => c.name === inviteCompany) ?? companies[0]
      const companyId = inviteRole === 'owner' ? null : company?.id ?? null
      await inviteUser({
        companyId,
        email: inviteEmail,
        role: inviteRole,
        invitedBy: user.id,
        fullName: inviteName,
        phone: invitePhone,
      })
      setInviteMsg(`Invitation sent to ${inviteEmail}.`)
      setInviteEmail('')
      setInviteName('')
      setInvitePhone('')
    } catch (e) {
      setInviteErr(e instanceof Error ? e.message : 'Could not create invite')
    } finally {
      setSending(false)
    }
  }

  const users: GlobalUser[] = useMemo(
    () =>
      employees.map((e, i) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        role: (['Employee', 'Employee', 'Manager', 'Admin', 'Owner'] as const)[i % 5],
        company: companies.length ? companies[i % companies.length].name : '—',
        status: e.status === 'on-leave' ? 'on-leave' : e.status === 'offline' ? 'offline' : 'active',
        lastActive: e.lastActive,
      })),
    [employees, companies],
  )

  const filtered = useMemo(
    () => users.filter((u) => (role === 'all' || u.role === role) && (!query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))),
    [query, role, users],
  )

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Role', 'Company', 'Status', 'Last active']
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const rows = filtered.map((u) => [u.name, u.email, u.role, u.company, u.status, u.lastActive].map(escape).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
            <Button variant="outline" size="icon" onClick={exportCsv} disabled={filtered.length === 0} aria-label="Export users"><Download className="h-4 w-4" /></Button>
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
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)} disabled={sending}>Close</Button><Button onClick={sendInvite} disabled={sending}>{sending ? 'Sending…' : 'Send invite'}</Button></>}
      >
        <div className="space-y-4">
          {inviteErr && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">{inviteErr}</p>}
          {inviteMsg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-950/40">{inviteMsg}</p>}
          <Field label="Full name"><Input placeholder="Jordan Blake" value={inviteName} onChange={(e) => setInviteName(e.target.value)} /></Field>
          <Field label="Email" required><Input type="email" placeholder="name@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} /></Field>
          <Field label="Phone"><Input placeholder="+1 (555) 0000" value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} /></Field>
          <Field label="Role" required><Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'employee' | 'manager' | 'owner')}><option value="employee">Employee</option><option value="manager">Manager / Admin</option><option value="owner">Owner</option></Select></Field>
          {inviteRole === 'owner' ? (
            <p className="rounded-lg bg-surface-subtle px-3 py-2 text-xs text-ink-muted">Owners have platform-wide access and aren't tied to a company. They'll sign in with this email using the OTP code we send.</p>
          ) : (
            <Field label="Company"><Select value={inviteCompany} onChange={(e) => setInviteCompany(e.target.value)}>{companies.map((c) => <option key={c.id}>{c.name}</option>)}</Select></Field>
          )}
        </div>
      </Modal>
    </div>
  )
}
