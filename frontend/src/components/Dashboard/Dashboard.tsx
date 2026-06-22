import { useState, useCallback } from 'react'
import type { WorkerWithRisk, RiskScore, Alert, WSEvent } from '../../types'
import { WorkerCard } from '../WorkerCard/WorkerCard'
import { WorkerDetail } from './WorkerDetail'
import { StatsBar } from './StatsBar'
import { useWorkers } from '../../hooks/useWorkers'
import { useRiskFeed } from '../../hooks/useRiskFeed'
import { riskApi, alertApi } from '../../services/api'
import { useEffect } from 'react'

export function Dashboard() {
  const { workers, loading, error, updateWorker } = useWorkers()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [history, setHistory] = useState<RiskScore[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [wsStatus, setWsStatus] = useState<'connecting' | 'live' | 'error'>('connecting')

  const selectedWorker = workers.find((w) => w.id === selectedId) ?? null

  // Load detail data when worker is selected
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false

    riskApi.history(selectedId, 60).then((h) => {
      if (!cancelled) setHistory(h)
    })
    alertApi.list(selectedId, 50).then((a) => {
      if (!cancelled) setAlerts(a)
    })

    return () => {
      cancelled = true
    }
  }, [selectedId])

  // Real-time feed
  const handleWSEvent = useCallback(
    (event: WSEvent) => {
      setWsStatus('live')
      if (event.event === 'risk_update') {
        const risk = event.data as RiskScore
        updateWorker({
          ...workers.find((w) => w.id === risk.worker_id)!,
          risk_score: risk.score,
          risk_level: risk.level,
          last_seen: risk.timestamp,
        } as WorkerWithRisk)
        if (risk.worker_id === selectedId) {
          setHistory((prev) => [risk, ...prev].slice(0, 60))
        }
      }
      if (event.event === 'alert') {
        const alert = event.data as Alert
        if (alert.worker_id === selectedId) {
          setAlerts((prev) => [alert, ...prev])
        }
      }
    },
    [workers, selectedId, updateWorker],
  )

  useRiskFeed(handleWSEvent)

  const handleAcknowledge = useCallback((updated: Alert) => {
    setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
          Loading workers…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">
        <p>⚠ {error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* stats */}
      <StatsBar workers={workers} />

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* worker list */}
        <div className="flex w-72 shrink-0 flex-col gap-2 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">Workers</h2>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${wsStatus === 'live' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}
              />
              <span className="text-xs text-gray-500 capitalize">{wsStatus}</span>
            </div>
          </div>
          {workers.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-8">No workers registered yet</p>
          ) : (
            workers.map((w) => (
              <WorkerCard
                key={w.id}
                worker={w}
                selected={w.id === selectedId}
                onClick={() => setSelectedId(w.id)}
              />
            ))
          )}
        </div>

        {/* detail panel */}
        <div className="flex-1 overflow-hidden">
          {selectedWorker ? (
            <WorkerDetail
              worker={selectedWorker}
              history={history}
              alerts={alerts}
              onAcknowledge={handleAcknowledge}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-[#1e2d4a] bg-[#0f1729] text-gray-500">
              <div className="text-center">
                <p className="text-4xl">👤</p>
                <p className="mt-2 text-sm">Select a worker to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
