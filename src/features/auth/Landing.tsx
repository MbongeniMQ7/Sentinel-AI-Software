import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Check,
  Cpu,
  HeartPulse,
  Lock,
  Play,
  Shield,
  ShieldCheck,
} from 'lucide-react'
import { logoUrl } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { workerPhotos } from '@/lib/avatars'
import { useI18n } from '@/lib/i18n'
import { useAuth, roleHome } from '@/lib/auth'

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#in-action', label: 'In action' },
]

const trustBadges = [
  { icon: Lock, label: 'AES-256 encrypted' },
  { icon: Cpu, label: 'On-device AI' },
  { icon: Shield, label: 'OSHA aligned' },
  { icon: ShieldCheck, label: 'Privacy-first' },
]

const steps = [
  {
    icon: HeartPulse,
    step: '01',
    title: 'Sense',
    desc: 'Secure wearables capture heart-rate variability, micro-movements and blink latency — no personal identifiers stored.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'Score',
    desc: 'On-device AI turns those signals into a live fatigue index, entirely on the wearer — private and instant.',
  },
  {
    icon: Bell,
    step: '03',
    title: 'Act',
    desc: 'When alertness dips, SentinelAI schedules a micro-break and notifies supervisors before risk escalates.',
  },
]

const showcase = [
  { src: '/banners/in-action.png', title: 'Live wellness dashboards', desc: 'Executive, manager and employee views of workforce fatigue in real time.' },
  { src: '/banners/risk-detection.png', title: 'Early risk detection', desc: 'Surface burnout and fatigue risk across teams before it turns into an incident.' },
]

