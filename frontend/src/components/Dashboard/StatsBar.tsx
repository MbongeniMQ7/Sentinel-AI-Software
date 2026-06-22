import type { WorkerWithRisk } from '../../types'
import clsx from 'clsx'

interface Props {
  workers: WorkerWithRisk[]
}

const levelCounts = (workers: WorkerWithRisk[]) => ({
  LOW: workers.filter((w) => w.risk_level === 'LOW').length,
  MEDIUM: workers.filter((w) => w.risk_level === 'MEDIUM').length,
  HIGH: workers.filter((w) => w.risk_level === 'HIGH').length,
  CRITICAL: workers.filter((w) => w.risk_level === 'CRITICAL').length,
})

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  color?: string
  pulse?: boolean
}

function StatCard({ label, value, sub, color = 'text-white', pulse }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#1e2d4a] bg-[#0f1729] p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={clsx('mt-1 text-3xl font-bold tabular-nums', color, pulse && 'animate-pulse')}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export function StatsBar({ workers }: Props) {
  const counts = levelCounts(workers)
  const active = workers.filter((w) => w.status === 'ACTIVE').length
  const avgRisk =
    workers.length > 0
      ? (workers.reduce((s, w) => s + w.risk_score, 0) / workers.length).toFixed(1)
      : '—'

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard label="Total Workers" value={workers.length} sub={`${active} active`} />
      <StatCard label="Avg Risk Score" value={avgRisk} color="text-[#00d4ff]" />
      <StatCard label="Low Risk" value={counts.LOW} color="text-green-400" />
      <StatCard label="Medium Risk" value={counts.MEDIUM} color="text-amber-400" />
      <StatCard
        label="High Risk"
        value={counts.HIGH}
        color="text-red-400"
        pulse={counts.HIGH > 0}
      />
      <StatCard
        label="Critical"
        value={counts.CRITICAL}
        color="text-red-300"
        pulse={counts.CRITICAL > 0}
      />
    </div>
  )
}
