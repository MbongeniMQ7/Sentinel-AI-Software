import { useEffect, useRef, useCallback } from 'react'
import type { WSEvent } from '../types'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws/risk-feed'

export function useRiskFeed(onEvent: (event: WSEvent) => void): void {
  const ws = useRef<WebSocket | null>(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const connect = useCallback(() => {
    const socket = new WebSocket(WS_URL)

    socket.onmessage = (msg) => {
      try {
        const event: WSEvent = JSON.parse(msg.data)
        onEventRef.current(event)
      } catch {
        // ignore malformed frames
      }
    }

    socket.onclose = () => {
      // Reconnect after 3 s on unexpected close
      setTimeout(connect, 3000)
    }

    socket.onerror = () => socket.close()

    // Keep-alive ping every 25 s
    const ping = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.send('ping')
    }, 25_000)

    socket.addEventListener('close', () => clearInterval(ping))

    ws.current = socket
  }, [])

  useEffect(() => {
    connect()
    return () => {
      ws.current?.close()
    }
  }, [connect])
}
