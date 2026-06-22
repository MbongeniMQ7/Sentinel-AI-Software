import { useState } from 'react'
import type { WorkerWithRisk, RiskScore, Alert } from '../../types'
import { RiskGauge } from '../Charts/RiskGauge'
import { RiskHistoryChart } from '../Charts/RiskHistoryChart'
import { AlertPanel } from '../AlertPanel/AlertPanel'
import { RiskBadge } from '../WorkerCard/RiskBadge'
import clsx from 'clsx'

interface Props {
  worker: WorkerWithRisk
  history: RiskScore[]
  alerts: Alert[]
  onAcknowledge: (alert: Alert) => void
}

const tabs = ['Overview', 'History', 'Alerts'] as const
type Tab = (typeof tabs)[number]

export function WorkerDetail({ worker, history, alerts, onAcknowledge }: Props) {
  const [tab, setTab] = useState<Tab>('Overview')
  const unackedCount = alerts.filter((a) => !a.acknowledged).length

  const latestRisk = history[0]

  return (
    <div className="flex h-full flex-col gap-4">
      {/* header */}
      <div className="rounded-xl border border-[#1e2d4a] bg-[#0f1729] p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{worker.name}</h2>
            <p className="text-sm text-gray-400">
              {worker.employee_id} · {worker.role} · {worker.zone}
            </p>
          </div>
          <RiskBadge level={worker.risk_level} score={worker.risk_score} size="lg" />
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-1 rounded-lg border border-[#1e2d4a] bg-[#0f1729] p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'relative flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              tab === t
                ? 'bg-[#1e2d4a] text-white'
                : 'text-gray-400 hover:text-gray-200',
            )}
          >
            {t}
            {t === 'Alerts' && unackedCount > 0 && (
              <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unackedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#1e2d4a] bg-[#0f1729] p-4">
        {tab === 'Overview' && (
          <div className="flex flex-col items-center gap-6">
            <RiskGauge score={worker.risk_score} level={worker.risk_level} size={180} />

            {latestRisk && (
              <div className="w-full space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">Signal Breakdown</h3>
                {[
                  { label: 'Fatigue', value: latestRisk.fatigue_component, color: '#00d4ff' },
                  { label: 'Biometric', value: latestRisk.biometric_component, color: '#22c55e' },
                  { label: 'Environment', value: latestRisk.environmental_component, color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-medium">{value.toFixed(1)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${value}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}

                {latestRisk.contributing_factors.length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-300">
                      Contributing Factors
                    </h3>
                    <ul className="space-y-1">
                      {latestRisk.contributing_factors.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'History' && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-300">Risk Score History</h3>
            <RiskHistoryChart history={history} height={240} />
          </div>
        )}

        {tab === 'Alerts' && (
          <AlertPanel alerts={alerts} onAcknowledge={onAcknowledge} />
        )}
      </div>
    </div>
  )
}
