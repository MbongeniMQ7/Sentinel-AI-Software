import { useEffect, useState } from 'react'
import {
  Activity,
  Camera,
  CircleDot,
  Eye,
  Gauge as GaugeIcon,
  HeartPulse,
  Maximize2,
  Mic,
  Pause,
  Play,
  ScanFace,
  Settings2,
  Video,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { TrendLine } from '@/components/shared/Charts'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const overlays = [
  { label: 'Eye closure', value: 8, tone: 'success' as const, icon: Eye },
  { label: 'Head pose', value: 12, tone: 'success' as const, icon: ScanFace },
  { label: 'Yawn frequency', value: 34, tone: 'warning' as const, icon: Activity },
  { label: 'Attention', value: 88, tone: 'success' as const, icon: GaugeIcon },
]

export function EmployeeMonitoring() {
  const { user } = useAuth()
  const [live, setLive] = useState(true)
  const [series, setSeries] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ({ t: i, fatigue: 30 + Math.round(Math.random() * 15), hr: 70 + Math.round(Math.random() * 10) })),
  )

  useEffect(() => {
    if (!live) return
    const id = setInterval(() => {
      setSeries((prev) => {
        const next = prev.slice(1)
        const last = prev[prev.length - 1]
        next.push({ t: last.t + 1, fatigue: Math.max(15, Math.min(70, last.fatigue + (Math.random() * 10 - 5))), hr: Math.max(60, Math.min(95, last.hr + (Math.random() * 6 - 3))) })
        return next
      })
    }, 1500)
    return () => clearInterval(id)
  }, [live])

  return (
    <div>
      <PageHeader
        title="Live Monitoring"
        description="Real-time, on-edge analysis of your wellness signals."
        actions={
          <>
            <Badge tone={live ? 'danger' : 'neutral'} dot>{live ? 'LIVE' : 'Paused'}</Badge>
            <Button variant="outline" size="sm" onClick={() => setLive((l) => !l)}>
              {live ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {live ? 'Pause' : 'Resume'}
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Camera feed */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="relative aspect-video w-full bg-slate-900">
            {/* Simulated camera scene */}
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt="Live operator feed"
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
                  live ? 'opacity-60' : 'opacity-25 grayscale',
                )}
                draggable={false}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-slate-900/50" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(53,99,255,0.25),transparent)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <ScanFace className="h-28 w-28 text-white/20" />
                {live && <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-emerald-400/40" />}
              </div>
            </div>

            {/* AI bounding box overlay */}
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-emerald-400/80">
              <span className="absolute -top-6 left-0 rounded bg-emerald-400 px-1.5 py-0.5 text-[10px] font-semibold text-slate-900">
                Operator · 99% match
              </span>
              <span className="absolute -bottom-6 right-0 rounded bg-emerald-400/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-900">
                Fatigue: Low
              </span>
            </div>

            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Badge tone="danger" className="bg-rose-500/90 text-white ring-0">
                  <CircleDot className="h-3 w-3" /> REC
                </Badge>
                <Badge className="bg-black/40 text-white ring-0">Cam A-12 · 1080p</Badge>
              </div>
              <div className="flex gap-1.5">
                <button className="rounded-lg bg-black/40 p-1.5 text-white hover:bg-black/60"><Mic className="h-4 w-4" /></button>
                <button className="rounded-lg bg-black/40 p-1.5 text-white hover:bg-black/60"><Settings2 className="h-4 w-4" /></button>
                <button className="rounded-lg bg-black/40 p-1.5 text-white hover:bg-black/60"><Maximize2 className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Bottom metrics strip */}
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-px bg-white/10 p-px">
              {[
                { label: 'Frame rate', value: '30 fps' },
                { label: 'Latency', value: '184 ms' },
                { label: 'Confidence', value: '97%' },
              ].map((m) => (
                <div key={m.label} className="bg-slate-900/80 px-3 py-2 text-center">
                  <p className="text-sm font-semibold text-white">{m.value}</p>
                  <p className="text-[10px] text-white/60">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <CardBody>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Video className="h-3.5 w-3.5" /> Processing happens on-device. No raw video leaves this camera.
            </div>
          </CardBody>
        </Card>

        {/* Detection overlay metrics */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="AI detection overlay" icon={<Camera className="h-4 w-4" />} />
            <CardBody className="space-y-4">
              {overlays.map((o) => (
                <div key={o.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-muted">
                      <o.icon className="h-4 w-4" /> {o.label}
                    </span>
                    <span className="font-medium text-ink">{o.value}%</span>
                  </div>
                  <Progress value={o.value} tone={o.tone} />
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Live vitals" icon={<HeartPulse className="h-4 w-4" />} />
            <CardBody>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-subtle p-3">
                  <p className="text-2xl font-bold text-ink">{Math.round(series[series.length - 1].hr)}</p>
                  <p className="text-xs text-ink-muted">Heart rate (bpm)</p>
                </div>
                <div className="rounded-xl bg-surface-subtle p-3">
                  <p className="text-2xl font-bold text-ink">{Math.round(series[series.length - 1].fatigue)}</p>
                  <p className="text-xs text-ink-muted">Fatigue index</p>
                </div>
              </div>
              <TrendLine data={series} xKey="t" height={120} series={[{ key: 'fatigue', color: '#f59e0b' }, { key: 'hr', color: '#f43f5e' }]} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
