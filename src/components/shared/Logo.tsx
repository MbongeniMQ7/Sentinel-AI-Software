import { cn } from '@/lib/utils'
import logoUrl from '@/assets/logo.png'

interface LogoProps {
  /** Show the "SentinelAI" wordmark next to the mark. */
  showWordmark?: boolean
  className?: string
  /** Tailwind height utility for the mark, e.g. "h-9". */
  size?: string
}

/**
 * SentinelAI brand lockup. Uses the official shield logo asset and an
 * optional text wordmark for horizontal placements (sidebars, navbars).
 */
export function Logo({ showWordmark = true, className, size = 'h-9' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src={logoUrl}
        alt="SentinelAI"
        className={cn(size, 'w-auto object-contain')}
        draggable={false}
      />
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-ink">SentinelAI</span>
      )}
    </span>
  )
}

export { logoUrl }
