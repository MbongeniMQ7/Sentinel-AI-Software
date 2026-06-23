import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BatteryCharging,
  BellRing,
  CheckCircle2,
  Clock,
  FileBarChart,
  HeartPulse,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  UserCog,
  Watch,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { logoUrl } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useI18n } from '@/lib/i18n'

export function Landing() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const goSignIn = () => navigate('/auth/role')

  const stats = [
    { value: '99.9%', label: t('stats.uptime') },
    { value: '3.4×', label: t('stats.alerts') },
    { value: '120+', label: t('stats.sites') },
    { value: '18k+', label: t('stats.workers') },
  ]

  const features = [
    { icon: HeartPulse, title: t('features.f1.title'), desc: t('features.f1.desc') },
    { icon: BellRing, title: t('features.f2.title'), desc: t('features.f2.desc') },
    { icon: Lock, title: t('features.f3.title'), desc: t('features.f3.desc') },
    { icon: Clock, title: t('features.f4.title'), desc: t('features.f4.desc') },
    { icon: FileBarChart, title: t('features.f5.title'), desc: t('features.f5.desc') },
    { icon: UserCog, title: t('features.f6.title'), desc: t('features.f6.desc') },
  ]

  const steps = [
    { icon: Watch, title: t('how.s1.title'), desc: t('how.s1.desc') },
    { icon: Activity, title: t('how.s2.title'), desc: t('how.s2.desc') },
    { icon: ShieldCheck, title: t('how.s3.title'), desc: t('how.s3.desc') },
  ]

  return (
    <div className="min-h-full bg-surface-subtle">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="SentinelAI" className="h-9 w-9 object-contain" draggable={false} />
            <span className="text-lg font-bold tracking-tight text-ink">SentinelAI</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
            <a href="#features" className="hover:text-ink">{t('nav.features')}</a>
            <a href="#how" className="hover:text-ink">{t('nav.how')}</a>
            <a href="#cta" className="hover:text-ink">{t('nav.pricing')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={goSignIn} className="hidden sm:inline-flex">{t('cta.signIn')}</Button>
            <Button size="sm" onClick={goSignIn}>{t('cta.bookDemo')}</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_-5%,rgba(53,99,255,0.16),transparent)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <Badge tone="brand" className="mx-auto mb-5 lg:mx-0">
              <Sparkles className="h-3.5 w-3.5" /> {t('hero.badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {t('hero.title1')} <span className="text-brand-600">{t('hero.titleHi')}</span> {t('hero.title2')}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-muted lg:mx-0">{t('hero.subtitle')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto" onClick={goSignIn}>
                <Play className="h-4 w-4" /> {t('cta.tryDemo')}
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={goSignIn}>
                {t('cta.explore')} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-subtle lg:justify-start">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {t('hero.trusted')}
            </div>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-brand-500/20 to-violet-500/10 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-xl">
              <div className="flex items-center justify-between border-b border-line bg-surface-muted/60 px-5 py-3">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-brand-600" />
                  <span className="text-sm font-semibold text-ink">Live wristband</span>
                </div>
                <Badge tone="success">Online</Badge>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-line p-4">
                    <div className="flex items-center gap-1.5 text-xs text-ink-subtle"><HeartPulse className="h-3.5 w-3.5" /> Heart rate</div>
                    <p className="mt-1 text-2xl font-bold text-ink">72 <span className="text-sm font-medium text-ink-subtle">bpm</span></p>
                  </div>
                  <div className="rounded-2xl border border-line p-4">
                    <div className="flex items-center gap-1.5 text-xs text-ink-subtle"><Activity className="h-3.5 w-3.5" /> Fatigue</div>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">Low</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-line p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-ink-subtle">
                    <span>Fatigue trend</span><span>last 6h</span>
                  </div>
                  <div className="flex h-16 items-end gap-1.5">
                    {[30, 42, 35, 50, 38, 28, 22, 34, 26, 20, 24, 18].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-brand-500/70" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-line p-4">
                  <div className="flex items-center gap-2 text-sm text-ink-muted"><BatteryCharging className="h-4 w-4 text-emerald-600" /> Band battery</div>
                  <span className="text-sm font-semibold text-ink">86%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-ink sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t('features.title')}</h2>
          <p className="mt-4 text-lg text-ink-muted">{t('features.subtitle')}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-line bg-surface p-6 transition-shadow hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t('how.title')}</h2>
            <p className="mt-4 text-lg text-ink-muted">{t('how.subtitle')}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-brand-600">Step {i + 1}</span>
                <h3 className="mt-1 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto mb-5 flex w-fit">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="text-2xl font-medium leading-relaxed text-ink sm:text-3xl">{t('quote.text')}</blockquote>
          <p className="mt-6 text-sm font-semibold text-ink-muted">{t('quote.author')}</p>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(40%_60%_at_80%_20%,rgba(255,255,255,0.18),transparent)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('final.title')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">{t('final.subtitle')}</p>
            <ul className="mx-auto mt-6 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-50">
              {[t('final.b1'), t('final.b2'), t('final.b3')].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-brand-50" onClick={goSignIn}>
                {t('cta.startDemo')} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-brand-600" /> {t('footer.rights')}
          </div>
          <div className="flex gap-6 text-sm text-ink-muted">
            <a href="#" className="hover:text-ink">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-ink">{t('footer.security')}</a>
            <a href="#" className="hover:text-ink">{t('footer.terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
