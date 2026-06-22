import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { RiskScore } from '../../types'
import { format } from 'date-fns'

interface Props {
  history: RiskScore[]
  height?: number
}

const levelColor = (score: number) => {
  if (score >= 90) return '#dc2626'
  if (score >= 80) return '#ef4444'
  if (score >= 60) return '#f59e0b'
  return '#22c55e'
}

function RiskTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as RiskScore
  return (
    <div className="rounded-lg border border-[#1e2d4a] bg-[#0a0f1e] p-2.5 text-xs shadow-xl">
      <p className="font-semibold text-white">{format(new Date(d.timestamp), 'HH:mm:ss')}</p>
      <p className="text-gray-300">Score: <span className="font-bold text-white">{d.score.toFixed(1)}</span></p>
      <p className="text-gray-400">Fatigue: {d.fatigue_component.toFixed(1)}</p>
      <p className="text-gray-400">Biometric: {d.biometric_component.toFixed(1)}</p>
      <p className="text-gray-400">Environment: {d.environmental_component.toFixed(1)}</p>
    </div>
  )
}

export function RiskHistoryChart({ history, height = 200 }: Props) {
  const data = [...history].reverse().map((r) => ({
    ...r,
    time: format(new Date(r.timestamp), 'HH:mm:ss'),
  }))

  const latest = data[data.length - 1]
  const strokeColor = latest ? levelColor(latest.score) : '#22c55e'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
        <XAxis
          dataKey="time"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<RiskTooltip />} />
        <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
        <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
        <Area
          type="monotone"
          dataKey="score"
          stroke={strokeColor}
          strokeWidth={2}
          fill="url(#riskGradient)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
