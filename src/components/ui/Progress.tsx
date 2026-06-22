import { cn } from '@/lib/utils'

type Tone = 'brand' | 'success' | 'warning' | 'danger'

const tones: Record<Tone, string> = {
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
}

interface ProgressProps {
  value: number
  tone?: Tone
  className?: string
  showLabel?: boolean
}

export function Progress({ value, tone = 'brand', className, showLabel }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="flex items-center gap-3">
      <div className={cn('h-2 flex-1 overflow-hidden rounded-full bg-surface-muted', className)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', tones[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="w-9 text-right text-xs font-medium text-ink-muted">{Math.round(clamped)}%</span>}
    </div>
  )
}
