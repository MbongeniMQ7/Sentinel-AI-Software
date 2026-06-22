import { useEffect, useState } from 'react'
import { Bell, KeyRound, Monitor, Moon, Palette, Shield, Smartphone, Sun } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Field, Input } from '@/components/ui/Input'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'
import { useNotificationPreferences, saveNotificationPreferences } from '@/lib/api'
import { cn } from '@/lib/utils'

export function EmployeeSettings() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const { data: prefs } = useNotificationPreferences(user?.id)
  const [notif, setNotif] = useState({ fatigue: true, breaks: true, weekly: true, email: true, push: true, sms: false })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    setNotif({
      fatigue: prefs.fatigueAlerts,
      breaks: prefs.breakReminders,
      weekly: prefs.shiftSummaries,
      email: prefs.emailEnabled,
      push: prefs.pushEnabled,
      sms: prefs.smsEnabled,
    })
  }, [prefs])

  const saveNotif = async () => {
    if (!user) return
    setSaving(true)
    setStatus(null)
    try {
      await saveNotificationPreferences(user.id, {
        fatigueAlerts: notif.fatigue,
        breakReminders: notif.breaks,
        shiftSummaries: notif.weekly,
        emailEnabled: notif.email,
        pushEnabled: notif.push,
        smsEnabled: notif.sms,
      })
      setStatus('Saved')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <div>
      <PageHeader title="Settings" description="Manage notifications, security and appearance." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Notifications" subtitle="Choose what you get notified about" icon={<Bell className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <Switch label="Fatigue alerts" description="High-risk fatigue and drowsiness warnings" checked={notif.fatigue} onChange={(v) => setNotif({ ...notif, fatigue: v })} />
            <Switch label="Break reminders" description="Nudges when a break is due" checked={notif.breaks} onChange={(v) => setNotif({ ...notif, breaks: v })} />
            <Switch label="Shift summaries" description="Your wellness report every shift" checked={notif.weekly} onChange={(v) => setNotif({ ...notif, weekly: v })} />
            <Switch label="Email notifications" description="Receive alerts by email" checked={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
            <Switch label="Push notifications" description="Browser and mobile push" checked={notif.push} onChange={(v) => setNotif({ ...notif, push: v })} />
            <Switch label="SMS alerts" description="Text messages for critical alerts" checked={notif.sms} onChange={(v) => setNotif({ ...notif, sms: v })} />
          </CardBody>
          <CardFooter className="justify-end">
            {status && <span className="mr-auto text-sm text-ink-muted">{status}</span>}
            <Button onClick={saveNotif} disabled={saving}>{saving ? 'Saving…' : 'Save preferences'}</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader title="Appearance" subtitle="Personalize your workspace theme" icon={<Palette className="h-4 w-4" />} />
          <CardBody>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => {
                const active = theme === t.id || (t.id === 'system' && false)
                return (
                  <button
                    key={t.id}
                    onClick={() => t.id !== 'system' && setTheme(t.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
                      active ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500 dark:bg-brand-950/30' : 'border-line hover:bg-surface-muted',
                    )}
                  >
                    <t.icon className={cn('h-5 w-5', active ? 'text-brand-600' : 'text-ink-subtle')} />
                    <span className="text-sm font-medium text-ink">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Security" subtitle="Protect your account" icon={<Shield className="h-4 w-4" />} />
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current password"><Input type="password" defaultValue="password" icon={<KeyRound className="h-4 w-4" />} /></Field>
              <Field label="New password"><Input type="password" placeholder="••••••••" icon={<KeyRound className="h-4 w-4" />} /></Field>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                  <Smartphone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Two-factor authentication</p>
                  <p className="text-xs text-ink-muted">Add an extra layer of security</p>
                </div>
              </div>
              <Switch label="" checked onChange={() => {}} />
            </div>
          </CardBody>
          <CardFooter className="justify-end">
            <Button variant="outline">Cancel</Button>
            <Button>Update security</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
