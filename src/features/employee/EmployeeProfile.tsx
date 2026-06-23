import { useRef, useState } from 'react'
import { Camera, Mail, MapPin, Phone, ShieldCheck, UserCog, Watch } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { saveProfile, uploadAvatar, useEmployees } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const monitoringLabel: Record<'camera' | 'wearable' | 'hybrid', string> = {
  camera: 'Camera monitoring',
  wearable: 'Wearable monitoring',
  hybrid: 'Hybrid monitoring',
}

export function EmployeeProfile() {
  const { user, refresh } = useAuth()
  const { data: employees } = useEmployees()
  const me = employees.find((e) => e.id === user?.id)
  const monitoring = me?.monitoring ?? 'wearable'
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const save = async () => {
    if (!user) return
    setSaving(true)
    setStatus(null)
    try {
      await saveProfile({ id: user.id, fullName: name, phone })
      await refresh()
      setStatus('Saved')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const onPickImage = () => fileRef.current?.click()

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    if (!file.type.startsWith('image/')) {
      setStatus('Please choose an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus('Image must be 2MB or smaller.')
      return
    }
    setUploading(true)
    setStatus(null)
    try {
      const url = await uploadAvatar(user.id, file)
      await saveProfile({ id: user.id, avatarUrl: url })
      await refresh()
      setStatus('Photo updated')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage your personal information and monitoring preferences." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="lg" status="online" className="scale-150" />
              <button
                type="button"
                onClick={onPickImage}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink-muted shadow-sm transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-60"
                aria-label="Change profile photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-ink">{user?.name}</h3>
            <p className="text-sm text-ink-muted">{user?.title || 'Team member'}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onPickImage} disabled={uploading}>
              <Camera className="h-3.5 w-3.5" /> {uploading ? 'Uploading…' : 'Change photo'}
            </Button>
            <dl className="mt-6 w-full space-y-3 text-left text-sm">
              {[
                { icon: Mail, value: user?.email },
                { icon: Phone, value: user?.phone || 'No phone on file' },
                { icon: MapPin, value: me?.department ? `${me.department} department` : 'Department not set' },
                { icon: ShieldCheck, value: `${monitoringLabel[monitoring]} active` },
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
              <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add a phone number" /></Field>
              <Field label="Department">
                <Input value={me?.department ?? 'Not assigned'} disabled />
              </Field>
              <Field label="Shift">
                <Input value={me?.shift ?? 'Not assigned'} disabled />
              </Field>
            </CardBody>
            <CardFooter className="justify-end">
              {status && <span className="mr-auto text-sm text-ink-muted">{status}</span>}
              <Button variant="outline" onClick={() => { setName(user?.name ?? ''); setPhone(user?.phone ?? ''); setStatus(null) }} disabled={saving}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title="Monitoring type" subtitle="Assigned and managed by your supervisor" />
            <CardBody>
              <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-subtle p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Watch className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{monitoringLabel[monitoring]}</p>
                  <p className="text-xs text-ink-muted">
                    Your monitoring method, department and shift are configured by your manager. Contact them to request a change.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
