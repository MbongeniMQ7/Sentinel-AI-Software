import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { logoUrl } from '@/components/shared/Logo'
import { workerPhotos } from '@/lib/avatars'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  step: 1 | 2 | 3
}

// Loose, overlapping cluster of worker portraits for the illustration panel.
const clusterAvatars = [
  { src: workerPhotos[0], className: 'left-2 top-10 h-16 w-16' },
  { src: workerPhotos[3], className: 'left-1/2 top-0 h-20 w-20 -translate-x-1/2' },
  { src: workerPhotos[6], className: 'right-3 top-12 h-16 w-16' },
  { src: workerPhotos[8], className: 'left-1/2 bottom-0 h-20 w-20 -translate-x-1/2' },
]

export function AuthLayout({ title, subtitle, children, step }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-brand-50 px-4 py-10 dark:bg-surface-subtle">
      {/* Organic background blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-200/60 blur-2xl dark:bg-brand-900/30" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-brand-300/50 blur-2xl dark:bg-brand-800/30" />
      <div className="pointer-events-none absolute right-1/4 top-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl dark:bg-emerald-900/20" />

      {/* Floating card */}
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[28px] bg-surface shadow-[0_30px_80px_-20px_rgba(31,67,245,0.35)] ring-1 ring-line/60 lg:grid-cols-2">
        {/* Left illustration panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-10 lg:flex">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-[45%] bg-white/10" />

          <Link to="/" className="relative flex items-center gap-2.5 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 p-1">
              <img src={logoUrl} alt="SentinelAI" className="h-full w-full object-contain" draggable={false} />
            </div>
            <span className="text-lg font-bold">SentinelAI</span>
          </Link>

          <div className="relative">
            <h2 className="text-3xl font-bold leading-tight text-white">Welcome to SentinelAI!</h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-100">
              We keep your people alert, safe and at their best — protecting thousands of workers every shift.
            </p>

            {/* Avatar cluster */}
            <div className="relative mx-auto mt-10 h-44 w-64">
              {clusterAvatars.map((a, i) => (
                <img
                  key={i}
                  src={a.src}
                  alt=""
                  draggable={false}
                  className={`absolute rounded-full border-4 border-white/90 object-cover shadow-lg ${a.className}`}
                />
              ))}
            </div>
          </div>

          {/* Carousel dots driven by the current step */}
          <div className="relative flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-white' : 'w-4 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src={logoUrl} alt="SentinelAI" className="h-9 w-9 object-contain" draggable={false} />
            <span className="text-lg font-bold text-ink">SentinelAI</span>
          </Link>

          <div className="mb-6 flex items-center gap-2 lg:hidden">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand-600' : 'bg-line'}`} />
            ))}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}
