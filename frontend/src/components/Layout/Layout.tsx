import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function Layout({ children }: Props) {
  return (
    <div className="flex h-screen flex-col bg-[#0a0f1e] text-gray-100">
      {/* navbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1e2d4a] px-6">
        <div className="flex items-center gap-3">
          {/* logo mark */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d4ff]/10 text-[#00d4ff]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">Sentinel AI</span>
            <span className="ml-2 text-xs text-gray-500">Workforce Safety Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="hidden sm:inline">Real-time · Edge AI · Fatigue Detection</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="flex-1 overflow-hidden p-4">{children}</main>
    </div>
  )
}
