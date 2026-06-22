import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  step: 1 | 2 | 3
}

export function AuthLayout({ title, subtitle, children, step }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-700 p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_20%_10%,rgba(255,255,255,0.16),transparent)]" />
        <Link to="/" className="relative flex items-center gap-2.5 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">SentinelAI</span>
        </Link>
        <div className="relative max-w-md">
          <blockquote className="text-2xl font-semibold leading-snug text-white">
            “SentinelAI helped us cut fatigue-related incidents by 41% in a single quarter.”
          </blockquote>
          <p className="mt-4 text-sm text-brand-100">Director of Safety · Vertex Manufacturing</p>
        </div>
        <div className="relative flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-white' : 'w-4 bg-white/30'}`} />
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-col items-center justify-center bg-surface-subtle px-4 py-10 lg:w-1/2">
        <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-ink">SentinelAI</span>
        </Link>
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand-600' : 'bg-line'}`} />
            ))}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}
