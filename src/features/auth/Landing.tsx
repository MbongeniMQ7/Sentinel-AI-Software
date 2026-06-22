import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  Cpu,
  HeartPulse,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const features = [
  { icon: Camera, title: 'Vision-based detection', desc: 'On-edge computer vision flags drowsiness, micro-sleeps and distraction in real time — without storing raw video.' },
  { icon: HeartPulse, title: 'Biometric fusion', desc: 'Optional wearables add heart-rate variability for a richer, more accurate fatigue index.' },
  { icon: Bell, title: 'Proactive alerts', desc: 'Escalation workflows notify operators and managers before fatigue becomes an incident.' },
  { icon: BarChart3, title: 'Workforce analytics', desc: 'Department trends, shift comparisons and predictive risk scoring across your whole org.' },
  { icon: Cpu, title: 'IoT fleet control', desc: 'Provision, monitor and update cameras, bands and gateways from a single console.' },
  { icon: ShieldCheck, title: 'Privacy by design', desc: 'Anonymized metrics, encrypted pipelines and on-device processing keep people protected.' },
]

const stats = [
  { value: '41%', label: 'Fewer fatigue incidents' },
  { value: '2.3M', label: 'Shifts monitored' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '<200ms', label: 'Edge inference' },
]

export function Landing() {
  return (
    <div className="min-h-full bg-surface-subtle">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-ink">SentinelAI</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
            <a href="#features" className="hover:text-ink">Platform</a>
            <a href="#stats" className="hover:text-ink">Impact</a>
            <a href="#cta" className="hover:text-ink">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth/role">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth/role">
              <Button size="sm">Book a demo</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(53,99,255,0.12),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <Badge tone="brand" className="mx-auto mb-5">
            <Sparkles className="h-3.5 w-3.5" /> AI workforce wellness, in real time
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Keep your people <span className="text-brand-600">alert, safe</span> and at their best
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-muted">
            SentinelAI continuously monitors fatigue and wellness across your workforce — detecting risk early and
            guiding healthier shifts with privacy-first AI.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth/role">
              <Button size="lg" className="w-full sm:w-auto">
                <Play className="h-4 w-4" /> Try the live demo
              </Button>
            </Link>
            <Link to="/auth/role">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore platform <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-subtle">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            Trusted by safety teams at 120+ industrial sites
          </div>

          {/* Hero preview */}
          <div className="mx-auto mt-14 max-w-5xl">
            <div className="card overflow-hidden p-2">
              <div className="rounded-xl bg-surface-subtle p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Activity, label: 'Avg fatigue', value: '38', tone: 'text-emerald-600' },
                    { icon: Users, label: 'Active staff', value: '284', tone: 'text-brand-600' },
                    { icon: Bell, label: 'Open alerts', value: '7', tone: 'text-amber-600' },
                    { icon: HeartPulse, label: 'Avg BPM', value: '74', tone: 'text-rose-600' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-line bg-surface p-4 text-left">
                      <s.icon className={`h-5 w-5 ${s.tone}`} />
                      <p className="mt-3 text-2xl font-bold text-ink">{s.value}</p>
                      <p className="text-xs text-ink-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-brand-600 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">One platform for workforce wellness</h2>
          <p className="mt-4 text-lg text-ink-muted">Everything safety and operations teams need to prevent fatigue-related incidents.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(40%_60%_at_80%_20%,rgba(255,255,255,0.18),transparent)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See SentinelAI on your shop floor
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">
              Launch the interactive demo and explore the Employee, Manager and Owner experiences.
            </p>
            <ul className="mx-auto mt-6 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-50">
              {['No installation', 'Full demo data', 'All three roles'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link to="/auth/role">
                <Button size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-brand-50">
                  Start the demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-brand-600" /> © 2026 SentinelAI. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-ink-muted">
            <a href="#" className="hover:text-ink">Privacy</a>
            <a href="#" className="hover:text-ink">Security</a>
            <a href="#" className="hover:text-ink">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
