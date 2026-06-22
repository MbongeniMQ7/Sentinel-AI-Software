import { useState } from 'react'
import { Bell, Copy, Eye, EyeOff, KeyRound, Palette, Plus, RefreshCw, Shield, Webhook } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Switch } from '@/components/ui/Switch'
import { Field, Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const apiKeys = [
  { id: 'key_live_8f2a', label: 'Production', created: 'Mar 12, 2026', last: '2h ago' },
  { id: 'key_test_3b9c', label: 'Sandbox', created: 'Jan 4, 2026', last: '5d ago' },
]

export function OwnerSettings() {
  const [tab, setTab] = useState('branding')
  const [accent, setAccent] = useState('#1f43f5')
  const [showKey, setShowKey] = useState(false)
  const [notif, setNotif] = useState({ billing: true, security: true, product: false, churn: true })

  const accents = ['#1f43f5', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4']

  return (
    <div>
      <PageHeader title="Settings" description="Configure branding, security, API access and notifications." />

      <Card>
        <div className="px-4 pt-3">
          <Tabs
            tabs={[
              { id: 'branding', label: 'Branding' },
              { id: 'security', label: 'Security' },
              { id: 'api', label: 'API & Webhooks' },
              { id: 'notifications', label: 'Notifications' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'branding' && (
          <>
            <CardBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Platform name"><Input defaultValue="SentinelAI" /></Field>
                <Field label="Support email"><Input type="email" defaultValue="support@sentinel.ai" /></Field>
              </div>
              <Field label="Brand logo">
                <div className="flex items-center gap-4 rounded-xl border border-dashed border-line p-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><ShieldCheck className="h-6 w-6" /></span>
                  <div><p className="text-sm font-medium text-ink">sentinel-logo.svg</p><p className="text-xs text-ink-subtle">SVG, PNG up to 2MB</p></div>
                  <Button variant="outline" size="sm" className="ml-auto">Upload</Button>
                </div>
              </Field>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink-muted">Accent color</label>
                <div className="flex gap-2">
                  {accents.map((c) => (
                    <button key={c} onClick={() => setAccent(c)} className={cn('h-9 w-9 rounded-lg ring-2 ring-offset-2 ring-offset-surface transition', accent === c ? 'ring-ink' : 'ring-transparent')} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </CardBody>
            <CardFooter className="justify-end"><Button variant="outline">Reset</Button><Button>Save branding</Button></CardFooter>
          </>
        )}

        {tab === 'security' && (
          <>
            <CardBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Minimum password length"><Select defaultValue="12"><option>8</option><option>12</option><option>16</option></Select></Field>
                <Field label="Session timeout"><Select defaultValue="30"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option></Select></Field>
              </div>
              <div className="space-y-4 rounded-xl border border-line p-4">
                <Switch label="Enforce 2FA for all admins" description="Require two-factor authentication org-wide" checked onChange={() => {}} />
                <Switch label="SSO / SAML" description="Allow single sign-on via your IdP" checked onChange={() => {}} />
                <Switch label="IP allowlist" description="Restrict console access to approved IPs" checked={false} onChange={() => {}} />
                <Switch label="Audit log retention (2 years)" description="Extended immutable log storage" checked onChange={() => {}} />
              </div>
            </CardBody>
            <CardFooter className="justify-end"><Button>Update security</Button></CardFooter>
          </>
        )}

        {tab === 'api' && (
          <CardBody className="space-y-5">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-ink-subtle" /><p className="text-sm font-semibold text-ink">API keys</p></div>
                <Button size="sm"><Plus className="h-4 w-4" /> Create key</Button>
              </div>
              <div className="space-y-2">
                {apiKeys.map((k) => (
                  <div key={k.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                    <Badge tone={k.label === 'Production' ? 'success' : 'info'}>{k.label}</Badge>
                    <code className="flex-1 truncate font-mono text-xs text-ink-muted">{showKey ? `sk_${k.id}_••••4821` : '••••••••••••••••'}</code>
                    <button onClick={() => setShowKey((s) => !s)} className="text-ink-subtle hover:text-ink">{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button className="text-ink-subtle hover:text-ink"><Copy className="h-4 w-4" /></button>
                    <button className="text-ink-subtle hover:text-ink"><RefreshCw className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2"><Webhook className="h-4 w-4 text-ink-subtle" /><p className="text-sm font-semibold text-ink">Webhooks</p></div>
              <Field label="Endpoint URL"><Input placeholder="https://api.yourapp.com/webhooks/sentinel" /></Field>
              <div className="mt-3 flex flex-wrap gap-2">
                {['alert.created', 'alert.escalated', 'company.updated', 'billing.paid'].map((ev) => (
                  <Badge key={ev} tone="neutral" className="font-mono">{ev}</Badge>
                ))}
              </div>
            </div>
          </CardBody>
        )}

        {tab === 'notifications' && (
          <>
            <CardBody className="space-y-4">
              <Switch label="Billing & payments" description="Failed payments, renewals and invoices" checked={notif.billing} onChange={(v) => setNotif({ ...notif, billing: v })} />
              <Switch label="Security alerts" description="Suspicious logins and policy changes" checked={notif.security} onChange={(v) => setNotif({ ...notif, security: v })} />
              <Switch label="Product updates" description="New features and platform releases" checked={notif.product} onChange={(v) => setNotif({ ...notif, product: v })} />
              <Switch label="Churn risk" description="Alerts when a company is at risk of churning" checked={notif.churn} onChange={(v) => setNotif({ ...notif, churn: v })} />
            </CardBody>
            <CardFooter className="justify-end"><Button>Save preferences</Button></CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
