import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  Lock,
  Play,
  ShieldCheck,
  Shield,
  Cpu,
  Zap,
  Check,
} from 'lucide-react'
import { logoUrl } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useI18n } from '@/lib/i18n'

export function Landing() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const goSignIn = () => navigate('/auth/role')
  return (
    <div className="min-h-full bg-palette-beige text-palette-navy font-sans antialiased">
      {/* Decorative top ambient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-palette-navy via-palette-teal to-palette-vanilla" />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-palette-skyblue bg-palette-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="SentinelAI" className="h-9 w-9 object-contain" draggable={false} />
            <span className="text-xl font-bold tracking-tight text-palette-navy">
              Sentinel<span className="text-palette-teal">AI</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-palette-teal md:flex">
            <a href="#interactive-preview" className="transition-colors hover:text-palette-navy">Connected Sentinel Loop</a>
            <a href="#safety-calculator" className="transition-colors hover:text-palette-navy">Shift Performance Profiles</a>
            <a href="#features" className="transition-colors hover:text-palette-navy">Features & Privacy</a>
            <a href="#cta" className="transition-colors hover:text-palette-navy">Access Sandbox</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button 
              className="text-sm font-semibold text-palette-navy hover:text-palette-teal transition-colors px-3 py-2" 
              onClick={goSignIn}
            >
              {t('cta.signIn')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Beautiful Industrial Backdrop */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40 bg-palette-navy">
        {/* Background Image: High-tech industrial facility with a soft dark navy/teal overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000" 
            alt="Industrial Workforce Control" 
            className="w-full h-full object-cover object-center opacity-35 select-none pointer-events-none"
            draggable={false}
          />
          {/* Custom color-aligned gradient masks matching our system paint */}
          <div className="absolute inset-0 bg-gradient-to-b from-palette-navy/95 via-palette-navy/75 to-palette-navy/95" />
          <div className="absolute inset-0 bg-[radial-gradient(#567C8D_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="text-center">
            
            {/* Elegant glasspill tag as a badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-palette-white/10 px-4 py-1.5 text-xs text-palette-skyblue backdrop-blur-md border border-palette-skyblue/20 mb-8">
              <span className="h-2 w-2 rounded-full bg-palette-vanilla animate-pulse" />
              <span>Enterprise Biometric Safety Suite</span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-palette-white sm:text-6xl sm:leading-none">
              Keep your industrial workforce <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-palette-skyblue via-palette-vanilla to-[#FFFAE3] bg-clip-text text-transparent">
                alert, safe, & at their best
              </span>
            </h1>

            {/* Description - bright skyblue text that is extremely legible */}
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-palette-skyblue/90 font-medium">
              SentinelAI continuously analyzes safety compliance and active fatigue indices across your operations. Protect your people, prevent incident shutdowns, and drive operational efficiency with privacy-first AI.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <button 
                onClick={goSignIn}
                className="flex items-center justify-center gap-2 rounded-xl bg-palette-white px-8 py-4 font-bold text-palette-navy hover:bg-palette-vanilla hover:scale-[1.02] shadow-lg shadow-palette-navy/40 active:scale-95 transition-all w-full sm:w-auto"
              >
                <Play className="h-5 w-5 fill-palette-navy stroke-none" /> Get started
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Visual Safety Framework: Operational Telemetry Loop */}
      <section id="interactive-preview" className="py-20 sm:py-28 bg-palette-white border-y border-palette-skyblue relative overflow-hidden">
        {/* Soft background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#C8D9E6_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-palette-teal bg-palette-beige/60 px-3.5 py-1.5 rounded-full border border-palette-skyblue">
              Integrated Biometric Framework
            </span>
            <h2 className="text-3xl font-black tracking-tight text-palette-navy mt-4 sm:text-5xl">
              Continuous Risk Analysis: Connected Sentinel Loop
            </h2>
            <p className="mt-4 text-sm sm:text-base text-palette-teal leading-relaxed font-semibold">
              Our safety architecture processes continuous wear and environmental indicators down at the edge, converting body telemetry into direct operational relief.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3 relative my-8">
            
            {/* Step 1: Smart Biosensor Input */}
            <div className="relative bg-palette-floral border border-palette-skyblue p-8 rounded-3xl shadow-sm transition-all hover:border-palette-teal/50 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-palette-teal bg-palette-white px-2.5 py-1 rounded-full border border-palette-skyblue">
                    Telemetry Stream
                  </span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>

                {/* Micro Telemetry Metrics Card Layout - Pure Display Cards */}
                <div className="bg-palette-white rounded-2xl border border-palette-skyblue p-5 mb-6">
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-palette-skyblue/40">
                      <span className="text-[#567C8D] font-bold">Telemetry Metric</span>
                      <span className="text-palette-navy font-black">Active Stream</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">Eye Blink Rate (PERCLOS)</span>
                      <span className="text-palette-navy font-extrabold bg-palette-beige/50 px-2 py-0.5 rounded">0.08 s (Safe)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">HRV Balance Index</span>
                      <span className="text-[#567C8D] font-semibold">62 ms (Optimal)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">Passive Gaze Micro-lags</span>
                      <span className="text-rose-500 font-extrabold bg-rose-50 px-2 py-0.5 rounded">0/min (Perfect)</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-extrabold text-palette-navy text-lg mb-2">1. Ambient Physiological Streams</h3>
                <p className="text-xs text-[#567C8D] leading-relaxed font-semibold">
                  Secured wearables and optical analytics securely assess micro-movements, eye blink reaction times, and pulse speed fluctuations without collecting static personal identifiers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-palette-skyblue/40">
                <span className="text-[10px] text-palette-teal font-extrabold block">Telemetry Target</span>
                <span className="text-xs font-black text-palette-navy">Cognitive Fatigue & Heart-rate Variability</span>
              </div>
            </div>

            {/* Step 2: Edge Neural Classification */}
            <div className="relative bg-palette-floral border border-palette-skyblue p-8 rounded-3xl shadow-sm transition-all hover:border-palette-teal/50 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-palette-teal bg-palette-white px-2.5 py-1 rounded-full border border-palette-skyblue">
                    Predictive Edge Classification
                  </span>
                  <span className="text-[9px] font-bold uppercase text-palette-navy bg-palette-vanilla px-2 py-0.5 rounded border border-palette-navy/15">
                    Local Core
                  </span>
                </div>

                {/* Edge Scoring Card Layout - Pure Display Cards */}
                <div className="bg-palette-white rounded-2xl border border-palette-skyblue p-5 mb-6">
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-palette-skyblue/40">
                      <span className="text-[#567C8D] font-bold">Local Computing Thread</span>
                      <span className="text-palette-navy font-black">Edge Inference</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">Data Encryption</span>
                      <span className="text-[#567C8D] font-semibold">AES-GCM 256</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">Fatigue Scoring standard</span>
                      <span className="text-[#567C8D] font-semibold">PVT Standard Scale</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">Processing Location</span>
                      <span className="text-palette-navy font-extrabold bg-palette-beige/50 px-2 py-0.5 rounded">On-Wearer Core</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-extrabold text-palette-navy text-lg mb-2">2. Localized Algorithmic Scoring</h3>
                <p className="text-xs text-[#567C8D] leading-relaxed font-semibold">
                  Our embedded algorithms compute fatigue indices entirely on-premise. Machine models index biometric deterioration metrics and trigger instantaneous, secure warnings before alertness lags behind threshold.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-palette-skyblue/40">
                <span className="text-[10px] text-palette-teal font-extrabold block">Mathematical Model</span>
                <span className="text-xs font-black text-palette-navy">Psychomotor Vigilance (PVT) Algorithms</span>
              </div>
            </div>

            {/* Step 3: Automated Relief Dispatch */}
            <div className="relative bg-palette-floral border border-palette-skyblue p-8 rounded-3xl shadow-sm transition-all hover:border-palette-teal/50 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#567C8D] bg-palette-white px-2.5 py-1 rounded-full border border-palette-skyblue">
                    Automated Actions
                  </span>
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    SOP Active
                  </span>
                </div>

                {/* Dispatch Loop Card Layout - Pure Display Cards */}
                <div className="bg-palette-white rounded-2xl border border-palette-skyblue p-5 mb-6">
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-palette-skyblue/40">
                      <span className="text-[#567C8D] font-bold">Relief Dispatch Protocol</span>
                      <span className="text-palette-navy font-black">Automation Log</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">Shift Roster Sync</span>
                      <span className="text-[#567C8D] font-semibold">Immediate Realtime</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">Union Compliance Check</span>
                      <span className="text-[#567C8D] font-semibold">Approved Pattern</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-palette-teal font-semibold">Required Roster Action</span>
                      <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">15m Micro-break triggered</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-extrabold text-palette-navy text-lg mb-2">3. Responsive dispatch loop</h3>
                <p className="text-xs text-[#567C8D] leading-relaxed font-semibold">
                  The moment alert indexes drop, SentinelAI automatically schedules shift relief, sends push reminders to team supervisors, and updates the group roster map synchronously.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-palette-skyblue/40">
                <span className="text-[10px] text-palette-teal font-extrabold block">Operational Action</span>
                <span className="text-xs font-black text-palette-navy">Union-Compliant Break Rotation Loops</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Industrial Circadian Profiles: Protected vs. Critical Shifts */}
      <section id="safety-calculator" className="py-20 sm:py-28 bg-palette-beige relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 -z-10 h-72 w-72 rounded-full bg-palette-vanilla/25 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            
            {/* Left Narrative Column */}
            <div className="text-left max-w-xl">
              <span className="text-xs uppercase font-extrabold tracking-widest text-palette-teal bg-palette-white px-3.5 py-1.5 rounded-full border border-palette-skyblue/80">
                Roster Optimization
              </span>
              <h2 className="text-3xl font-black tracking-tight text-palette-navy mt-4 sm:text-5xl leading-tight">
                Circadian Shift Performance Profiles
              </h2>
              <p className="mt-4 text-base text-palette-teal leading-relaxed font-semibold">
                Compare typical sleep-deprived industrial shift cycles against SentinelAI active telemetry calibration maps. Our proactive mitigation prevents fatigue valleys from escalating into dangerous microsleep events.
              </p>

              <div className="mt-8 space-y-6 font-semibold">
                <div className="flex items-start gap-4">
                  <div className="p-1.5 rounded-xl bg-palette-beige border border-palette-skyblue text-palette-teal shrink-0 mt-1">
                    <Check className="h-5 w-5 text-palette-teal" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-palette-navy">Active Wearables Tuning</h4>
                    <p className="text-xs text-[#567C8D] mt-1">Senses minute fatigue signals using heart rate variability and physical reaction measurements.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-1.5 rounded-xl bg-palette-beige border border-palette-skyblue text-palette-teal shrink-0 mt-1">
                    <Check className="h-5 w-5 text-palette-teal" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-palette-navy">Fully Automated Safety Loop</h4>
                    <p className="text-xs text-[#567C8D] mt-1">Roster relief SOP adjustments are scheduled instantly when focus limits are reached.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hand-Designed Visual Comparison Timeline Blocks */}
            <div className="space-y-12">
              
              {/* Block A: Unmanaged Shift */}
              <div className="text-left relative pl-6 border-l-4 border-rose-500/40">
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-2 border-b border-palette-navy/10 mb-4">
                    <h3 className="font-extrabold text-palette-navy text-base flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> Unmanaged 12-Hour Shift Baseline
                    </h3>
                    <span className="text-[9px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded border border-rose-200">
                      Severe Incidents Risk
                    </span>
                  </div>

                  {/* Informative Step-by-Step Breakdown instead of SVG curves */}
                  <div className="space-y-3 my-5">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-[10px] font-black shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <strong className="text-xs text-palette-navy block">Hours 1–4: Baseline Operations</strong>
                        <p className="text-[11px] text-[#567C8D] leading-tight font-semibold">Normal cognitive performance. Alert levels hovering around 90-95%.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-[10px] font-black shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <strong className="text-xs text-palette-navy block">Hours 5–8: Cumulative Fatigue</strong>
                        <p className="text-[11px] text-[#567C8D] leading-tight font-semibold">Erosion of micro-blink latency. Cognitive vigilance slides down to 72%.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center text-palette-white text-[10px] font-black shrink-0 mt-0.5 animate-pulse">
                        3
                      </div>
                      <div>
                        <strong className="text-xs text-rose-600 block font-black">Hours 9–12: High-Risk Fatigue Valleys</strong>
                        <p className="text-[11px] text-[#567C8D] leading-tight font-semibold">Critical microsleep threshold reached. Heavy incident and error margin risks increase exponentially.</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#567C8D] font-semibold leading-relaxed">
                    Without structured, physical alert interventions, operating focus drops exponentially by <strong className="text-rose-700 font-extrabold">42% after Hour 8</strong>, causing high-risk reaction lags and structural incident gaps.
                  </p>
                </div>
              </div>

              {/* Block B: SentinelAI Calibrated Shift */}
              <div className="text-left relative pl-6 border-l-4 border-emerald-500/40">
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-2 border-b border-palette-navy/10 mb-4">
                    <h3 className="font-extrabold text-palette-navy text-base flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> SentinelAI Calibrated Shift Timeline
                    </h3>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded border border-emerald-200">
                      Standard Compliance
                    </span>
                  </div>

                  {/* Informative Step-by-Step Breakdown instead of SVG curves */}
                  <div className="space-y-3 my-5">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px] font-black shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <strong className="text-xs text-palette-navy block">Hours 1–4: Continuous Telemetry Monitoring</strong>
                        <p className="text-[11px] text-[#567C8D] leading-tight font-semibold">Cognitive safety and alertness baselines established locally.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-palette-vanilla flex items-center justify-center text-palette-navy text-[10px] font-black shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <strong className="text-xs text-palette-navy block">Hour 4 Rest Break: Micro-Relief Validation</strong>
                        <p className="text-[11px] text-[#567C8D] leading-tight font-semibold">SentinelAI triggers a proactive 15M relief window, immediately restoring fatigue bounds.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-palette-white text-[10px] font-black shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <strong className="text-xs text-emerald-600 block font-black">Hour 8 On-Time Rotation Plan</strong>
                        <p className="text-[11px] text-[#567C8D] leading-tight font-semibold">Safety compliance models reschedule rosters seamlessly, keeping alertness consistently above 85%.</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#567C8D] font-semibold leading-relaxed">
                    Calculated micro-relief windows strategically reset physical cognitive fatigue. Peak alert indices are maintained <strong className="text-emerald-600">safely above 85%</strong> for full shift duration.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlighting Grid */}
      <section id="features" className="py-16 sm:py-24 bg-palette-white border-t border-palette-skyblue">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-palette-navy sm:text-4xl">
              High-visibility security, ultimate privacy safety
            </h2>
            <p className="mt-3 text-lg text-[#567C8D] font-medium">
              Deploy modern wellness tools on high-risk sites with absolute trust.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Compliance First Security',
                desc: 'Compliant with OSHA roster structures, Union specifications, and advanced health telemetry privacy standards.',
                badge: 'Regulated Sites'
              },
              {
                icon: Clock,
                title: 'Real-time fatigue scoring',
                desc: 'Tracks micro-movements, heart variability patterns, and visual alertness metrics from secure wearable interfaces.',
                badge: 'Live Analytics'
              },
              {
                icon: Lock,
                title: 'GDPR / HIPAA-Grade Privacy',
                desc: 'Personal healthcare metrics remain fully secure, encrypted, and owned solely by the individual employee.',
                badge: 'Zero snooping'
              },
              {
                icon: Cpu,
                title: 'On-device edge AI algorithms',
                desc: 'Algorithms calculate fatigue indexes locally, minimizing system data leakage and ensuring rapid connectivity.',
                badge: 'Ultra Fast'
              },
              {
                icon: Zap,
                title: 'Automated relief triggers',
                desc: 'Triggers instant alerts via push notifications, and coordinates on-time relief shifts with team dispatch.',
                badge: 'Instant Roster'
              },
              {
                icon: ShieldCheck,
                title: 'Clinically proven science',
                desc: 'Models calibrated using internationally standardized sleep-deprivation research and alertness studies.',
                badge: 'Trusted Science'
              }
            ].map((f, idx) => (
              <div 
                key={idx} 
                className="bg-palette-beige/30 hover:bg-palette-floral border border-palette-skyblue hover:border-[#567C8D]/60 p-6 rounded-2xl transition-all hover:-translate-y-1 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-palette-white border border-palette-skyblue text-palette-teal mb-4 shadow-sm">
                    <f.icon className="h-5 w-5 text-palette-teal" />
                  </div>
                  <h3 className="font-extrabold text-palette-navy text-base mb-2">{f.title}</h3>
                  <p className="text-xs text-[#567C8D] leading-relaxed mb-4 font-semibold">{f.desc}</p>
                </div>
                <div className="pt-2 border-t border-palette-skyblue/40">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-palette-teal bg-palette-white border border-palette-skyblue px-2 py-0.5 rounded">
                    {f.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box Section using Palette Navy background with Beige contrast */}
      <section id="cta" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-palette-navy px-6 py-16 text-center sm:px-12 shadow-2xl">
          {/* Ring backdrop decoration */}
          <div className="absolute -right-20 -top-24 h-[30rem] w-[30rem] rounded-full bg-palette-teal/20 blur-3xl opacity-50" />
          <div className="absolute -left-20 -bottom-24 h-[30rem] w-[30rem] rounded-full bg-palette-skyblue/10 blur-3xl opacity-50" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#FFFDF4] sm:text-5xl">
              See SentinelAI on your floor today
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-palette-beige/90 leading-relaxed font-medium">
              Experience the full interactive sandbox. Switch seamlessly between Employee trackers, Manager operational dashboards, and Executive setups.
            </p>

            <ul className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-palette-beige">
              {['Instant setup in sandbox', 'Compliant demo data', 'Full role switcher access'].map((t) => (
                <li key={t} className="flex items-center gap-1.5 bg-palette-white/10 px-3 py-1 rounded-full text-[11px] border border-palette-white/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FFF1B9]" /> {t}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col justify-center sm:flex-row gap-3">
              <button 
                onClick={goSignIn}
                className="bg-[#FFF1B9] text-palette-navy hover:bg-[#FFFDF4] hover:scale-[1.03] transition-all font-extrabold px-8 py-4 rounded-xl shadow-lg w-full sm:w-auto"
              >
                Access Roster Sandbox <ArrowRight className="h-4 w-4 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Styled Footer */}
      <footer className="border-t border-palette-skyblue bg-palette-white py-12 text-xs">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-[#567C8D] font-medium">
            <ShieldCheck className="h-4 w-4 text-[#567C8D]" /> © 2026 SentinelAI. All rights reserved.
          </div>
          <div className="flex gap-6 text-[#567C8D] font-bold">
            <a href="#" className="hover:text-palette-navy transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-palette-navy transition-colors">Information Shield Security</a>
            <a href="#" className="hover:text-palette-navy transition-colors">OSHA SOP Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
