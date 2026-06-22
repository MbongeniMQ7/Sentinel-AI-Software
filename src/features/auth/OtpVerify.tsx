import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, MailCheck } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/Button'
import { useAuth, roleHome } from '@/lib/auth'

export function OtpVerify() {
  const { pendingRole, login } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [seconds, setSeconds] = useState(30)
  const [verifying, setVerifying] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  if (!pendingRole) return <Navigate to="/auth/role" replace />

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[i] = val
    setCode(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (digits.length) {
      const next = [...code]
      digits.forEach((d, idx) => (next[idx] = d))
      setCode(next)
      inputs.current[Math.min(digits.length, 5)]?.focus()
    }
  }

  const filled = code.every((c) => c !== '')

  const verify = () => {
    setVerifying(true)
    setTimeout(() => {
      login(pendingRole)
      navigate(roleHome[pendingRole])
    }, 900)
  }

  return (
    <AuthLayout step={2} title="Verify it's you" subtitle="We sent a 6-digit code to your email. Enter it below to continue.">
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
          <MailCheck className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-ink">Code sent</p>
          <p className="text-xs text-ink-muted">a••••@sentinel.ai · Use any 6 digits for the demo</p>
        </div>
      </div>

      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            inputMode="numeric"
            maxLength={1}
            className="h-14 w-full rounded-xl border border-line bg-surface text-center text-xl font-semibold text-ink focus-ring"
          />
        ))}
      </div>

      <Button className="mt-6 w-full" size="lg" disabled={!filled} loading={verifying} onClick={verify}>
        {verifying ? 'Verifying…' : 'Verify & continue'}
        {!verifying && <ArrowRight className="h-4 w-4" />}
      </Button>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Didn't get a code?{' '}
        {seconds > 0 ? (
          <span className="text-ink-subtle">Resend in {seconds}s</span>
        ) : (
          <button className="font-medium text-brand-600 hover:underline" onClick={() => setSeconds(30)}>
            Resend code
          </button>
        )}
      </p>
    </AuthLayout>
  )
}
