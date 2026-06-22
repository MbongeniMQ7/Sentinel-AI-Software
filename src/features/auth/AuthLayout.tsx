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
  { src: workerPhotos[0], className: 'left-0 top-12 h-20 w-20' },
  { src: workerPhotos[3], className: 'left-1/2 top-0 h-24 w-24 -translate-x-1/2' },
  { src: workerPhotos[6], className: 'right-0 top-14 h-20 w-20' },
  { src: workerPhotos[8], className: 'left-1/2 bottom-0 h-24 w-24 -translate-x-1/2' },
]

export function AuthLayout({ title, subtitle, children, step }: AuthLayoutProps) {
  return (
    <div className="relative grid min-h-full w-full overflow-hidden bg-brand-50 dark:bg-surface-subtle lg:grid-cols-2">
      {/* Left illustration panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-12 lg:flex">
        <div className="absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-white/10" />
        <div className="absolute -bottom-28 -left-16 h-96 w-96 rounded-[45%] bg-white/10" />

        <Link to="/" className="relative flex items-center gap-2.5 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 p-1">
            <img src={logoUrl} alt="SentinelAI" className="h-full w-full object-contain" draggable={false} />
          </div>
          <span className="text-xl font-bold">SentinelAI</span>
        </Link>

        <div className="relative mx-auto w-full max-w-md">
          <h2 className="text-4xl font-bold leading-tight text-white">Welcome to SentinelAI!</h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-brand-100">
            We keep your people alert, safe and at their best — protecting thousands of workers every shift.
          </p>

          {/* Avatar cluster */}
          <div className="relative mx-auto mt-14 h-56 w-80">
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
      <div className="flex flex-col justify-center bg-surface px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src={logoUrl} alt="SentinelAI" className="h-9 w-9 object-contain" draggable={false} />
            <span className="text-lg font-bold text-ink">SentinelAI</span>
          </Link>

          <div className="mb-6 flex items-center gap-2 lg:hidden">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand-600' : 'bg-line'}`} />
            ))}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}
