import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { StatsBar } from '../components/Dashboard/StatsBar'
import type { WorkerWithRisk } from '../types'

const makeWorker = (
  overrides: Partial<WorkerWithRisk> = {},
): WorkerWithRisk => ({
  id: crypto.randomUUID(),
  name: 'Test Worker',
  employee_id: 'EMP001',
  role: 'Operator',
  zone: 'Zone A',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
  risk_score: 20,
  risk_level: 'LOW',
  last_seen: null,
  ...overrides,
})

describe('StatsBar', () => {
  it('shows total worker count', () => {
    const workers = [makeWorker(), makeWorker()]
    render(<StatsBar workers={workers} />)
    // Find the "Total Workers" card and verify its count within it
    const totalCard = screen.getByText('Total Workers').closest('div')!
    expect(within(totalCard).getByText('2')).toBeInTheDocument()
  })

  it('shows correct risk level counts', () => {
    const workers = [
      makeWorker({ risk_level: 'LOW' }),
      makeWorker({ risk_level: 'MEDIUM' }),
      makeWorker({ risk_level: 'HIGH' }),
      makeWorker({ risk_level: 'CRITICAL' }),
    ]
    render(<StatsBar workers={workers} />)
    // Each risk level card should show exactly "1"
    const lowCard = screen.getByText('Low Risk').closest('div')!
    expect(within(lowCard).getByText('1')).toBeInTheDocument()
    const highCard = screen.getByText('High Risk').closest('div')!
    expect(within(highCard).getByText('1')).toBeInTheDocument()
  })

  it('shows average risk score', () => {
    const workers = [
      makeWorker({ risk_score: 20 }),
      makeWorker({ risk_score: 60 }),
    ]
    render(<StatsBar workers={workers} />)
    expect(screen.getByText('40.0')).toBeInTheDocument()
  })

  it('shows dash when no workers', () => {
    render(<StatsBar workers={[]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
