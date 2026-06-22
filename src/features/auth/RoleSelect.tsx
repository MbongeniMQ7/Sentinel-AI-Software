import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Check, HardHat, ShieldCheck } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/Button'
import { useAuth, type Role } from '@/lib/auth'
import { cn } from '@/lib/utils'

const roles: { id: Role; title: string; desc: string; icon: typeof HardHat }[] = [
  { id: 'employee', title: 'Employee', desc: 'Monitor your own wellness, request breaks and view alerts.', icon: HardHat },
  { id: 'manager', title: 'Manager', desc: 'Oversee your team, manage alerts, devices and approvals.', icon: ShieldCheck },
  { id: 'owner', title: 'Owner', desc: 'Run the platform — companies, revenue, fleet and billing.', icon: Building2 },
]

export function RoleSelect() {
  const [selected, setSelected] = useState<Role | null>('employee')
  const { setPendingRole } = useAuth()
  const navigate = useNavigate()

  const proceed = () => {
    if (!selected) return
    setPendingRole(selected)
    navigate('/auth/verify')
  }

  return (
    <AuthLayout step={1} title="Choose your workspace" subtitle="Select a role to explore the SentinelAI demo experience.">
      <div className="space-y-3">
        {roles.map((r) => {
          const active = selected === r.id
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all focus-ring',
                active ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500 dark:bg-brand-950/40' : 'border-line bg-surface hover:border-brand-300',
              )}
            >
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', active ? 'bg-brand-600 text-white' : 'bg-surface-muted text-ink-muted')}>
                <r.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{r.title}</p>
                <p className="text-xs text-ink-muted">{r.desc}</p>
              </div>
              <div className={cn('flex h-5 w-5 items-center justify-center rounded-full border', active ? 'border-brand-600 bg-brand-600 text-white' : 'border-line')}>
                {active && <Check className="h-3 w-3" />}
              </div>
            </button>
          )
        })}
      </div>

      <Button className="mt-6 w-full" size="lg" onClick={proceed} disabled={!selected}>
        Continue <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-4 text-center text-xs text-ink-subtle">This is a demo. No real credentials are required.</p>
    </AuthLayout>
  )
}
