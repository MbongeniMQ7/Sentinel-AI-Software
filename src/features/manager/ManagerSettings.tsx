import { useEffect, useState } from 'react'
import { Bell, Building2, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Field, Select } from '@/components/ui/Input'
import { useAuth } from '@/lib/auth'
import { useCompanySettings, saveCompanySettings, DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/lib/api'

export function ManagerSettings() {
  const { user } = useAuth()
  const { data: settings, loading, refetch } = useCompanySettings(user?.companyId ?? null)
  const [prefs, setPrefs] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPrefs(settings)
  }, [settings])

  const flash = (msg: string) => {
    setSaved(msg)
    window.setTimeout(() => setSaved(null), 2500)
  }

  const save = async () => {
    if (!user?.companyId) {
      setError('Your account is not linked to a company yet.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveCompanySettings(user.companyId, prefs)
      refetch()
      flash('Settings saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => setPrefs(DEFAULT_COMPANY_SETTINGS)

  return (
    <div>
      <PageHeader title="Settings" description="Configure operational defaults for your company." />

      {saved && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {saved}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 dark:bg-rose-950/40">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Team & defaults" subtitle="Operational defaults for your teams" icon={<Building2 className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <Field label="Default shift"><Select value={prefs.defaultShift} onChange={(e) => setPrefs({ ...prefs, defaultShift: e.target.value })}><option>Morning</option><option>Evening</option><option>Night</option></Select></Field>
            <Field label="Fatigue alert threshold"><Select value={prefs.fatigueThreshold} onChange={(e) => setPrefs({ ...prefs, fatigueThreshold: e.target.value })}><option value="50">50 — Conservative</option><option value="60">60 — Balanced</option><option value="75">75 — Permissive</option></Select></Field>
            <Field label="Default break length"><Select value={prefs.breakLength} onChange={(e) => setPrefs({ ...prefs, breakLength: e.target.value })}><option value="10">10</option><option value="15">15</option><option value="30">30</option></Select></Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="What you get notified about" icon={<Bell className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <Switch label="Critical alerts" description="Immediate push for critical fatigue events" checked={prefs.notifyCritical} onChange={(v) => setPrefs({ ...prefs, notifyCritical: v })} />
            <Switch label="Daily digest" description="Summary of your team's wellness each morning" checked={prefs.notifyDigest} onChange={(v) => setPrefs({ ...prefs, notifyDigest: v })} />
            <Switch label="Escalation pings" description="Notify when an alert escalates to you" checked={prefs.notifyEscalation} onChange={(v) => setPrefs({ ...prefs, notifyEscalation: v })} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Automation" subtitle="Reduce manual workload" icon={<SlidersHorizontal className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <Switch label="Auto-approve short breaks" description="Approve breaks under 10 minutes automatically" checked={prefs.autoApproveBreaks} onChange={(v) => setPrefs({ ...prefs, autoApproveBreaks: v })} />
            <Switch label="Auto-escalate PPE breaches" description="Escalate helmet/PPE alerts to safety officer" checked={prefs.autoEscalatePpe} onChange={(v) => setPrefs({ ...prefs, autoEscalatePpe: v })} />
          </CardBody>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={reset} disabled={saving || loading}>Reset</Button>
            <Button onClick={save} disabled={saving || loading}>{saving ? 'Saving…' : 'Save settings'}</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
