import Link from 'next/link'
import MatrixRain from '@/components/MatrixRain'
import SimulationPanel from '@/components/SimulationPanel'

const FEATURES = [
  { icon: '⚡', title: 'Full Automation', desc: 'Phone verification, photos, profile, preferences. Completely hands-free.' },
  { icon: '☁', title: 'Cloud Phones', desc: 'Every account runs on its own isolated Geelark Android phone. Your API key.' },
  { icon: '📊', title: 'Live Tracking', desc: 'Stage-by-stage progress on every account. Automatic retries on failure.' },
  { icon: '🎯', title: 'Pay Per Success', desc: 'Credits deducted only on confirmed live accounts. Never pay for failures.' },
  { icon: '🔒', title: 'Data Isolation', desc: 'Row-level security. Your accounts and data are 100% isolated.' },
  { icon: '♾', title: 'Unlimited Scale', desc: 'Queue hundreds of accounts. Batch processing with smart retry logic.' },
]

const STAGES = [
  ['01', 'Cloud Phone Setup',     'Provision a fresh Geelark Android phone using your API key'],
  ['02', 'App Configuration',     'Configure Bumble environment and automation context'],
  ['03', 'Phone Verification',    'Register with a real US number via live SMS verification'],
  ['04', 'Profile & Photos',      'Upload photos, set name, age and basic profile data'],
  ['05', 'Profile Completion',    'Answer Bumble questions, set city, age range, preferences'],
  ['06', 'AI Confirmation',       'Vision AI confirms live account — credit charged only here'],
]

