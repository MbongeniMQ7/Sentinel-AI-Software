import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid3x3, HeartPulse, LayoutList, Search, SlidersHorizontal, UserPlus, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Field, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/shared/States'
import { RiskBadge, StatusBadge } from '@/components/shared/Badges'
import { useEmployees, inviteUser, type Employee } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export function ManagerWorkforce() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('all')
  const [risk, setRisk] = useState('all')
  const { data: employees, refetch } = useEmployees()

  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState<string | null>(null)

  const addEmployee = async () => {
    if (!user?.companyId) {
      setAddError('Your account is not linked to a company yet. Ask the platform owner to assign you to one.')
      return
    }
    if (!newEmail.trim()) {
      setAddError('An email address is required.')
      return
    }
    setAdding(true)
    setAddError(null)
    try {
      await inviteUser({
        companyId: user.companyId,
        email: newEmail.trim(),
        role: 'employee',
        invitedBy: user.id,
        fullName: newName.trim() || undefined,
        title: newTitle.trim() || undefined,
      })
      setAddSuccess(`${newEmail.trim()} was added to your team. They'll appear here once they sign in for the first time.`)
      setNewName('')
      setNewEmail('')
      setNewTitle('')
      refetch()
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Could not add employee')
    } finally {
      setAdding(false)
    }
  }

  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        if (dept !== 'all' && e.department !== dept) return false
        if (risk !== 'all' && e.riskLevel !== risk) return false
        if (query && !e.name.toLowerCase().includes(query.toLowerCase()) && !e.role.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [query, dept, risk, employees],
  )

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      render: (e) => (
        <div className="flex items-center gap-3">
          <Avatar name={e.name} src={e.avatarUrl} size="sm" status={e.avatarStatus} />
          <div>
            <p className="font-medium text-ink">{e.name}</p>
            <p className="text-xs text-ink-subtle">{e.role}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', render: (e) => e.department, hideOnMobile: true },
    { key: 'shift', header: 'Shift', render: (e) => e.shift, hideOnMobile: true },
    { key: 'fatigue', header: 'Fatigue', render: (e) => <div className="w-24"><Progress value={e.fatigue} tone={e.fatigue >= 75 ? 'danger' : e.fatigue >= 50 ? 'warning' : 'success'} showLabel /></div> },
    { key: 'risk', header: 'Risk', render: (e) => <RiskBadge level={e.riskLevel} /> },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} />, hideOnMobile: true },
  ]

  const departments = [...new Set(employees.map((e) => e.department))]

  return (
    <div>
      <PageHeader
        title="Workforce"
        description={`${employees.length} team members across ${departments.length} departments.`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-line p-0.5">
              <button onClick={() => setView('grid')} className={cn('rounded-lg p-1.5', view === 'grid' ? 'bg-surface-muted text-ink' : 'text-ink-subtle')}><Grid3x3 className="h-4 w-4" /></button>
              <button onClick={() => setView('list')} className={cn('rounded-lg p-1.5', view === 'list' ? 'bg-surface-muted text-ink' : 'text-ink-subtle')}><LayoutList className="h-4 w-4" /></button>
            </div>
            <Button size="sm" onClick={() => { setAddOpen(true); setAddError(null); setAddSuccess(null) }}>
              <UserPlus className="h-4 w-4" /> Add employee
            </Button>
          </div>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search employees…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <div className="flex items-center gap-2 sm:ml-auto">
            <SlidersHorizontal className="h-4 w-4 text-ink-subtle" />
            <Select value={dept} onChange={(e) => setDept(e.target.value)} className="w-40">
              <option value="all">All departments</option>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </Select>
            <Select value={risk} onChange={(e) => setRisk(e.target.value)} className="w-36">
              <option value="all">All risk</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Users className="h-6 w-6" />} title="No employees match" description="Adjust your filters to see more team members." /></Card>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((e) => (
            <button key={e.id} onClick={() => navigate(`/admin/workforce/${e.id}`)} className="card p-5 text-left transition-shadow hover:shadow-pop">
              <div className="flex items-center gap-3">
                <Avatar name={e.name} src={e.avatarUrl} status={e.avatarStatus} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{e.name}</p>
                  <p className="truncate text-xs text-ink-subtle">{e.role} · {e.department}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <RiskBadge level={e.riskLevel} />
                <StatusBadge status={e.status} />
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-ink-muted"><span>Fatigue</span><span className="font-medium text-ink">{e.fatigue}</span></div>
                  <Progress value={e.fatigue} tone={e.fatigue >= 75 ? 'danger' : e.fatigue >= 50 ? 'warning' : 'success'} />
                </div>
                <div className="flex items-center justify-between text-sm text-ink-muted">
                  <span className="flex items-center gap-1.5"><HeartPulse className="h-3.5 w-3.5 text-rose-500" /> {e.heartRate} bpm</span>
                  <span className="text-xs text-ink-subtle">{e.lastActive}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <DataTable columns={columns} data={filtered} rowKey={(e) => e.id} onRowClick={(e) => navigate(`/admin/workforce/${e.id}`)} />
          </CardBody>
        </Card>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add employee to your team"
        description="Grant a team member access to this company's workspace."
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>Close</Button>
            <Button onClick={addEmployee} disabled={adding}>{adding ? 'Adding…' : 'Add employee'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {addError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">{addError}</p>}
          {addSuccess && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{addSuccess}</p>}
          <Field label="Full name"><Input placeholder="Jane Doe" value={newName} onChange={(e) => setNewName(e.target.value)} /></Field>
          <Field label="Email" required><Input type="email" placeholder="jane@company.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></Field>
          <Field label="Job title"><Input placeholder="Machine operator" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></Field>
          <p className="text-xs text-ink-subtle">They'll receive an email letting them know they've been added. They sign in passwordlessly with a one-time code — no password needed.</p>
        </div>
      </Modal>
    </div>
  )
}
