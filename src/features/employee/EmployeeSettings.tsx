import { useEffect, useState } from 'react'
import { Bell, KeyRound, Monitor, Moon, Palette, Shield, Smartphone, Sun } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Field, Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'
import { useNotificationPreferences, saveNotificationPreferences } from '@/lib/api'
import { requestOtp, verifyOtp, supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const twoFactorKey = (id?: string) => `sentinel.2fa.${id ?? 'anon'}`

export function EmployeeSettings() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const { data: prefs } = useNotificationPreferences(user?.id)
  const [notif, setNotif] = useState({ fatigue: true, breaks: true, weekly: true, email: true, push: true, sms: false })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  // Security state
  const [twoFactor, setTwoFactor] = useState(false)
  const [otpStage, setOtpStage] = useState<'idle' | 'sent' | 'verifying'>('idle')
  const [otpCode, setOtpCode] = useState('')
  const [secStatus, setSecStatus] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null)
  const [secBusy, setSecBusy] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    setTwoFactor(localStorage.getItem(twoFactorKey(user?.id)) === 'on')
  }, [user?.id])

  const toggleTwoFactor = async (next: boolean) => {
    setSecStatus(null)
    if (!next) {
      localStorage.removeItem(twoFactorKey(user?.id))
      setTwoFactor(false)
      setOtpStage('idle')
      setOtpCode('')
      setSecStatus({ tone: 'ok', msg: 'Two-factor authentication disabled.' })
      return
    }
    if (!user?.email) return
    setSecBusy(true)
    try {
      await requestOtp(user.email)
      setOtpStage('sent')
      setSecStatus({ tone: 'ok', msg: `We sent a 6-digit code to ${user.email}. Enter it to enable 2FA.` })
    } catch (e) {
      setSecStatus({ tone: 'err', msg: e instanceof Error ? e.message : 'Could not send the code' })
    } finally {
      setSecBusy(false)
    }
  }

  const confirmTwoFactor = async () => {
    if (!user?.email || otpCode.length !== 6) return
    setOtpStage('verifying')
    setSecStatus(null)
    try {
      await verifyOtp(user.email, otpCode)
      localStorage.setItem(twoFactorKey(user?.id), 'on')
      setTwoFactor(true)
      setOtpStage('idle')
      setOtpCode('')
      setSecStatus({ tone: 'ok', msg: 'Two-factor authentication is now enabled.' })
    } catch (e) {
      setOtpStage('sent')
      setSecStatus({ tone: 'err', msg: e instanceof Error ? e.message : 'That code was not valid' })
    }
  }

  const updateSecurity = async () => {
    setSecStatus(null)
    if (!newPassword) {
      setSecStatus({ tone: 'err', msg: 'Enter a new password to update.' })
      return
    }
    if (newPassword.length < 8) {
      setSecStatus({ tone: 'err', msg: 'Password must be at least 8 characters.' })
      return
    }
    setSecBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setSecStatus({ tone: 'ok', msg: 'Password updated successfully.' })
    } catch (e) {
      setSecStatus({ tone: 'err', msg: e instanceof Error ? e.message : 'Could not update password' })
    } finally {
      setSecBusy(false)
    }
  }

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
              <Field label="New password"><Input type="password" placeholder="At least 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} icon={<KeyRound className="h-4 w-4" />} /></Field>
            </div>
            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                    <Smartphone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">Two-factor authentication {twoFactor && <Badge tone="success" className="ml-1">On</Badge>}</p>
                    <p className="text-xs text-ink-muted">Verify a code sent to your email each time you sign in</p>
                  </div>
                </div>
                <Switch label="" checked={twoFactor} onChange={toggleTwoFactor} />
              </div>
              {otpStage !== 'idle' && (
                <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end">
                  <Field label="Enter the 6-digit code" className="sm:max-w-[12rem]">
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </Field>
                  <Button onClick={confirmTwoFactor} disabled={otpCode.length !== 6 || otpStage === 'verifying'}>
                    {otpStage === 'verifying' ? 'Verifying…' : 'Confirm code'}
                  </Button>
                  <Button variant="outline" onClick={() => user?.email && requestOtp(user.email)}>Resend</Button>
                </div>
              )}
            </div>
          </CardBody>
          <CardFooter className="justify-end">
            {secStatus && (
              <span className={cn('mr-auto text-sm', secStatus.tone === 'ok' ? 'text-emerald-600' : 'text-rose-600')}>{secStatus.msg}</span>
            )}
            <Button onClick={updateSecurity} disabled={secBusy}>{secBusy ? 'Updating…' : 'Update security'}</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
