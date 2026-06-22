import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: ReactNode
  icon: ReactNode
  delta?: number
  deltaSuffix?: string
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  hint?: string
  invertDelta?: boolean
}

const toneStyles = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40',
  danger: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40',
  purple: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40',
}

export function KpiCard({ label, value, icon, delta, deltaSuffix = '%', tone = 'brand', hint, invertDelta }: KpiCardProps) {
  const positive = delta !== undefined && delta >= 0
  const good = invertDelta ? !positive : positive
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', toneStyles[tone])}>{icon}</div>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              good ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40',
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}
            {deltaSuffix}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-subtle">{hint}</p>}
    </Card>
  )
}
