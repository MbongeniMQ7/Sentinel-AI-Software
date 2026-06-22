import { useState } from 'react'
import { Bell, KeyRound, Monitor, Moon, Palette, Shield, Smartphone, Sun } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Field, Input } from '@/components/ui/Input'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

export function EmployeeSettings() {
  const { theme, setTheme } = useTheme()
  const [notif, setNotif] = useState({ fatigue: true, breaks: true, leave: false, weekly: true, sound: true })

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
            <Switch label="Leave updates" description="Status changes on leave requests" checked={notif.leave} onChange={(v) => setNotif({ ...notif, leave: v })} />
            <Switch label="Weekly summary" description="Your wellness report every Monday" checked={notif.weekly} onChange={(v) => setNotif({ ...notif, weekly: v })} />
            <Switch label="Sound alerts" description="Play a sound for critical alerts" checked={notif.sound} onChange={(v) => setNotif({ ...notif, sound: v })} />
          </CardBody>
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
