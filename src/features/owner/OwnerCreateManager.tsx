import { useState } from 'react'
import { Building2, CheckCircle2, Mail, Phone, ShieldCheck, User, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Field } from '@/components/ui/Input'
import { useCompanies, inviteUser } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export function OwnerCreateManager() {
  const { user } = useAuth()
  const { data: companies } = useCompanies()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const resolvedCompanyId = companyId || companies[0]?.id || ''

  const submit = async () => {
    if (!user) return
    if (!email.trim()) {
      setErr('Email is required.')
      return
    }
    if (!resolvedCompanyId) {
      setErr('Select a company for this manager.')
      return
    }
    setSending(true)
    setErr(null)
    setMsg(null)
    try {
      await inviteUser({
        companyId: resolvedCompanyId,
        email,
        role: 'manager',
        invitedBy: user.id,
        fullName: name,
        phone,
        title,
      })
      setMsg(`Manager invitation sent to ${email}.`)
      setName('')
      setEmail('')
      setPhone('')
      setTitle('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create manager invite')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader title="Create Manager" description="Invite a manager and assign them to a company." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody className="space-y-4">
            {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">{err}</p>}
            {msg && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-4 w-4" /> {msg}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input icon={<User className="h-4 w-4" />} placeholder="Jordan Blake" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Job title">
                <Input icon={<ShieldCheck className="h-4 w-4" />} placeholder="Operations Manager" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Email" required>
                <Input icon={<Mail className="h-4 w-4" />} type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Phone">
                <Input icon={<Phone className="h-4 w-4" />} placeholder="+27 82 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="Company" required>
                <Select value={resolvedCompanyId} onChange={(e) => setCompanyId(e.target.value)}>
                  {companies.length === 0 && <option value="">No companies yet</option>}
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={submit} disabled={sending}>
                <UserPlus className="h-4 w-4" /> {sending ? 'Sending…' : 'Send invite'}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
              <Building2 className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-ink">How it works</h3>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> The manager receives an email invitation to join the assigned company.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> They sign in with a one-time passcode — no password needed.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> Managers can oversee employees, alerts and reports for their company.</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
