import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import type { RiskLevel } from '../../types'
import clsx from 'clsx'

interface Props {
  score: number
  level: RiskLevel
  size?: number
}

const levelStyle: Record<RiskLevel, { color: string; label: string }> = {
  LOW:      { color: '#22c55e', label: 'Low Risk' },
  MEDIUM:   { color: '#f59e0b', label: 'Medium Risk' },
  HIGH:     { color: '#ef4444', label: 'High Risk' },
  CRITICAL: { color: '#dc2626', label: 'Critical' },
}

export function RiskGauge({ score, level, size = 160 }: Props) {
  const { color, label } = levelStyle[level]
  const data = [{ value: score, fill: color }]

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={10}
          data={data}
          startAngle={210}
          endAngle={-30}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#1e2d4a' }}
            dataKey="value"
            angleAxisId={0}
            cornerRadius={5}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={clsx('text-3xl font-bold tabular-nums', {
            'text-green-400': level === 'LOW',
            'text-amber-400': level === 'MEDIUM',
            'text-red-400': level === 'HIGH',
            'text-red-300 animate-pulse': level === 'CRITICAL',
          })}
        >
          {score.toFixed(0)}
        </span>
        <span className="text-xs text-gray-400 mt-0.5">{label}</span>
      </div>
    </div>
  )
}
