import { useState } from 'react'
import type { Alert } from '../../types'
import { RiskBadge } from '../WorkerCard/RiskBadge'
import { alertApi } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

interface Props {
  alerts: Alert[]
  onAcknowledge?: (alert: Alert) => void
}

const alertTypeLabel: Record<string, string> = {
  FATIGUE: '😴 Fatigue',
  HEART_RATE: '💓 Heart Rate',
  SKIN_CONDUCTANCE: '⚡ Stress',
  PERCLOS: '👁 PERCLOS',
  YAWNING: '🥱 Yawning',
  INACTIVITY: '🚨 Inactivity',
}

export function AlertPanel({ alerts, onAcknowledge }: Props) {
  const [acknowledging, setAcknowledging] = useState<string | null>(null)

  const handleAck = async (alert: Alert) => {
    setAcknowledging(alert.id)
    try {
      const updated = await alertApi.acknowledge(alert.id, 'Supervisor')
      onAcknowledge?.(updated)
    } catch {
      // ignore
    } finally {
      setAcknowledging(null)
    }
  }

  const unacked = alerts.filter((a) => !a.acknowledged)

  if (unacked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <span className="text-4xl">✅</span>
        <p className="mt-2 text-sm">All clear – no active alerts</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {unacked.map((alert) => (
        <li
          key={alert.id}
          className={clsx(
            'rounded-lg border p-3 transition-all',
            alert.risk_level === 'CRITICAL'
              ? 'border-red-600/60 bg-red-900/20'
              : 'border-[#1e2d4a] bg-[#0f1729]',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-300">
                  {alertTypeLabel[alert.alert_type] ?? alert.alert_type}
                </span>
                <RiskBadge level={alert.risk_level} size="sm" />
              </div>
              <p className="mt-0.5 text-xs text-gray-400 break-words">{alert.message}</p>
              <p className="mt-1 text-[10px] text-gray-600">
                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
              </p>
            </div>
            <button
              onClick={() => handleAck(alert)}
              disabled={acknowledging === alert.id}
              className="shrink-0 rounded-md bg-[#1e2d4a] px-2 py-1 text-xs text-gray-300 hover:bg-[#2a3f60] disabled:opacity-50 transition-colors"
            >
              {acknowledging === alert.id ? '…' : 'Ack'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
