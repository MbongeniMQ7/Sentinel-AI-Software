import { Link } from 'react-router-dom'
import { Home, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-surface-subtle px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <p className="mt-6 text-6xl font-bold tracking-tight text-ink">404</p>
      <h1 className="mt-2 text-lg font-semibold text-ink">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="mt-6">
        <Button><Home className="h-4 w-4" /> Back to home</Button>
      </Link>
    </div>
  )
}
