import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskBadge } from '../components/WorkerCard/RiskBadge'

describe('RiskBadge', () => {
  it('renders LOW level', () => {
    render(<RiskBadge level="LOW" />)
    expect(screen.getByText('LOW')).toBeInTheDocument()
  })

  it('renders score when provided', () => {
    render(<RiskBadge level="MEDIUM" score={42.5} />)
    expect(screen.getByText('42.5')).toBeInTheDocument()
  })

  it('renders CRITICAL with correct text', () => {
    render(<RiskBadge level="CRITICAL" score={95.0} />)
    expect(screen.getByText('95.0')).toBeInTheDocument()
  })
})
