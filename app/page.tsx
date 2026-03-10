import Link from 'next/link'
import MatrixRain from '@/components/MatrixRain'
import GlitchText from '@/components/GlitchText'
import SimulationPanel from '@/components/SimulationPanel'

const FEATURES = [
  { icon: '⚡', title: 'Automated Account Creation', desc: 'Full Bumble pipeline — phone verification, photos, profile, preferences. Hands-free.' },
  { icon: '☁', title: 'Geelark Cloud Phones', desc: 'Each account runs on its own isolated Android cloud phone. Your API key, your control.' },
  { icon: '📊', title: 'Real-time Job Tracking', desc: 'Watch every account\'s progress live. Stage-by-stage status. Automatic retries on failure.' },
  { icon: '🎯', title: 'Pay Per Success', desc: 'Credits only deducted on confirmed successful accounts. Never pay for failures.' },
  { icon: '🔒', title: 'Agency-grade Security', desc: 'Row-level data isolation. Your accounts, your data. Zero cross-contamination.' },
  { icon: '♾', title: 'Unlimited Scale', desc: 'Queue 100s of accounts. Batch processing with intelligent retry logic.' },
]

const PRICING = [
  { label: 'Trial (3–7 days)', price: '$2', unit: '/account', note: '10 accounts max, one-time' },
  { label: 'Pay as you go', price: '$5', unit: '/account', note: 'After trial, no plan' },
  { label: 'Growth Plan', price: '$250', unit: '/month', note: '$2.50/account · 100 min' },
  { label: 'Scale Plan', price: '$250', unit: '/month', note: '$1.00/account · 500 min', popular: true },
  { label: 'Agency Plan', price: '$250', unit: '/month', note: '$0.50/account · 1000+' },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#000]">
      <MatrixRain opacity={0.12} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between border-b border-[rgba(0,255,65,0.1)] px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xl font-black tracking-widest text-[#00ff41]">VA NIGHTMARE</div>
          <span className="font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.4)] border border-[rgba(0,255,65,0.2)] rounded px-2 py-0.5">AUTOMATION</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="font-mono text-sm text-[rgba(224,224,224,0.6)] hover:text-[#00ff41] transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="btn-matrix-solid text-sm px-5 py-2 rounded">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 pt-24 pb-16">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded border border-[rgba(0,255,65,0.2)] bg-[rgba(0,255,65,0.04)] px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff41] animate-pulse" />
              <span className="font-mono text-xs tracking-widest text-[#00ff41]">AGENCY AUTOMATION PLATFORM</span>
            </div>

            <GlitchText
              as="h1"
              text="Scale Your Dating App Agency"
              className="mb-2 font-mono text-5xl font-black leading-tight tracking-tight text-white"
            />
            <h1 className="mb-6 font-mono text-5xl font-black leading-tight tracking-tight text-[#00ff41] text-glow">
              Without Limits.
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-[rgba(224,224,224,0.7)]">
              Fully automated Bumble account creation. Cloud phones, SMS verification,
              profile setup — all handled. You focus on clients, we handle the grind.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="btn-matrix-solid inline-block text-base px-8 py-3 rounded">
                Start Free Trial
              </Link>
              <Link href="/login" className="btn-matrix inline-block text-base px-8 py-3 rounded">
                <span>Sign In</span>
              </Link>
            </div>

            <div className="mt-8 flex gap-8">
              {[['100%', 'Automated'], ['6', 'Stages'], ['24/7', 'Running']].map(([n, l]) => (
                <div key={l}>
                  <div className="font-mono text-2xl font-black text-[#00ff41]">{n}</div>
                  <div className="font-mono text-xs tracking-widest text-[rgba(224,224,224,0.4)] uppercase">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SimulationPanel />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-t border-[rgba(0,255,65,0.08)] bg-[rgba(0,0,0,0.6)] px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="mb-2 font-mono text-xs tracking-widest text-[rgba(0,255,65,0.5)] uppercase">Platform Features</div>
            <h2 className="font-mono text-3xl font-bold text-white">Everything Your Agency Needs</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.title} className="glass-card rounded-xl p-6 group">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 font-mono text-sm font-bold tracking-wide text-[#00ff41]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[rgba(224,224,224,0.6)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-2 font-mono text-xs tracking-widest text-[rgba(0,255,65,0.5)] uppercase">How It Works</div>
            <h2 className="font-mono text-3xl font-bold text-white">Six Stages to a Live Account</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[rgba(0,255,65,0.15)]" />
            {[
              ['S1', 'Cloud Phone Setup',     'Provision a fresh Geelark Android cloud phone with your API key'],
              ['S2', 'Profile Configuration', 'Configure app settings and prepare the automation environment'],
              ['S3', 'Phone Verification',    'Register Bumble with a real US number via SMS verification'],
              ['S4', 'Profile Photos',        'Upload your photos, set name, age, and basic profile data'],
              ['S5', 'Profile Completion',    'Answer all Bumble questions, set location radius, preferences'],
              ['S6', 'Confirmation',          'AI vision confirms live account — credit is deducted on success'],
            ].map(([stage, title, desc]) => (
              <div key={stage} className="relative flex gap-6 pb-8 pl-14">
                <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] font-mono text-xs font-bold text-[#00ff41]">
                  {stage}
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-white">{title}</div>
                  <div className="mt-1 text-sm text-[rgba(224,224,224,0.5)]">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 border-t border-[rgba(0,255,65,0.08)] bg-[rgba(0,0,0,0.6)] px-8 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="mb-2 font-mono text-xs tracking-widest text-[rgba(0,255,65,0.5)] uppercase">Pricing</div>
            <h2 className="font-mono text-3xl font-bold text-white">Pay Only for Success</h2>
            <p className="mt-2 text-[rgba(224,224,224,0.5)] text-sm">1 credit = $1. Credits deducted only on confirmed successful accounts.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {PRICING.map(p => (
              <div
                key={p.label}
                className={`rounded-xl p-5 text-center ${
                  p.popular
                    ? 'border border-[#00ff41] bg-[rgba(0,255,65,0.06)] shadow-[0_0_30px_rgba(0,255,65,0.15)]'
                    : 'glass-card'
                }`}
              >
                {p.popular && (
                  <div className="mb-3 font-mono text-[10px] tracking-widest text-[#00ff41] uppercase">Most Popular</div>
                )}
                <div className="font-mono text-xs text-[rgba(224,224,224,0.5)] uppercase tracking-wide">{p.label}</div>
                <div className="mt-2 font-mono text-2xl font-black text-white">{p.price}</div>
                <div className="font-mono text-xs text-[rgba(224,224,224,0.4)]">{p.unit}</div>
                <div className="mt-2 text-[11px] text-[rgba(224,224,224,0.4)]">{p.note}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center font-mono text-xs text-[rgba(0,255,65,0.4)]">
            Payments via crypto · Contact @aidetectionkiller on Telegram
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-8 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 font-mono text-4xl font-black text-white">
            Ready to <span className="text-[#00ff41] text-glow">Automate</span>?
          </h2>
          <p className="mb-8 text-[rgba(224,224,224,0.6)]">
            Join agency owners scaling their operations with VA Nightmare.
          </p>
          <Link href="/signup" className="btn-matrix-solid inline-block text-lg px-12 py-4 rounded">
            Create Account
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[rgba(0,255,65,0.08)] px-8 py-6 text-center">
        <span className="font-mono text-xs text-[rgba(0,255,65,0.3)]">
          © 2026 VA NIGHTMARE · AUTOMATION PLATFORM · @aidetectionkiller
        </span>
      </footer>
    </div>
  )
}
