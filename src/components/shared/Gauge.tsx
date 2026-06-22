import { cn } from '@/lib/utils'

interface GaugeProps {
  value: number
  max?: number
  size?: number
  label?: string
  unit?: string
  thresholds?: { warn: number; danger: number }
}

export function Gauge({
  value,
  max = 100,
  size = 200,
  label = 'Fatigue Index',
  unit = '',
  thresholds = { warn: 50, danger: 75 },
}: GaugeProps) {
  const pct = Math.max(0, Math.min(1, value / max))
  const radius = size / 2 - 18
  const circ = Math.PI * radius // semicircle
  const offset = circ * (1 - pct)

  const color =
    value >= thresholds.danger ? '#f43f5e' : value >= thresholds.warn ? '#f59e0b' : '#10b981'
  const status =
    value >= thresholds.danger ? 'High Risk' : value >= thresholds.warn ? 'Elevated' : 'Healthy'

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        <path
          d={`M 18 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 18} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          className="text-surface-muted"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d={`M 18 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 18} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <text x="50%" y={size / 2 - 4} textAnchor="middle" className="fill-ink" style={{ fontSize: size * 0.2, fontWeight: 700 }}>
          {Math.round(value)}
          <tspan style={{ fontSize: size * 0.08 }} className="fill-ink-subtle">
            {unit}
          </tspan>
        </text>
      </svg>
      <div className="-mt-1 flex flex-col items-center">
        <span className={cn('text-sm font-semibold')} style={{ color }}>
          {status}
        </span>
        <span className="text-xs text-ink-subtle">{label}</span>
      </div>
    </div>
  )
}
