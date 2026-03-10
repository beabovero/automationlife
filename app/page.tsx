'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import MatrixRain from '@/components/MatrixRain'
import TerminalWindow from '@/components/TerminalWindow'

/* ─── Marquee ───────────────────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  'Automated Account Creation', '·', 'Geelark Cloud Phones', '·',
  'SMS Verification', '·', 'AI Vision Confirmation', '·',
  'Pay Per Success', '·', 'Real-time Progress', '·',
  'Batch Processing', '·', 'Agency-grade Security', '·',
]

/* ─── Features bento ────────────────────────────────────────────────────── */
const BENTO = [
  {
    id: 'main', span: 2,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
      </svg>
    ),
    color: '#00ff41',
    label: 'Full Pipeline Automation',
    desc: 'Six stages — phone provisioning, SMS verification, profile photos, all Bumble questions, preferences, and AI confirmation. Zero manual steps.',
    tag: 'CORE',
  },
  {
    id: 'cloud', span: 1,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
      </svg>
    ),
    color: '#00d4ff',
    label: 'Geelark Cloud Phones',
    desc: 'Each account gets its own isolated Android cloud phone. Your API key. Your control.',
    tag: 'INFRA',
  },
  {
    id: 'tracking', span: 1,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    ),
    color: '#a855f7',
    label: 'Live Job Tracking',
    desc: 'Watch every account progress through stages in real time. Instant failure alerts.',
    tag: 'OPS',
  },
  {
    id: 'pay', span: 1,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    color: '#00ff41',
    label: 'Pay Per Success',
    desc: 'Credits deducted only when Stage 6 AI confirms a live account.',
    tag: 'BILLING',
  },
  {
    id: 'retry', span: 1,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    ),
    color: '#00d4ff',
    label: 'Smart Retry Logic',
    desc: 'Failed accounts are automatically retried up to 2 times before being marked failed.',
    tag: 'RESILIENCE',
  },
  {
    id: 'scale', span: 1,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    color: '#a855f7',
    label: 'Unlimited Scale',
    desc: 'Queue hundreds of accounts. Batch processing. One worker handles everything.',
    tag: 'SCALE',
  },
]

/* ─── Stages ────────────────────────────────────────────────────────────── */
const STAGES = [
  { n: '01', title: 'Provision',    desc: 'New Geelark cloud phone created with your API key' },
  { n: '02', title: 'Configure',    desc: 'App environment prepared and automation initialized' },
  { n: '03', title: 'Verify',       desc: 'Real US number, live SMS code, Bumble registered' },
  { n: '04', title: 'Build Profile',desc: 'Photos uploaded, name, age, and bio set' },
  { n: '05', title: 'Complete',     desc: 'All questions answered, city and preferences set' },
  { n: '06', title: 'Confirm',      desc: 'AI vision confirms live account — credit charged' },
]