const PRICING = [
  { label: 'Trial',   sub: 'First 10 accounts',    price: '$2',   per: '/account',  note: 'One time only' },
  { label: 'No Plan', sub: 'After trial',           price: '$5',   per: '/account',  note: 'Pay as you go' },
  { label: 'Growth',  sub: '100+ accounts/month',   price: '$2.50',per: '/account',  note: '$250 flat/month' },
  { label: 'Scale',   sub: '500+ accounts/month',   price: '$1.00',per: '/account',  note: '$250 flat/month', highlight: true },
  { label: 'Agency',  sub: '1000+ accounts/month',  price: '$0.50',per: '/account',  note: '$250 flat/month' },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#000] text-[#e0e0e0] overflow-x-hidden">
      <MatrixRain opacity={0.10} />

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-[rgba(0,255,65,0.08)]">
        <div>
          <div className="font-mono text-lg font-black tracking-[0.2em] text-[#00ff41]">VA NIGHTMARE</div>
          <div className="font-mono text-[9px] tracking-[0.25em] text-[rgba(0,255,65,0.4)] uppercase">Automation Platform</div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="font-mono text-xs tracking-widest text-[rgba(224,224,224,0.5)] hover:text-[#00ff41] transition-colors uppercase">
            Sign In
          </Link>
          <Link href="/signup" className="btn-matrix-solid text-xs px-5 py-2.5 rounded font-mono tracking-widest">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pt-20 pb-24">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}
          className="hero-grid">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded border border-[rgba(0,255,65,0.2)] bg-[rgba(0,255,65,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" style={{ display: 'inline-block' }} />
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#00ff41] uppercase">Agency Automation Platform</span>
            </div>

            <h1 className="font-mono font-black leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              <span style={{ color: '#ffffff', display: 'block' }}>Scale Your Dating</span>
              <span style={{ color: '#ffffff', display: 'block' }}>App Agency</span>
              <span className="text-glow" style={{ color: '#00ff41', display: 'block' }}>Without Limits.</span>
            </h1>

            <p style={{ color: 'rgba(224,224,224,0.65)', lineHeight: '1.8', fontSize: '1.05rem', maxWidth: '480px', marginBottom: '2.5rem' }}>
              Fully automated Bumble account creation. Cloud phones, SMS verification,
              profile setup — all handled. You focus on clients, we handle the grind.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link href="/signup" className="btn-matrix-solid rounded font-mono text-sm tracking-widest px-8 py-3">
                Start Free Trial
              </Link>
              <Link href="/login" className="btn-matrix rounded font-mono text-sm tracking-widest px-8 py-3">
                <span>Sign In</span>
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '3rem' }}>
              {[['100%', 'Automated'], ['6', 'Stages'], ['24/7', 'Running']].map(([n, l]) => (
                <div key={l}>
                  <div className="font-mono font-black text-[#00ff41] text-glow" style={{ fontSize: '1.75rem' }}>{n}</div>
                  <div className="font-mono uppercase tracking-widest" style={{ fontSize: '0.65rem', color: 'rgba(0,255,65,0.45)', marginTop: '0.25rem' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Simulation */}
          <div>
            <SimulationPanel />
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-20" style={{ borderTop: '1px solid rgba(0,255,65,0.08)', background: 'rgba(0,0,0,0.5)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="font-mono uppercase tracking-[0.25em] mb-3" style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.5)' }}>
              Platform Features
            </div>
            <h2 className="font-mono font-bold text-white" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              Everything Your Agency Needs
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {FEATURES.map(f => (
              <div key={f.title} className="glass-card rounded-xl" style={{ padding: '1.75rem' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{f.icon}</div>
                <div className="font-mono font-bold" style={{ fontSize: '0.8rem', color: '#00ff41', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(224,224,224,0.55)', lineHeight: '1.7' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="font-mono uppercase tracking-[0.25em] mb-3" style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.5)' }}>
              The Process
            </div>
            <h2 className="font-mono font-bold text-white" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              Six Stages to a Live Account
            </h2>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '1.5rem', top: 0, bottom: 0, width: '1px', background: 'rgba(0,255,65,0.12)' }} />
            {STAGES.map(([num, title, desc]) => (
              <div key={num} style={{ display: 'flex', gap: '2rem', paddingBottom: '1.75rem', paddingLeft: '4rem', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0,
                  width: '3rem', height: '3rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(0,255,65,0.25)',
                  background: 'rgba(0,255,65,0.04)',
                  borderRadius: '0.375rem',
                }}>
                  <span className="font-mono font-bold" style={{ fontSize: '0.7rem', color: '#00ff41' }}>{num}</span>
                </div>
                <div>
                  <div className="font-mono font-bold text-white" style={{ fontSize: '0.875rem', marginBottom: '0.3rem' }}>{title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(224,224,224,0.45)', lineHeight: '1.6' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-20" style={{ borderTop: '1px solid rgba(0,255,65,0.08)', background: 'rgba(0,0,0,0.5)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="font-mono uppercase tracking-[0.25em] mb-3" style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.5)' }}>
              Pricing
            </div>
            <h2 className="font-mono font-bold text-white" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              Pay Only for Success
            </h2>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'rgba(224,224,224,0.4)' }}>
              1 credit = $1. Credits charged only when an account is confirmed live.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {PRICING.map(p => (
              <div key={p.label} style={{
                borderRadius: '0.75rem',
                padding: '1.5rem 1.25rem',
                textAlign: 'center',
                border: p.highlight ? '1px solid #00ff41' : '1px solid rgba(0,255,65,0.1)',
                background: p.highlight ? 'rgba(0,255,65,0.05)' : 'rgba(0,0,0,0.3)',
                boxShadow: p.highlight ? '0 0 30px rgba(0,255,65,0.12)' : 'none',
                position: 'relative',
              }}>
                {p.highlight && (
                  <div className="font-mono uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: '#00ff41', marginBottom: '0.75rem' }}>
                    Most Popular
                  </div>
                )}
                <div className="font-mono font-bold text-white" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{p.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(224,224,224,0.4)', marginBottom: '1rem' }}>{p.sub}</div>
                <div className="font-mono font-black" style={{ fontSize: '1.75rem', color: p.highlight ? '#00ff41' : '#ffffff', lineHeight: 1 }}>{p.price}</div>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'rgba(224,224,224,0.4)', marginBottom: '0.75rem' }}>{p.per}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.5)', borderTop: '1px solid rgba(0,255,65,0.08)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  {p.note}
                </div>
              </div>
            ))}
          </div>

          <p className="font-mono" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(0,255,65,0.35)' }}>
            Payments via crypto · Contact @aidetectionkiller on Telegram
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-28" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="font-mono font-black text-white" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', marginBottom: '1.25rem' }}>
            Ready to <span className="text-glow" style={{ color: '#00ff41' }}>Automate</span>?
          </h2>
          <p style={{ color: 'rgba(224,224,224,0.5)', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: '1.7' }}>
            Join agency owners scaling their operations with VA Nightmare.
          </p>
          <Link href="/signup" className="btn-matrix-solid inline-block rounded font-mono tracking-widest" style={{ fontSize: '0.875rem', padding: '1rem 3rem' }}>
            Create Account
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 md:px-12 py-6" style={{ borderTop: '1px solid rgba(0,255,65,0.08)', textAlign: 'center' }}>
        <span className="font-mono" style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.25)', letterSpacing: '0.15em' }}>
          © 2026 VA NIGHTMARE · AUTOMATION PLATFORM · @aidetectionkiller
        </span>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          section > div > div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          section > div > div[style*="grid-template-columns: repeat(5"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
