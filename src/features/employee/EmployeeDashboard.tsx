import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Coffee,
  Droplets,
  Footprints,
  HeartPulse,
  Moon,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { PageHeader, Section } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Gauge } from '@/components/shared/Gauge'
import { KpiCard } from '@/components/shared/KpiCard'
import { TrendArea } from '@/components/shared/Charts'
import { RiskBadge } from '@/components/shared/Badges'
import { useFatigueTrend, useAlerts } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const quickActions = [
  { label: 'Request Break', icon: Coffee, to: '/user/breaks', tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' },
  { label: 'Log Hydration', icon: Droplets, to: '/user/dashboard', tone: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40' },
  { label: 'Start Monitoring', icon: HeartPulse, to: '/user/monitoring', tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' },
  { label: 'View Alerts', icon: Bell, to: '/user/alerts', tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40' },
]

export function EmployeeDashboard() {
  const { user } = useAuth()
  const { data: fatigueTrend } = useFatigueTrend(user?.id)
  const { data: alerts } = useAlerts()
  const myAlerts = alerts.slice(0, 4)

  return (
    <div>
      <PageHeader
        title={`Good shift, ${user?.name.split(' ')[0]}`}
        description="Here's your wellness snapshot for today."
        actions={
          <>
            <Badge tone="success" dot>On shift · Morning</Badge>
            <Link to="/user/monitoring">
              <Button size="sm">
                <HeartPulse className="h-4 w-4" /> Live monitor
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Gauge */}
        <Card className="lg:col-span-1">
          <CardHeader title="Fatigue Index" subtitle="Updated 1 min ago" />
          <CardBody className="flex flex-col items-center">
            <Gauge value={38} label="Current reading" />
            <div className="mt-4 flex w-full items-center justify-between rounded-xl bg-surface-subtle p-3 text-sm">
              <span className="text-ink-muted">Status</span>
              <RiskBadge level="low" />
            </div>
          </CardBody>
        </Card>

        {/* Vitals */}
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
          <KpiCard label="Heart rate" value="74 bpm" icon={<HeartPulse className="h-5 w-5" />} tone="danger" delta={-3} invertDelta hint="Resting · normal range" />
          <KpiCard label="Focus score" value="86%" icon={<TrendingUp className="h-5 w-5" />} tone="success" delta={5} hint="Above your weekly avg" />
          <KpiCard label="Hours on shift" value="5h 12m" icon={<Timer className="h-5 w-5" />} tone="brand" hint="Break due in 48 min" />
          <KpiCard label="Sleep debt" value="0.5h" icon={<Moon className="h-5 w-5" />} tone="purple" delta={-12} invertDelta hint="Recovered overnight" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Today's wellness trend" subtitle="Fatigue, heart rate & focus over the shift" icon={<TrendingUp className="h-4 w-4" />} />
          <CardBody>
            <TrendArea
              data={fatigueTrend}
              xKey="time"
              series={[
                { key: 'fatigue', label: 'Fatigue', color: '#f59e0b' },
                { key: 'focus', label: 'Focus', color: '#10b981' },
                { key: 'heartRate', label: 'Heart rate', color: '#f43f5e' },
              ]}
            />
          </CardBody>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader title="Quick actions" />
          <CardBody className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-start gap-3 rounded-xl border border-line p-4 transition-colors hover:bg-surface-muted"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.tone}`}>
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-ink">{a.label}</span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      <Section className="mt-5" title="Recent alerts" action={<Link to="/user/alerts" className="text-sm font-medium text-brand-600 hover:underline">View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>}>
        <Card>
          <CardBody className="space-y-2 p-3">
            {myAlerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-muted">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{a.message}</p>
                  <p className="text-xs text-ink-subtle">{a.location} · {a.timestamp}</p>
                </div>
                <RiskBadge level={a.severity} />
              </div>
            ))}
          </CardBody>
        </Card>
      </Section>

      {/* Wellness nudges */}
      <Card className="mt-5 border-brand-200 bg-brand-50/40 dark:bg-brand-950/20">
        <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Footprints className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">Time to move</p>
            <p className="text-sm text-ink-muted">You've been stationary for 52 minutes. A short stretch can lower your fatigue index.</p>
          </div>
          <Link to="/user/breaks">
            <Button variant="outline" size="sm">Take a micro-break</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  )
}