/* ─── Pricing ───────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: 'Trial',
    desc: 'Test the system',
    price: '$2',
    per: 'per account',
    limit: '10 accounts max · one time',
    highlight: false,
    features: ['Full automation pipeline', 'Real-time tracking', 'Photo upload'],
  },
  {
    name: 'Scale',
    desc: 'For growing agencies',
    price: '$250',
    per: 'per month',
    limit: '$1.00/account · 500+ accounts',
    highlight: true,
    features: ['Everything in Growth', 'Priority processing', 'Volume discount', 'Dedicated support'],
  },
  {
    name: 'Agency',
    desc: 'Maximum volume',
    price: '$250',
    per: 'per month',
    limit: '$0.50/account · 1000+ accounts',
    highlight: false,
    features: ['Everything in Scale', 'Lowest per-account cost', 'Bulk credit grants'],
  },
]

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: '#000', minHeight: '100vh', overflowX: 'hidden', color: '#e0e0e0' }}>
      <MatrixRain opacity={0.07} />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '0 2.5rem',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
        background: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,255,65,0.12)' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, border: '1px solid #00ff41',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '6px',
            boxShadow: '0 0 12px rgba(0,255,65,0.35)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="2.5">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 700, letterSpacing: '0.18em', color: '#fff' }}>
              VA NIGHTMARE
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {['Features', 'How It Works', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(224,224,224,0.45)', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00ff41')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(224,224,224,0.45)')}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/login"
            style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(224,224,224,0.5)', textDecoration: 'none' }}>
            SIGN IN
          </Link>
          <Link href="/signup"
            style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', color: '#000', background: '#00ff41',
              padding: '9px 20px', borderRadius: '5px', textDecoration: 'none',
              transition: 'box-shadow 0.2s, background 0.2s',
              boxShadow: '0 0 20px rgba(0,255,65,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00cc33'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,65,0.55)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#00ff41'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.3)' }}
          >
            GET STARTED
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', paddingTop: '64px',
        display: 'flex', alignItems: 'center',
        padding: '64px 2.5rem 0',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(0,255,65,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
          {/* Left */}
          <div>
            {/* Status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', marginBottom: '2.5rem',
              border: '1px solid rgba(0,255,65,0.2)',
              background: 'rgba(0,255,65,0.04)',
              borderRadius: '100px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff41', boxShadow: '0 0 8px #00ff41', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.18em', color: '#00ff41' }}>
                SYSTEM ONLINE · AUTOMATIONS RUNNING
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ margin: 0, lineHeight: 1.0, marginBottom: '2rem', letterSpacing: '-0.03em' }}>
              <span style={{ display: 'block', fontSize: 'clamp(3rem, 5.5vw, 5.5rem)', fontWeight: 900, color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
                Scale.
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(3rem, 5.5vw, 5.5rem)', fontWeight: 900, color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
                Create.
              </span>
              <span style={{
                display: 'block',
                fontSize: 'clamp(3rem, 5.5vw, 5.5rem)', fontWeight: 900, fontFamily: 'Inter, sans-serif',
                color: '#00ff41',
                textShadow: '0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.15)',
              }}>
                Dominate.
              </span>
            </h1>

            <p style={{
              fontSize: '1.1rem', lineHeight: 1.75,
              color: 'rgba(224,224,224,0.55)',
              maxWidth: '440px', marginBottom: '2.5rem',
              fontFamily: 'Inter, sans-serif',
            }}>
              Fully automated Bumble account creation for dating app agencies.
              Cloud phones, SMS, AI confirmation — all handled. You scale, we automate.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{
                display: 'inline-block',
                fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                fontSize: '12px', letterSpacing: '0.12em',
                color: '#000', background: '#00ff41',
                padding: '14px 32px', borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 0 30px rgba(0,255,65,0.35)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 40px rgba(0,255,65,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,65,0.35)' }}
              >
                START FREE TRIAL
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontFamily: '"JetBrains Mono", monospace', fontWeight: 600,
                fontSize: '12px', letterSpacing: '0.12em',
                color: 'rgba(224,224,224,0.65)',
                padding: '14px 28px', borderRadius: '6px',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)'; e.currentTarget.style.color = '#00ff41' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(224,224,224,0.65)' }}
              >
                SIGN IN
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              {[['6', 'Automation stages'], ['100%', 'Hands-free'], ['24/7', 'Always running']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.75rem', color: '#fff', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(0,255,65,0.5)', marginTop: '4px', textTransform: 'uppercase' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Terminal */}
          <div>
            <TerminalWindow />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid rgba(0,255,65,0.08)',
        borderBottom: '1px solid rgba(0,255,65,0.08)',
        padding: '14px 0',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', animation: 'marquee 25s linear infinite', gap: '3rem', width: 'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px', letterSpacing: '0.15em', whiteSpace: 'nowrap',
              color: item === '·' ? 'rgba(0,255,65,0.3)' : 'rgba(224,224,224,0.3)',
              textTransform: 'uppercase',
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES BENTO ─────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '7rem 2.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(0,255,65,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Platform Capabilities
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', letterSpacing: '-0.03em', maxWidth: '500px', lineHeight: 1.1 }}>
              Everything your agency needs to scale
            </h2>
          </div>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(0,255,65,0.07)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,255,65,0.07)' }}>
            {BENTO.map((item) => (
              <div
                key={item.id}
                style={{
                  gridColumn: item.span === 2 ? 'span 2' : 'span 1',
                  background: '#000',
                  padding: '2.25rem',
                  position: 'relative',
                  transition: 'background 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,65,0.025)')}
                onMouseLeave={e => (e.currentTarget.style.background = '#000')}
              >
                {/* Tag */}
                <div style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '9px', letterSpacing: '0.2em',
                  color: item.color,
                  opacity: 0.5,
                }}>
                  {item.tag}
                </div>

                <div style={{ color: item.color, marginBottom: '1.25rem', opacity: 0.85 }}>{item.icon}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: item.span === 2 ? '1.15rem' : '1rem', color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(224,224,224,0.45)', lineHeight: 1.7, maxWidth: item.span === 2 ? '480px' : '100%' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '7rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(0,212,255,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              The Process
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Six stages.<br />
              <span style={{ color: 'rgba(224,224,224,0.35)' }}>One live account.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden' }}>
            {STAGES.map((s, i) => (
              <div
                key={s.n}
                style={{ background: '#000', padding: '2rem 1.5rem', position: 'relative', transition: 'background 0.25s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = '#000')}
              >
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '11px', fontWeight: 700,
                  color: i === 5 ? '#00ff41' : 'rgba(0,212,255,0.5)',
                  marginBottom: '1.25rem', letterSpacing: '0.1em',
                }}>
                  {s.n}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#fff', marginBottom: '0.5rem' }}>
                  {s.title}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(224,224,224,0.38)', lineHeight: 1.6 }}>
                  {s.desc}
                </div>
                {i === 5 && (
                  <div style={{
                    marginTop: '1rem',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '9px', letterSpacing: '0.15em',
                    color: '#00ff41', opacity: 0.7,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff41', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
                    CREDIT CHARGED HERE
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '7rem 2.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(168,85,247,0.6)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Pricing
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Only pay for success
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(224,224,224,0.4)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7 }}>
              1 credit = $1. Credits are only charged when Stage 6 AI confirms a live Bumble account.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {PLANS.map(plan => (
              <div
                key={plan.name}
                style={{
                  borderRadius: '14px',
                  padding: '2.25rem',
                  border: plan.highlight ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  background: plan.highlight ? 'rgba(0,255,65,0.04)' : 'rgba(255,255,255,0.02)',
                  boxShadow: plan.highlight ? '0 0 50px rgba(0,255,65,0.08), inset 0 0 30px rgba(0,255,65,0.02)' : 'none',
                  position: 'relative',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em',
                    color: '#000', background: '#00ff41',
                    padding: '4px 16px',
                    borderRadius: '0 0 8px 8px',
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{plan.name}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(224,224,224,0.4)', marginBottom: '1.75rem' }}>{plan.desc}</div>

                <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.75rem', color: plan.highlight ? '#00ff41' : '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'rgba(224,224,224,0.35)' }}>{plan.per}</span>
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: plan.highlight ? 'rgba(0,255,65,0.6)' : 'rgba(224,224,224,0.3)', marginBottom: '2rem', letterSpacing: '0.05em' }}>
                  {plan.limit}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? '#00ff41' : 'rgba(224,224,224,0.3)'} strokeWidth="2.5">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(224,224,224,0.55)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup" style={{
                  display: 'block', textAlign: 'center',
                  fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                  fontSize: '11px', letterSpacing: '0.12em',
                  padding: '12px', borderRadius: '7px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  ...(plan.highlight
                    ? { background: '#00ff41', color: '#000', boxShadow: '0 0 20px rgba(0,255,65,0.3)' }
                    : { background: 'transparent', color: 'rgba(224,224,224,0.55)', border: '1px solid rgba(255,255,255,0.08)' }
                  ),
                }}
                  onMouseEnter={e => {
                    if (plan.highlight) e.currentTarget.style.boxShadow = '0 0 35px rgba(0,255,65,0.5)'
                    else { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)'; e.currentTarget.style.color = '#00ff41' }
                  }}
                  onMouseLeave={e => {
                    if (plan.highlight) e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.3)'
                    else { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(224,224,224,0.55)' }
                  }}
                >
                  GET STARTED
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'rgba(0,255,65,0.3)', letterSpacing: '0.1em' }}>
            Payments via crypto · Contact @aidetectionkiller on Telegram
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 10, overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(0,255,65,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', marginBottom: '2.5rem',
            border: '1px solid rgba(0,255,65,0.2)',
            background: 'rgba(0,255,65,0.04)',
            borderRadius: '100px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff41', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.18em', color: '#00ff41' }}>
              ACCEPTING NEW OPERATORS
            </span>
          </div>

          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '1.5rem' }}>
            Ready to automate<br />
            <span style={{ color: '#00ff41', textShadow: '0 0 50px rgba(0,255,65,0.3)' }}>
              at scale?
            </span>
          </h2>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', color: 'rgba(224,224,224,0.45)', maxWidth: '440px', margin: '0 auto 3rem', lineHeight: 1.75 }}>
            Join agency owners who stopped doing things manually. Your first 10 accounts start at $2 each.
          </p>

          <Link href="/signup" style={{
            display: 'inline-block',
            fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
            fontSize: '13px', letterSpacing: '0.15em',
            color: '#000', background: '#00ff41',
            padding: '18px 52px', borderRadius: '8px',
            textDecoration: 'none',
            boxShadow: '0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.15)',
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 60px rgba(0,255,65,0.6), 0 0 100px rgba(0,255,65,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.15)' }}
          >
            CREATE FREE ACCOUNT
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 22, height: 22, border: '1px solid rgba(0,255,65,0.4)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="2.5">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>
            VA NIGHTMARE
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <Link href="/login" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(224,224,224,0.25)', textDecoration: 'none' }}>SIGN IN</Link>
          <Link href="/signup" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(224,224,224,0.25)', textDecoration: 'none' }}>GET STARTED</Link>
        </div>

        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.08em', color: 'rgba(224,224,224,0.18)' }}>
          © 2026 VA NIGHTMARE · @aidetectionkiller
        </div>
      </footer>

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 900px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(6, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          div[style*="span 2"] {
            grid-column: span 1 !important;
          }
          header nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
