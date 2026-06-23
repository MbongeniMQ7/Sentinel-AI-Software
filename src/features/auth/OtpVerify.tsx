import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth, roleHome, type Role } from '@/lib/auth'
import { requestOtp, verifyOtp } from '@/lib/supabase'

function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return email
  const shown = name.slice(0, 1)
  return `${shown}${'•'.repeat(Math.max(name.length - 1, 1))}@${domain}`
}

export function OtpVerify() {
  const { pendingEmail, refresh } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [seconds, setSeconds] = useState(30)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  if (!pendingEmail) return <Navigate to="/auth/role" replace />

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

  const verify = async () => {
    setVerifying(true)
    setError(null)
    try {
      const { role } = await verifyOtp(pendingEmail, code.join(''))
      await refresh()
      navigate(roleHome[(role as Role) ?? 'employee'])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the code')
      setVerifying(false)
    }
  }

  const resend = async () => {
    try {
      await requestOtp(pendingEmail)
      setSeconds(30)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code')
    }
  }

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-surface to-brand-100/70 px-5 py-12 dark:from-surface-subtle dark:via-surface dark:to-brand-900/20">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-28 -top-28 h-[26rem] w-[26rem] rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-700/20" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-[45%] bg-sky-300/25 blur-3xl dark:bg-sky-800/20" />
      <span className="pointer-events-none absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-brand-400/70" />
      <span className="pointer-events-none absolute right-[20%] top-[30%] h-1.5 w-1.5 rounded-full bg-amber-400/80" />
      <span className="pointer-events-none absolute bottom-[24%] right-[24%] h-2 w-2 rounded-full bg-emerald-400/70" />

      <button
        onClick={() => navigate('/auth/role')}
        className="absolute left-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="relative w-full max-w-md rounded-3xl border border-line/70 bg-surface/85 p-8 text-center shadow-2xl shadow-brand-900/10 backdrop-blur-md sm:p-10">
        {/* Illustration */}
        <div className="relative mx-auto h-44 w-44">
          <div className="absolute inset-0 rounded-full bg-brand-100/50 dark:bg-brand-900/30" />
          <div className="absolute inset-5 rounded-full bg-brand-100/80 dark:bg-brand-900/40" />
          <div className="absolute inset-9 rounded-full bg-brand-100 dark:bg-brand-900/60" />

          {/* Phone */}
          <div className="absolute left-1/2 top-1/2 h-24 w-[3.25rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[3px] border-brand-700 bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg">
            <div className="mx-auto mt-1.5 h-1 w-5 rounded-full bg-white/70" />
          </div>

          {/* Mail icon */}
          <div className="absolute left-9 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-line bg-surface shadow-md">
            <Mail className="h-5 w-5 text-brand-600" />
          </div>

          {/* Numbered badges */}
          <div className="absolute right-7 top-7 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-md">
            1
          </div>
          <div className="absolute bottom-9 right-6 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-md">
            2
          </div>
          <div className="absolute bottom-12 left-7 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white shadow-md">
            3
          </div>

          {/* Accent dots */}
          <span className="absolute right-12 top-1/2 h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="absolute bottom-7 left-1/2 h-1.5 w-1.5 rounded-full bg-brand-400" />
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-ink">Enter OTP</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We've sent a one-time code to{' '}
          <span className="font-medium text-ink">{maskEmail(pendingEmail)}</span> for verification.
        </p>

        {/* Code inputs */}
        <div className="mt-8 flex justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-11 rounded-xl border border-line bg-surface text-center text-xl font-semibold text-brand-600 focus-ring sm:w-12"
            />
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        <Button className="mt-8 w-full" size="lg" disabled={!filled} loading={verifying} onClick={verify}>
          {verifying ? 'Verifying…' : 'Next'}
        </Button>

        <p className="mt-6 text-sm font-medium text-ink">
          Didn't receive the OTP?{' '}
          {seconds > 0 ? (
            <span className="text-ink-subtle">Resend in {seconds}s</span>
          ) : (
            <button className="font-semibold text-brand-600 hover:underline" onClick={resend}>
              Resend code
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
