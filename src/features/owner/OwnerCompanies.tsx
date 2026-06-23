import { useEffect, useMemo, useState } from 'react'
import { Building2, Cpu, Plus, Search, ShieldCheck, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Drawer } from '@/components/ui/Drawer'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/Badges'
import { KpiCard } from '@/components/shared/KpiCard'
import { TrendArea } from '@/components/shared/Charts'
import { useCompanies, useRevenueTrend, usePlatformUsers, createCompany, updateCompanyBilling, type Company } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const planTones = { Starter: 'info', Growth: 'brand', Enterprise: 'purple' } as const
const roleTones = { Employee: 'neutral', Manager: 'purple', Owner: 'success' } as const

export function OwnerCompanies() {
  const [query, setQuery] = useState('')
  const [plan, setPlan] = useState('all')
  const [selected, setSelected] = useState<Company | null>(null)
  const { data: companies, refetch } = useCompanies()
  const { data: revenueTrend } = useRevenueTrend()
  const { data: allUsers } = usePlatformUsers()

  // Billing edit state for the selected company
  const [billing, setBilling] = useState({ plan: 'Starter', seats: '0', status: 'active' })
  const [savingBilling, setSavingBilling] = useState(false)
  const [billingMsg, setBillingMsg] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null)

  useEffect(() => {
    if (selected) setBilling({ plan: selected.plan, seats: String(selected.seats), status: selected.status })
    setBillingMsg(null)
  }, [selected])

  const members = useMemo(
    () =>
      allUsers
        .filter((u) => u.companyId === selected?.id)
        .sort((a, b) => (a.role === b.role ? 0 : a.role === 'manager' ? -1 : 1)),
    [allUsers, selected],
  )

  const saveBilling = async () => {
    if (!selected) return
    setSavingBilling(true)
    setBillingMsg(null)
    try {
      await updateCompanyBilling(selected.id, {
        plan: billing.plan as Company['plan'],
        seats: Number(billing.seats) || 0,
        status: billing.status as Company['status'],
      })
      setBillingMsg({ tone: 'ok', msg: 'Billing updated.' })
      refetch()
    } catch (e) {
      setBillingMsg({ tone: 'err', msg: e instanceof Error ? e.message : 'Could not update billing' })
    } finally {
      setSavingBilling(false)
    }
  }

  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', industry: '', plan: 'Starter', seats: '10', status: 'trial' })
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const submitCompany = async () => {
    setSaving(true)
    setAddError(null)
    try {
      await createCompany({
        name: form.name,
        industry: form.industry,
        plan: form.plan as Company['plan'],
        seats: Number(form.seats) || 0,
        status: form.status as 'active' | 'trial',
      })
      setAddOpen(false)
      setForm({ name: '', industry: '', plan: 'Starter', seats: '10', status: 'trial' })
      refetch()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not create company')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(
    () => companies.filter((c) => (plan === 'all' || c.plan === plan) && (!query || c.name.toLowerCase().includes(query.toLowerCase()))),
    [query, plan, companies],
  )

  return (
    <div>
      <PageHeader
        title="Company Management"
        description="All organizations using SentinelAI."
        actions={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add company</Button>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Companies" value={companies.length} icon={<Building2 className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Active" value={companies.filter((c) => c.status === 'active').length} icon={<Building2 className="h-5 w-5" />} tone="success" />
        <KpiCard label="Trials" value={companies.filter((c) => c.status === 'trial').length} icon={<Building2 className="h-5 w-5" />} tone="info" />
        <KpiCard label="At risk" value={companies.filter((c) => c.status === 'past-due').length} icon={<Building2 className="h-5 w-5" />} tone="danger" />
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search companies…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <Select value={plan} onChange={(e) => setPlan(e.target.value)} className="sm:ml-auto sm:w-44">
            <option value="all">All plans</option>
            <option>Starter</option><option>Growth</option><option>Enterprise</option>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Building2 className="h-6 w-6" />} title="No companies found" description="Adjust your search or filters." /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)} className="card p-5 text-left transition-shadow hover:shadow-pop">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40"><Building2 className="h-5 w-5" /></span>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-3 font-semibold text-ink">{c.name}</p>
              <p className="text-xs text-ink-subtle">{c.industry} · since {c.since}</p>
              <div className="mt-4 flex items-center gap-2"><Badge tone={planTones[c.plan]}>{c.plan}</Badge><Badge tone="neutral">{formatCurrency(c.mrr)}/mo</Badge></div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs text-ink-muted"><span>Seat utilization</span><span>{Math.round((c.activeUsers / c.seats) * 100)}%</span></div>
                <Progress value={(c.activeUsers / c.seats) * 100} />
              </div>
              <div className="mt-4 flex justify-between text-sm text-ink-muted">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {c.activeUsers}/{c.seats}</span>
                <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> {c.devices}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={selected ? `${selected.industry} · ${selected.id}` : ''}
        width="lg"
        footer={<Button className="flex-1" onClick={() => setSelected(null)}>Done</Button>}
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-2"><Badge tone={planTones[selected.plan]}>{selected.plan}</Badge><StatusBadge status={selected.status} /></div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'MRR', v: formatCurrency(selected.mrr) },
                { l: 'Seats', v: `${selected.activeUsers}/${selected.seats}` },
                { l: 'Devices', v: String(selected.devices) },
                { l: 'Customer since', v: selected.since },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-surface-subtle p-3"><p className="text-lg font-bold text-ink">{s.v}</p><p className="text-xs text-ink-muted">{s.l}</p></div>
              ))}
            </div>

            {/* Registered members */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Registered users</p>
                <Badge tone="neutral">{members.length}</Badge>
              </div>
              {members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-ink-muted">No managers or workers registered yet.</div>
              ) : (
                <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3">
                      <Avatar name={m.name} size="sm" status={m.status === 'active' ? 'online' : 'offline'} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                        <p className="truncate text-xs text-ink-subtle">{m.email}</p>
                      </div>
                      <Badge tone={roleTones[m.roleLabel]}>{m.roleLabel}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing management */}
            <div className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                <p className="text-sm font-medium text-ink">Manage billing</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-muted">Plan</label>
                  <Select value={billing.plan} onChange={(e) => setBilling({ ...billing, plan: e.target.value })}>
                    <option>Starter</option><option>Growth</option><option>Enterprise</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-muted">Seats</label>
                  <Input type="number" min={0} value={billing.seats} onChange={(e) => setBilling({ ...billing, seats: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-muted">Status</label>
                  <Select value={billing.status} onChange={(e) => setBilling({ ...billing, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="past-due">Past due</option>
                    <option value="churned">Churned</option>
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {billingMsg ? (
                  <span className={billingMsg.tone === 'ok' ? 'text-sm text-emerald-600' : 'text-sm text-rose-600'}>{billingMsg.msg}</span>
                ) : <span />}
                <Button size="sm" onClick={saveBilling} loading={savingBilling}>Save billing</Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Revenue trend</p>
              <TrendArea data={revenueTrend} xKey="month" series={[{ key: 'mrr', label: 'MRR', color: '#10b981' }]} height={180} />
            </div>
          </div>
        )}
      </Drawer>

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add company"
        subtitle="Create a new organization on SentinelAI."
        width="md"
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} disabled={!form.name.trim()} onClick={submitCompany}>Create company</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Company name</label>
            <Input placeholder="Acme Manufacturing" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Industry</label>
            <Input placeholder="Manufacturing" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Plan</label>
              <Select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                <option>Starter</option><option>Growth</option><option>Enterprise</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Seats</label>
              <Input type="number" min={0} value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Status</label>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
            </Select>
          </div>
          {addError && <p className="text-sm text-rose-600">{addError}</p>}
        </div>
      </Drawer>
    </div>
  )
}
