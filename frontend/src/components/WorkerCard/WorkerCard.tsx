import type { WorkerWithRisk } from '../../types'
import { RiskBadge } from './RiskBadge'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

interface Props {
  worker: WorkerWithRisk
  onClick?: () => void
  selected?: boolean
}

const statusDot: Record<string, string> = {
  ACTIVE: 'bg-green-400',
  INACTIVE: 'bg-gray-500',
  ON_BREAK: 'bg-amber-400',
  OFFLINE: 'bg-red-500',
}

export function WorkerCard({ worker, onClick, selected }: Props) {
  const lastSeen = worker.last_seen
    ? formatDistanceToNow(new Date(worker.last_seen), { addSuffix: true })
    : 'No data yet'

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left rounded-xl border p-4 transition-all duration-200',
        'bg-[#0f1729] hover:bg-[#152040]',
        selected
          ? 'border-[#00d4ff]/60 shadow-[0_0_12px_rgba(0,212,255,0.15)]'
          : 'border-[#1e2d4a] hover:border-[#2a3f60]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={clsx(
              'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
              statusDot[worker.status] ?? 'bg-gray-500',
            )}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{worker.name}</p>
            <p className="truncate text-xs text-gray-400">
              {worker.role} · {worker.zone}
            </p>
          </div>
        </div>
        <RiskBadge level={worker.risk_level} score={worker.risk_score} size="sm" />
      </div>

      {/* risk bar */}
      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500',
              worker.risk_level === 'LOW' && 'bg-green-500',
              worker.risk_level === 'MEDIUM' && 'bg-amber-500',
              worker.risk_level === 'HIGH' && 'bg-red-500',
              worker.risk_level === 'CRITICAL' && 'bg-red-600 animate-pulse',
            )}
            style={{ width: `${worker.risk_score}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[10px] text-gray-500">{lastSeen}</p>
      </div>
    </button>
  )
}
