import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Switch } from '@/components/ui/Switch'
import { Field, Input } from '@/components/ui/Input'
import { usePlatformSettings, savePlatformSettings, type PlatformSettings } from '@/lib/api'

export function OwnerSettings() {
  const [tab, setTab] = useState('branding')
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { data: settings, loading, refetch } = usePlatformSettings()
  const [form, setForm] = useState<PlatformSettings>(settings)

  // Hydrate the form once settings load.
  useEffect(() => {
    setForm(settings)
  }, [settings])

  const flash = (msg: string) => {
    setSaved(msg)
    window.setTimeout(() => setSaved(null), 2500)
  }

  const save = async (msg: string) => {
    setSaving(true)
    setError(null)
    try {
      await savePlatformSettings(form)
      refetch()
      flash(msg)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  const set = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div>
      <PageHeader title="Settings" description="Configure your platform branding and notification preferences." />

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

      <Card>
        <div className="px-4 pt-3">
          <Tabs
            tabs={[
              { id: 'branding', label: 'Branding' },
              { id: 'notifications', label: 'Notifications' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'branding' && (
          <>
            <CardBody className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-subtle p-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><ShieldCheck className="h-6 w-6" /></span>
                <div>
                  <p className="text-sm font-semibold text-ink">{form.platformName || 'SentinelAI'}</p>
                  <p className="text-xs text-ink-muted">This name appears across the platform and in emails sent to your users.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Platform name">
                  <Input value={form.platformName} onChange={(e) => set('platformName', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Support email">
                  <Input type="email" value={form.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} disabled={loading} placeholder="info@yourcompany.com" />
                </Field>
              </div>
              <p className="text-xs text-ink-subtle">The support email is shown to users who need help and is used as the reply-to address on notifications.</p>
            </CardBody>
            <CardFooter className="justify-end">
              <Button onClick={() => save('Branding saved')} disabled={saving || loading}>{saving ? 'Saving…' : 'Save branding'}</Button>
            </CardFooter>
          </>
        )}

        {tab === 'notifications' && (
          <>
            <CardBody className="space-y-4">
              <Switch label="Billing & payments" description="Failed payments, renewals and invoices" checked={form.notifyBilling} onChange={(v) => set('notifyBilling', v)} />
              <Switch label="Security alerts" description="Suspicious logins and policy changes" checked={form.notifySecurity} onChange={(v) => set('notifySecurity', v)} />
              <Switch label="Product updates" description="New features and platform releases" checked={form.notifyProduct} onChange={(v) => set('notifyProduct', v)} />
              <Switch label="Churn risk" description="Alerts when a company is at risk of churning" checked={form.notifyChurn} onChange={(v) => set('notifyChurn', v)} />
            </CardBody>
            <CardFooter className="justify-end">
              <Button onClick={() => save('Notification preferences saved')} disabled={saving || loading}>{saving ? 'Saving…' : 'Save preferences'}</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
