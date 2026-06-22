import { useMemo, useState } from 'react'
import { Activity, Building2, Cpu, Search, Settings, ShieldAlert, UserPlus, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/States'
import { auditLogs, companies } from '@/lib/mockData'
import { cn } from '@/lib/utils'

type ActivityKind = 'company' | 'user' | 'device' | 'billing' | 'security' | 'system'

const kinds: Record<ActivityKind, { icon: typeof Activity; tone: string }> = {
  company: { icon: Building2, tone: 'bg-brand-50 text-brand-600 dark:bg-brand-950/40' },
  user: { icon: UserPlus, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40' },
  device: { icon: Cpu, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40' },
  billing: { icon: CreditCard, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' },
  security: { icon: ShieldAlert, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' },
  system: { icon: Settings, tone: 'bg-surface-muted text-ink-muted' },
}

const events = auditLogs.map((l, i) => {
  const kindList: ActivityKind[] = ['company', 'user', 'device', 'billing', 'security', 'system']
  const kind = kindList[i % kindList.length]
  const company = companies[i % companies.length].name
  const messages: Record<ActivityKind, string> = {
    company: `New company onboarded: ${company}`,
    user: `${l.actor} ${l.action}`,
    device: `Device fleet update at ${company}`,
    billing: `Payment received from ${company}`,
    security: `Security policy changed by ${l.actor}`,
    system: `System ${l.action}`,
  }
  return { id: l.id, kind, message: messages[kind], company, time: l.timestamp, ip: l.ip }
})

export function OwnerActivity() {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')

  const filtered = useMemo(
    () => events.filter((e) => (kind === 'all' || e.kind === kind) && (!query || e.message.toLowerCase().includes(query.toLowerCase()))),
    [query, kind],
  )

  return (
    <div>
      <PageHeader title="Activity" description="System-wide activity stream across all companies." />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Search activity…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <Select value={kind} onChange={(e) => setKind(e.target.value)} className="sm:ml-auto sm:w-48">
            <option value="all">All activity</option>
            <option value="company">Companies</option>
            <option value="user">Users</option>
            <option value="device">Devices</option>
            <option value="billing">Billing</option>
            <option value="security">Security</option>
            <option value="system">System</option>
          </Select>
        </div>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState icon={<Activity className="h-6 w-6" />} title="No activity" description="No events match your filters." />
          ) : (
            <div className="relative space-y-1 pl-2">
              {filtered.map((e) => {
                const k = kinds[e.kind]
                return (
                  <div key={e.id} className="flex gap-4 rounded-xl px-2 py-3 hover:bg-surface-muted">
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', k.tone)}><k.icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{e.message}</p>
                      <p className="text-xs text-ink-subtle">{e.company} · {e.time}</p>
                    </div>
                    <Badge tone="neutral" className="hidden font-mono sm:inline-flex">{e.ip}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
