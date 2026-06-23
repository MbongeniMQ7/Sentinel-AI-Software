import { useEffect, useMemo } from 'react'
import {
  Activity,
  BatteryCharging,
  BatteryWarning,
  Gauge as GaugeIcon,
  HeartPulse,
  RefreshCw,
  ShieldCheck,
  Watch,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/shared/States'
import { RiskBadge } from '@/components/shared/Badges'
import { TrendLine } from '@/components/shared/Charts'
import { useAuth } from '@/lib/auth'
import { useEmployees, useDevices, useFatigueTrend } from '@/lib/api'

export function EmployeeMonitoring() {
  const { user } = useAuth()
  const { data: employees, refetch: refetchEmployees } = useEmployees()
  const { data: devices, refetch: refetchDevices } = useDevices()
  const { data: trend, refetch: refetchTrend } = useFatigueTrend(user?.id)

  const me = useMemo(() => employees.find((e) => e.id === user?.id), [employees, user?.id])
  const band = useMemo(
    () =>
      devices.find(
        (d) => d.type === 'Wearable Band' && (d.assignedTo === user?.name || d.assignedTo === me?.name),
      ),
    [devices, user?.name, me?.name],
  )

  // Poll for fresh wristband readings every 15s (real data, no simulation).
  useEffect(() => {
    const id = setInterval(() => {
      refetchEmployees()
      refetchDevices()
      refetchTrend()
    }, 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const refreshAll = () => {
    refetchEmployees()
    refetchDevices()
    refetchTrend()
  }

  const online = band?.status === 'online'
  const fatigue = me?.fatigue ?? 0
  const heartRate = me?.heartRate ?? 0
  const fatigueTone = fatigue >= 70 ? 'danger' : fatigue >= 40 ? 'warning' : 'success'

  return (
    <div>
      <PageHeader
        title="Live Monitoring"
        description="Real-time wellness signals from your SentinelAI wristband."
        actions={
          <>
            <Badge tone={online ? 'success' : 'neutral'} dot>
              {online ? 'Connected' : 'Offline'}
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshAll}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </>
        }
      />

      {!me ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Watch className="h-6 w-6" />}
              title="No monitoring profile yet"
              description="Your wristband readings will appear here once your manager has set up your monitoring profile."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Wristband device */}
          <Card className="lg:col-span-1">
            <CardHeader title="Wristband" icon={<Watch className="h-4 w-4" />} />
            <CardBody className="space-y-4">
              {band ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-ink">{band.name}</p>
                      <p className="text-xs text-ink-subtle">{band.location}</p>
                    </div>
                    <Badge tone={online ? 'success' : 'neutral'} className="capitalize">
                      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />} {band.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-ink-muted">
                        {band.battery > 20 ? <BatteryCharging className="h-4 w-4" /> : <BatteryWarning className="h-4 w-4" />} Battery
                      </span>
                      <span className="font-medium text-ink">{band.battery}%</span>
                    </div>
                    <Progress value={band.battery} tone={band.battery > 20 ? 'success' : 'danger'} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-surface-subtle p-3">
                      <p className="text-xs text-ink-subtle">Firmware</p>
                      <p className="font-mono text-ink">{band.firmware}</p>
                    </div>
                    <div className="rounded-xl bg-surface-subtle p-3">
                      <p className="text-xs text-ink-subtle">Last seen</p>
                      <p className="text-ink">{band.lastSeen}</p>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<Watch className="h-6 w-6" />}
                  title="No wristband paired"
                  description="Ask your manager to assign a SentinelAI wristband to your profile."
                />
              )}
            </CardBody>
          </Card>

          {/* Live vitals */}
          <div className="space-y-5 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardBody className="space-y-1">
                  <span className="flex items-center gap-2 text-xs text-ink-muted"><HeartPulse className="h-4 w-4 text-rose-500" /> Heart rate</span>
                  <p className="text-3xl font-bold text-ink">{heartRate || '—'}<span className="ml-1 text-sm font-normal text-ink-subtle">bpm</span></p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="space-y-1">
                  <span className="flex items-center gap-2 text-xs text-ink-muted"><GaugeIcon className="h-4 w-4 text-amber-500" /> Fatigue index</span>
                  <p className="text-3xl font-bold text-ink">{fatigue}</p>
                  <Progress value={fatigue} tone={fatigueTone} />
                </CardBody>
              </Card>
              <Card>
                <CardBody className="space-y-1">
                  <span className="flex items-center gap-2 text-xs text-ink-muted"><ShieldCheck className="h-4 w-4 text-brand-600" /> Risk level</span>
                  <div className="pt-1"><RiskBadge level={me.riskLevel} /></div>
                  <p className="pt-1 text-xs text-ink-subtle capitalize">Status: {me.status.replace('-', ' ')}</p>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title="Fatigue & heart-rate trend" icon={<Activity className="h-4 w-4" />} />
              <CardBody>
                {trend.length === 0 ? (
                  <EmptyState
                    icon={<Activity className="h-6 w-6" />}
                    title="Awaiting readings"
                    description="Trend data will appear as your wristband reports readings."
                  />
                ) : (
                  <TrendLine
                    data={trend}
                    xKey="time"
                    height={180}
                    series={[
                      { key: 'fatigue', color: '#f59e0b' },
                      { key: 'heartRate', color: '#f43f5e' },
                    ]}
                  />
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
