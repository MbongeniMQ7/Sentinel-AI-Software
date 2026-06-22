import { useState } from 'react'
import { Bell, Building2, Clock, Shield, SlidersHorizontal, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Field, Input, Select } from '@/components/ui/Input'

export function ManagerSettings() {
  const [prefs, setPrefs] = useState({ critical: true, digest: true, escalate: true, autoApprove: false, ppe: true })

  return (
    <div>
      <PageHeader title="Settings" description="Configure your manager console preferences." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Team & defaults" subtitle="Operational defaults for your teams" icon={<Building2 className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <Field label="Default shift"><Select defaultValue="Morning"><option>Morning</option><option>Evening</option><option>Night</option></Select></Field>
            <Field label="Fatigue alert threshold"><Select defaultValue="60"><option value="50">50 — Conservative</option><option value="60">60 — Balanced</option><option value="75">75 — Permissive</option></Select></Field>
            <Field label="Default break length"><Select defaultValue="15"><option>10</option><option>15</option><option>30</option></Select></Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="What you get notified about" icon={<Bell className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <Switch label="Critical alerts" description="Immediate push for critical fatigue events" checked={prefs.critical} onChange={(v) => setPrefs({ ...prefs, critical: v })} />
            <Switch label="Daily digest" description="Summary of your team's wellness each morning" checked={prefs.digest} onChange={(v) => setPrefs({ ...prefs, digest: v })} />
            <Switch label="Escalation pings" description="Notify when an alert escalates to you" checked={prefs.escalate} onChange={(v) => setPrefs({ ...prefs, escalate: v })} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Automation" subtitle="Reduce manual workload" icon={<SlidersHorizontal className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <Switch label="Auto-approve short breaks" description="Approve breaks under 10 minutes automatically" checked={prefs.autoApprove} onChange={(v) => setPrefs({ ...prefs, autoApprove: v })} />
            <Switch label="Auto-escalate PPE breaches" description="Escalate helmet/PPE alerts to safety officer" checked={prefs.ppe} onChange={(v) => setPrefs({ ...prefs, ppe: v })} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Security & access" subtitle="Account protection" icon={<Shield className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-line p-4">
              <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-ink-subtle" /><div><p className="text-sm font-medium text-ink">Session timeout</p><p className="text-xs text-ink-muted">Auto sign-out after inactivity</p></div></div>
              <Select defaultValue="30" className="w-28"><option value="15">15 min</option><option value="30">30 min</option><option value="60">1 hour</option></Select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-line p-4">
              <div className="flex items-center gap-3"><Users className="h-5 w-5 text-ink-subtle" /><div><p className="text-sm font-medium text-ink">Delegate access</p><p className="text-xs text-ink-muted">Allow a backup manager when away</p></div></div>
              <Switch label="" checked={false} onChange={() => {}} />
            </div>
          </CardBody>
          <CardFooter className="justify-end">
            <Button variant="outline">Reset</Button>
            <Button>Save settings</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
