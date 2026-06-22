import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Cpu, IdCard, Settings2, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { useDevices, inviteUser } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, label: 'Personal details', icon: IdCard },
  { id: 2, label: 'Assign devices', icon: Cpu },
  { id: 3, label: 'Monitoring setup', icon: Settings2 },
]

export function ManagerOnboarding() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const { data: devices } = useDevices()
  const { user } = useAuth()

  // Personal details
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('Line Operator')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDevice = (id: string) => setSelectedDevices((p) => (p.includes(id) ? p.filter((d) => d !== id) : [...p, id]))
  const available = devices.filter((d) => !d.assignedTo).slice(0, 6)

  const complete = async () => {
    if (!user) return
    if (!name.trim() || !email.trim()) {
      setError('Full name and email are required.')
      setStep(1)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await inviteUser({
        companyId: user.companyId,
        email,
        role: 'employee',
        invitedBy: user.id,
        fullName: name,
        title: jobTitle,
        phone,
      })
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not onboard the employee')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setDone(false)
    setStep(1)
    setSelectedDevices([])
    setName('')
    setEmail('')
    setJobTitle('Line Operator')
    setPhone('')
    setError(null)
  }

  if (done) {
    return (
      <div>
        <PageHeader title="Onboarding" description="Add a new team member to SentinelAI." />
        <Card className="mx-auto max-w-md">
          <CardBody className="flex flex-col items-center py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><Check className="h-7 w-7" /></span>
            <h3 className="mt-5 text-lg font-semibold text-ink">Employee onboarded</h3>
            <p className="mt-1 text-sm text-ink-muted">{name || 'The new hire'} has been invited with {selectedDevices.length} device(s) assigned. They'll get an email to sign in.</p>
            <Button className="mt-6" onClick={reset}>Onboard another</Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Onboarding" description="Add a new team member to SentinelAI." />

      <div className="mx-auto max-w-3xl">
        {/* Stepper */}
        <div className="mb-6 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors', step > s.id ? 'border-emerald-500 bg-emerald-500 text-white' : step === s.id ? 'border-brand-500 bg-brand-500 text-white' : 'border-line text-ink-subtle')}>
                  {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={cn('hidden text-xs font-medium sm:block', step >= s.id ? 'text-ink' : 'text-ink-subtle')}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={cn('mx-2 h-0.5 flex-1', step > s.id ? 'bg-emerald-500' : 'bg-line')} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader title={steps[step - 1].label} icon={<UserPlus className="h-4 w-4" />} />
          <CardBody>
            {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">{error}</p>}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required><Input placeholder="Jordan Blake" value={name} onChange={(e) => setName(e.target.value)} /></Field>
                <Field label="Email" required><Input type="email" placeholder="jordan.blake@sentinel.ai" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                <Field label="Role" required><Select value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}><option>Line Operator</option><option>Forklift Driver</option><option>Technician</option><option>QA Inspector</option></Select></Field>
                <Field label="Department" required><Select><option>Operations</option><option>Logistics</option><option>Assembly</option><option>Quality</option></Select></Field>
                <Field label="Shift"><Select><option>Morning</option><option>Evening</option><option>Night</option></Select></Field>
                <Field label="Phone"><Input placeholder="+1 (555) 0000" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-ink-muted">Select devices to assign to this employee.</p>
                {available.map((d) => (
                  <button key={d.id} onClick={() => toggleDevice(d.id)} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors', selectedDevices.includes(d.id) ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30' : 'border-line hover:bg-surface-muted')}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-muted"><Cpu className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink">{d.name}</p><p className="font-mono text-xs text-ink-subtle">{d.id} · {d.type}</p></div>
                    <div className={cn('flex h-5 w-5 items-center justify-center rounded-md border', selectedDevices.includes(d.id) ? 'border-brand-600 bg-brand-600 text-white' : 'border-line')}>{selectedDevices.includes(d.id) && <Check className="h-3 w-3" />}</div>
                  </button>
                ))}
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <Field label="Monitoring type"><Select><option>Hybrid (camera + wearable)</option><option>Camera only</option><option>Wearable only</option></Select></Field>
                <div className="space-y-4 rounded-xl border border-line p-4">
                  <Switch label="Fatigue alerts" description="Notify on high fatigue index" checked onChange={() => {}} />
                  <Switch label="PPE compliance" description="Detect missing safety equipment" checked onChange={() => {}} />
                  <Switch label="Auto-escalation" description="Escalate critical alerts to safety officer" checked onChange={() => {}} />
                </div>
                <div className="rounded-xl bg-surface-subtle p-4 text-sm">
                  <p className="font-medium text-ink">Summary</p>
                  <div className="mt-2 flex flex-wrap gap-2"><Badge tone="brand">{name || 'New hire'}</Badge><Badge tone="neutral">{selectedDevices.length} devices</Badge><Badge tone="success">Hybrid monitoring</Badge></div>
                </div>
              </div>
            )}
          </CardBody>
          <CardFooter className="justify-between">
            <Button variant="outline" disabled={step === 1 || saving} onClick={() => setStep((s) => s - 1)}><ChevronLeft className="h-4 w-4" /> Back</Button>
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue <ChevronRight className="h-4 w-4" /></Button>
            ) : (
              <Button onClick={complete} disabled={saving}><Check className="h-4 w-4" /> {saving ? 'Onboarding…' : 'Complete onboarding'}</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
