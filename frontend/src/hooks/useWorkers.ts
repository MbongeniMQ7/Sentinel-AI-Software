import { useState, useEffect, useCallback } from 'react'
import { workerApi } from '../services/api'
import type { WorkerWithRisk } from '../types'

export function useWorkers(refreshIntervalMs = 10_000) {
  const [workers, setWorkers] = useState<WorkerWithRisk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await workerApi.list()
      setWorkers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, refreshIntervalMs)
    return () => clearInterval(interval)
  }, [fetch, refreshIntervalMs])

  const updateWorker = useCallback((updated: WorkerWithRisk) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === updated.worker_id ? { ...w, ...updated } : w))
    )
  }, [])

  return { workers, loading, error, refetch: fetch, updateWorker }
}
