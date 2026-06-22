import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { languages, useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const current = languages.find((l) => l.code === lang) ?? languages[0]

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{current.code}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 max-h-80 w-44 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-lg">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-muted',
                l.code === lang ? 'font-semibold text-ink' : 'text-ink-muted',
              )}
            >
              {l.native}
              {l.code === lang && <Check className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
