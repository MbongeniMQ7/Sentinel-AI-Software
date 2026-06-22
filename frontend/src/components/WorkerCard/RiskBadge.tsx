import type { RiskLevel } from '../../types'

interface Props {
  level: RiskLevel
  score?: number
  size?: 'sm' | 'md' | 'lg'
}

const palette: Record<RiskLevel, { bg: string; text: string; ring: string }> = {
  LOW:      { bg: 'bg-green-500/20',  text: 'text-green-400',  ring: 'ring-green-500/40' },
  MEDIUM:   { bg: 'bg-amber-500/20',  text: 'text-amber-400',  ring: 'ring-amber-500/40' },
  HIGH:     { bg: 'bg-red-500/20',    text: 'text-red-400',    ring: 'ring-red-500/40' },
  CRITICAL: { bg: 'bg-red-700/30',    text: 'text-red-300',    ring: 'ring-red-600/60' },
}

const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' }

export function RiskBadge({ level, score, size = 'md' }: Props) {
  const { bg, text, ring } = palette[level]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ${bg} ${text} ${ring} ${sizes[size]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${text.replace('text-', 'bg-')} ${level === 'CRITICAL' ? 'animate-pulse' : ''}`}
      />
      {score !== undefined ? `${score.toFixed(1)}` : level}
    </span>
  )
}
