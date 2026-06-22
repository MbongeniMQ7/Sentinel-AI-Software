import { useState } from 'react'
import { Camera, HeartPulse, Layers, Mail, MapPin, Phone, ShieldCheck, UserCog } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { saveProfile, saveEmployeeMonitoring } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const monitoringTypes = [
  { id: 'camera', title: 'Camera only', desc: 'Vision-based fatigue detection.', icon: Camera },
  { id: 'wearable', title: 'Wearable only', desc: 'Heart-rate & motion biometrics.', icon: HeartPulse },
  { id: 'hybrid', title: 'Hybrid', desc: 'Camera + wearable fusion (recommended).', icon: Layers },
] as const

export function EmployeeProfile() {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState('')
  const [monitoring, setMonitoring] = useState<'camera' | 'wearable' | 'hybrid'>('hybrid')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const save = async () => {
    if (!user) return
    setSaving(true)
    setStatus(null)
    try {
      await saveProfile({ id: user.id, fullName: name, phone })
      await saveEmployeeMonitoring(user.id, monitoring)
      await refresh()
      setStatus('Saved')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage your personal information and monitoring preferences." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center">
            <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="lg" status="online" className="scale-150" />
            <h3 className="mt-6 text-lg font-semibold text-ink">{user?.name}</h3>
            <p className="text-sm text-ink-muted">{user?.title}</p>
            <Badge tone="brand" className="mt-3">Employee ID · EMP-1000</Badge>
            <dl className="mt-6 w-full space-y-3 text-left text-sm">
              {[
                { icon: Mail, value: user?.email },
                { icon: Phone, value: '+1 (555) 0142' },
                { icon: MapPin, value: 'Plant 4 · Assembly Floor' },
                { icon: ShieldCheck, value: 'Hybrid monitoring active' },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-ink-muted">
                  <r.icon className="h-4 w-4 text-ink-subtle" /> <span className="truncate text-ink">{r.value}</span>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Personal information" icon={<UserCog className="h-4 w-4" />} />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Email"><Input type="email" defaultValue={user?.email} disabled /></Field>
              <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 0142" /></Field>
              <Field label="Department">
                <Select defaultValue="Assembly"><option>Assembly</option><option>Operations</option><option>Logistics</option><option>Quality</option></Select>
              </Field>
              <Field label="Shift">
                <Select defaultValue="Morning"><option>Morning</option><option>Evening</option><option>Night</option></Select>
              </Field>
              <Field label="Emergency contact"><Input defaultValue="+1 (555) 0199" /></Field>
            </CardBody>
            <CardFooter className="justify-end">
              {status && <span className="mr-auto text-sm text-ink-muted">{status}</span>}
              <Button variant="outline" onClick={() => { setName(user?.name ?? ''); setPhone(''); setStatus(null) }} disabled={saving}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title="Monitoring type" subtitle="Choose how SentinelAI tracks your wellness" />
            <CardBody className="grid gap-3 sm:grid-cols-3">
              {monitoringTypes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMonitoring(m.id)}
                  className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors ${m.id === monitoring ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500 dark:bg-brand-950/30' : 'border-line hover:bg-surface-muted'}`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.id === monitoring ? 'bg-brand-600 text-white' : 'bg-surface-muted text-ink-muted'}`}>
                    <m.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{m.title}</span>
                    <span className="block text-xs text-ink-muted">{m.desc}</span>
                  </span>
                </button>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