export function Landing() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuth()
  const goSignIn = () => navigate(user ? roleHome[user.role] : '/auth/role')

  return (
    <div className="min-h-full bg-palette-beige text-palette-navy font-sans antialiased">
      <div className="h-1.5 w-full bg-gradient-to-r from-palette-navy via-palette-teal to-palette-vanilla" />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-palette-skyblue bg-palette-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="SentinelAI" className="h-9 w-9 object-contain" draggable={false} />
            <span className="text-xl font-bold tracking-tight text-palette-navy">
              Sentinel<span className="text-palette-teal">AI</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-palette-teal md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-palette-navy">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              className="hidden text-sm font-semibold text-palette-navy transition-colors hover:text-palette-teal sm:block"
              onClick={goSignIn}
            >
              {t('cta.signIn')}
            </button>
            <button
              onClick={goSignIn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-palette-navy px-4 py-2 text-sm font-semibold text-palette-white transition-all hover:bg-palette-teal"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-palette-navy">
        <div className="absolute inset-0 bg-[radial-gradient(#567C8D_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-palette-teal/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-palette-skyblue/10 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-palette-skyblue/25 bg-palette-white/10 px-4 py-1.5 text-xs font-medium text-palette-skyblue backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-palette-vanilla" />
              Enterprise workforce safety suite
            </span>

            <h1 className="mx-auto mt-6 max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-palette-white sm:text-6xl lg:mx-0">
              Keep your workforce{' '}
              <span className="bg-gradient-to-r from-palette-skyblue via-palette-vanilla to-[#FFFAE3] bg-clip-text text-transparent">
                alert, safe &amp; at their best
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-palette-skyblue/90 sm:text-lg lg:mx-0">
              SentinelAI reads fatigue in real time and steps in before it becomes an incident — protecting your people with privacy-first, on-device AI.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start">
              <button
                onClick={goSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-palette-white px-8 py-4 font-bold text-palette-navy shadow-lg shadow-palette-navy/40 transition-all hover:scale-[1.02] hover:bg-palette-vanilla active:scale-95 sm:w-auto"
              >
                <Play className="h-5 w-5 fill-palette-navy stroke-none" /> Get started
              </button>
              <a
                href="#how-it-works"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-palette-skyblue/30 px-8 py-4 font-semibold text-palette-white transition-all hover:bg-palette-white/10 sm:w-auto"
              >
                See how it works
              </a>
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <div className="flex -space-x-3">
                {workerPhotos.slice(0, 5).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-10 w-10 rounded-full border-2 border-palette-navy object-cover"
                    draggable={false}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-palette-skyblue/90">
                Trusted by safety-critical teams across industrial operations
              </p>
            </div>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="overflow-hidden rounded-2xl border border-palette-skyblue/20 bg-palette-white/5 shadow-2xl shadow-palette-navy/50 backdrop-blur">
              <img src="/banners/in-action.png" alt="SentinelAI wellness dashboard" className="w-full" draggable={false} />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-palette-skyblue bg-palette-white px-5 py-3 shadow-xl sm:block">
              <p className="text-[11px] font-bold uppercase tracking-widest text-palette-teal">Live fatigue index</p>
              <p className="text-2xl font-black text-palette-navy">92 <span className="text-sm font-bold text-emerald-500">Optimal</span></p>
            </div>
          </div>
        </div>

        {/* Trust badges bar */}
        <div className="relative z-10 border-t border-palette-skyblue/15">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 sm:px-6">
            {trustBadges.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-sm font-semibold text-palette-skyblue/80">
                <b.icon className="h-4 w-4" /> {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-palette-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="rounded-full border border-palette-skyblue bg-palette-beige/60 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-palette-teal">
              How it works
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-palette-navy sm:text-5xl">
              From body signal to safer shift
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-palette-teal">
              Three steps, all running locally and privately — no dashboards to babysit.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className="relative rounded-3xl border border-palette-skyblue bg-palette-floral p-8 transition-all hover:-translate-y-1 hover:border-palette-teal/50 hover:shadow-lg"
              >
                <span className="text-5xl font-black text-palette-skyblue/50">{s.step}</span>
                <div className="mt-4 inline-flex rounded-xl border border-palette-skyblue bg-palette-white p-3 text-palette-teal shadow-sm">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-palette-navy">{s.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#567C8D]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In action */}
      <section id="in-action" className="border-t border-palette-skyblue bg-palette-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="rounded-full border border-palette-skyblue bg-palette-beige/60 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-palette-teal">
              In action
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-palette-navy sm:text-5xl">
              One platform, every point of view
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {showcase.map((s) => (
              <div key={s.title} className="overflow-hidden rounded-3xl border border-palette-skyblue bg-palette-floral shadow-sm">
                <img src={s.src} alt={s.title} className="w-full" draggable={false} />
                <div className="p-6">
                  <h3 className="text-lg font-extrabold text-palette-navy">{s.title}</h3>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-[#567C8D]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-palette-navy px-6 py-16 text-center shadow-2xl sm:px-12">
          <div className="absolute -right-20 -top-24 h-[30rem] w-[30rem] rounded-full bg-palette-teal/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-[30rem] w-[30rem] rounded-full bg-palette-skyblue/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#FFFDF4] sm:text-5xl">
              See SentinelAI on your floor today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-palette-beige/90 sm:text-base">
              Passwordless, role-based access for employees, managers and executives — set up in minutes.
            </p>

            <ul className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-palette-beige">
              {['Passwordless secure sign-in', 'Role-based dashboards', 'Set up in minutes'].map((item) => (
                <li key={item} className="flex items-center gap-1.5 rounded-full border border-palette-white/10 bg-palette-white/10 px-3 py-1 text-[11px]">
                  <Check className="h-3.5 w-3.5 text-[#FFF1B9]" /> {item}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <button
                onClick={goSignIn}
                className="rounded-xl bg-[#FFF1B9] px-8 py-4 font-extrabold text-palette-navy shadow-lg transition-all hover:scale-[1.03] hover:bg-palette-white"
              >
                Get started <ArrowRight className="ml-1 inline h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-palette-skyblue bg-palette-white py-12 text-xs">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-medium text-[#567C8D]">
            <ShieldCheck className="h-4 w-4 text-[#567C8D]" /> © 2026 SentinelAI. All rights reserved.
          </div>
          <div className="flex gap-6 font-bold text-[#567C8D]">
            <a href="/legal/SentinelAI-Privacy-Policy.pdf" download className="transition-colors hover:text-palette-navy">Privacy Policy</a>
            <a href="/legal/SentinelAI-Terms-and-Conditions.pdf" download className="transition-colors hover:text-palette-navy">Terms &amp; Conditions</a>
            <a href="https://sentinelai-software.co.za/security" target="_blank" rel="noreferrer" className="transition-colors hover:text-palette-navy">Security</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
