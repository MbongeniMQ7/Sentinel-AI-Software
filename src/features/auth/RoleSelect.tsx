import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { requestOtp } from '@/lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RoleSelect() {
  const { user, setPendingEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to="/" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid email address')
      return
    }
    setError(null)
    setSending(true)
    try {
      await requestOtp(value)
      setPendingEmail(value)
      navigate('/auth/verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code')
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthLayout
      step={1}
      title="Sign in to SentinelAI"
      subtitle="Enter your work email and we'll send you a secure one-time code."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Work email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-12 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm text-ink focus-ring"
            />
          </div>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={sending} disabled={sending}>
          {sending ? 'Sending code…' : 'Send code'}
          {!sending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-ink-subtle">
        We'll email a 6-digit code that expires in 10 minutes. No password required.
      </p>
    </AuthLayout>
  )
}
