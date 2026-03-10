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
    color: '#00e5c8',
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
    color: '#00e5c8',
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
const TRIAL_BENEFITS = [
  'Full 6-stage automation — every feature unlocked',
  'Geelark cloud phone provisioned per account',
  'Real US number · live SMS verification',
  'AI vision confirms account before credit is charged',
  'Real-time stage tracking on every account',
  'No monthly setup fee during trial period',
]

const MONTHLY_BENEFITS = [
  'Volume-based credit pricing — the more you run, the less you pay',
  'Priority job queue — your jobs processed first',
  'Dedicated infrastructure for your workload',
  'Batch processing — queue hundreds at once',
  'Dedicated support channel with fast response',
  'Full API access for custom integrations',
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
        borderBottom: `1px solid ${scrolled ? 'rgba(0,229,200,0.12)' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, border: '1px solid #00e5c8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '6px',
            boxShadow: '0 0 12px rgba(0,229,200,0.35)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="2.5">
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
              onMouseEnter={e => (e.currentTarget.style.color = '#00e5c8')}
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
              letterSpacing: '0.1em', color: '#000', background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
              padding: '9px 20px', borderRadius: '5px', textDecoration: 'none',
              transition: 'box-shadow 0.2s, background 0.2s',
              boxShadow: '0 0 20px rgba(0,229,200,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #00a8c9, #00c4aa)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,200,0.55)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #00b8d9, #00e5c8)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,229,200,0.3)' }}
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
          background: 'radial-gradient(ellipse, rgba(0,229,200,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
          {/* Left */}
          <div>
            {/* Status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', marginBottom: '2.5rem',
              border: '1px solid rgba(0,229,200,0.2)',
              background: 'rgba(0,229,200,0.04)',
              borderRadius: '100px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5c8', boxShadow: '0 0 8px #00e5c8', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.18em', color: '#00e5c8' }}>
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
                background: 'linear-gradient(135deg, #00b8d9 0%, #00e5c8 55%, #00f5d4 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(0,229,200,0.5))',
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
                color: '#000', background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
                padding: '14px 32px', borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 0 30px rgba(0,229,200,0.35)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 40px rgba(0,229,200,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,200,0.35)' }}
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
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,200,0.3)'; e.currentTarget.style.color = '#00e5c8' }}
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
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(0,229,200,0.5)', marginTop: '4px', textTransform: 'uppercase' }}>{l}</div>
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
        borderTop: '1px solid rgba(0,229,200,0.08)',
        borderBottom: '1px solid rgba(0,229,200,0.08)',
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
              color: item === '·' ? 'rgba(0,229,200,0.3)' : 'rgba(224,224,224,0.3)',
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
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(0,229,200,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Platform Capabilities
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', letterSpacing: '-0.03em', maxWidth: '500px', lineHeight: 1.1 }}>
              Everything your agency needs to scale
            </h2>
          </div>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(0,229,200,0.07)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,229,200,0.07)' }}>
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
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,200,0.025)')}
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
                  color: i === 5 ? '#00e5c8' : 'rgba(0,212,255,0.5)',
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
                    color: '#00e5c8', opacity: 0.7,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5c8', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
                    CREDIT CHARGED HERE
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ───────────────────────────────────────────────────── */}
      <section style={{ padding: '7rem 2.5rem', position: 'relative', zIndex: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>

        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(239,68,68,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(0,229,200,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(239,68,68,0.6)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              For Agency Owners
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', color: '#fff', letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: '1.75rem' }}>
              <span style={{ display: 'block', color: 'rgba(224,224,224,0.25)', textDecoration: 'line-through', fontSize: '0.65em', letterSpacing: '-0.02em', marginBottom: '0.3em', fontStyle: 'italic' }}>VAs. Salaries. Headaches.</span>
              The old way<br />
              <span style={{ background: 'linear-gradient(135deg, #00b8d9 0%, #00e5c8 55%, #00f5d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 30px rgba(0,229,200,0.5))' }}>
                is dead.
              </span>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', color: 'rgba(224,224,224,0.4)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.75 }}>
              Agencies are bleeding money on VA teams that produce inconsistent results. There is a better way — one that scales infinitely without a single hire.
            </p>
          </div>

          {/* Comparison cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>

            {/* ─── OLD WAY ─── */}
            <div style={{ borderRadius: '20px', border: '1px solid rgba(239,68,68,0.2)', background: '#000', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(239,68,68,0.8), rgba(239,68,68,0.2), transparent)' }} />
              <div style={{ padding: '2.25rem 2.5rem' }}>
                {/* Label */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', marginBottom: '2rem', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', borderRadius: '6px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(239,68,68,0.7)', textTransform: 'uppercase' }}>The Old Way</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    ['Hiring & training VA teams',          'Weeks to onboard, months to trust'],
                    ['Monthly salaries & payroll',          'Fixed costs whether you produce or not'],
                    ['A/B testing creation methods',        'Hit-and-miss, burning accounts & money'],
                    ['Management overhead',                 'Daily babysitting, quality control'],
                    ['Inconsistent account quality',        'Every VA does it differently'],
                    ['Scaling = hiring more people',        'Linear cost growth with no ceiling'],
                    ['Knowledge dies when VA quits',        'Start from zero every time you replace'],
                  ].map(([pain, sub], i) => (
                    <div key={pain} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '14px',
                      padding: '1rem 0',
                      borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      animation: `slide-up 0.4s ease ${i * 0.07}s both`,
                    }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(224,224,224,0.55)', lineHeight: 1.3, marginBottom: '2px' }}>{pain}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.775rem', color: 'rgba(239,68,68,0.45)', lineHeight: 1.4 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── NEW WAY ─── */}
            <div style={{ borderRadius: '20px', border: '1px solid rgba(0,229,200,0.3)', background: '#000', overflow: 'hidden', position: 'relative', boxShadow: '0 0 80px rgba(0,229,200,0.07)', animation: 'glow-border 3s ease-in-out infinite' }}>
              <div style={{ height: '2px', background: 'linear-gradient(90deg, #00b8d9, #00e5c8, #00f5d4)' }} />

              {/* Top-right badge */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontFamily: '"JetBrains Mono", monospace', fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', color: '#000', background: 'linear-gradient(135deg, #00b8d9, #00e5c8)', padding: '5px 12px', borderRadius: '4px' }}>
                YOUR EDGE
              </div>

              <div style={{ padding: '2.25rem 2.5rem' }}>
                {/* Label */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', marginBottom: '2rem', border: '1px solid rgba(0,229,200,0.25)', background: 'rgba(0,229,200,0.06)', borderRadius: '6px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.18em', color: '#00e5c8', textTransform: 'uppercase' }}>With VA Nightmare</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    ['Scale on autopilot — no team needed',   'One platform replaces your entire creation team'],
                    ['Zero salaries. Zero payroll.',           'Pay only for accounts that go live. Nothing else.'],
                    ['Proven method. No testing required.',    'Six stages, perfected. Works every single time.'],
                    ['Zero management overhead',               'Set it. Run it. Collect accounts.'],
                    ['Consistent quality, every account',      'Same pipeline. Same result. Always.'],
                    ['Scaling = clicking a number',            'Infinite output. No new hires, ever.'],
                    ['System knowledge stays forever',         'No VA dependency. No single point of failure.'],
                  ].map(([win, sub], i) => (
                    <div key={win} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '14px',
                      padding: '1rem 0',
                      borderBottom: i < 6 ? '1px solid rgba(0,229,200,0.06)' : 'none',
                      animation: `slide-up 0.4s ease ${0.1 + i * 0.07}s both`,
                    }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(0,229,200,0.35)', background: 'rgba(0,229,200,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', boxShadow: '0 0 8px rgba(0,229,200,0.2)' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#fff', lineHeight: 1.3, marginBottom: '2px' }}>{win}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.775rem', color: 'rgba(0,229,200,0.5)', lineHeight: 1.4 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom impact strip — 3 big callouts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(0,229,200,0.07)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,229,200,0.07)' }}>
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="1.75"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
                headline: 'Max output.',
                sub: 'Min input.',
                body: 'Queue accounts and walk away. The system runs 24/7 — while you focus on growth, clients, and everything that actually matters.',
                color: '#00e5c8',
                glow: 'rgba(0,229,200,0.15)',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.9)" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
                headline: 'No team.',
                sub: 'No headaches.',
                body: 'Eliminate VA hiring, training, managing, and replacing entirely. Your operation never depends on a person — only on the system.',
                color: 'rgba(168,85,247,0.9)',
                glow: 'rgba(168,85,247,0.15)',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.9)" strokeWidth="1.75"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
                headline: 'Cut costs.',
                sub: 'Keep results.',
                body: 'Every dollar that used to go to salaries, payroll, and wasted test accounts now goes straight to production output.',
                color: 'rgba(0,212,255,0.9)',
                glow: 'rgba(0,212,255,0.15)',
              },
            ].map((c) => (
              <div key={c.headline} style={{ background: '#000', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden', transition: 'background 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                onMouseLeave={e => (e.currentTarget.style.background = '#000')}
              >
                {/* Glow blob */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: `radial-gradient(ellipse at 50% 0%, ${c.glow} 0%, transparent 100%)`, pointerEvents: 'none' }} />
                <div style={{ marginBottom: '1.25rem', opacity: 0.9 }}>{c.icon}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.2rem' }}>{c.headline}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '1rem', background: `linear-gradient(135deg, ${c.color}, rgba(255,255,255,0.4))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{c.sub}</div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', color: 'rgba(224,224,224,0.4)', lineHeight: 1.75 }}>{c.body}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── QUALITY GUARANTEE ──────────────────────────────────────────── */}
      <section style={{ padding: '7rem 2.5rem', position: 'relative', zIndex: 10, overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(0,229,200,0.04) 0%, rgba(168,85,247,0.02) 50%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', marginBottom: '1.5rem', border: '1px solid rgba(0,229,200,0.2)', background: 'rgba(0,229,200,0.04)', borderRadius: '100px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.2em', color: '#00e5c8' }}>QUALITY GUARANTEE</span>
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: '1.5rem' }}>
              Every account.<br />
              <span style={{ background: 'linear-gradient(135deg, #00b8d9 0%, #00e5c8 50%, #00f5d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 30px rgba(0,229,200,0.5))' }}>
                Bulletproof.
              </span>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', color: 'rgba(224,224,224,0.4)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.75 }}>
              Built over 6+ months. Refined through thousands of test accounts. Backed by 4 years of industry experience. This isn&apos;t a script — it&apos;s a system.
            </p>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(0,229,200,0.07)', borderRadius: '14px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid rgba(0,229,200,0.07)' }}>
            {[
              { value: '6+',    unit: 'months',   label: 'In active development', color: '#00e5c8' },
              { value: '4',     unit: 'years',    label: 'Industry experience',   color: '#00e5c8' },
              { value: '100%',  unit: '',         label: 'Pay-per-success only',  color: '#00e5c8' },
              { value: 'A–Z',   unit: '',         label: 'Real user simulation',  color: '#00e5c8' },
            ].map(s => (
              <div key={s.value} style={{ background: '#000', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,229,200,0.3), transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.75rem', letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(135deg, #00b8d9, #00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</span>
                  {s.unit && <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'rgba(0,229,200,0.5)', letterSpacing: '0.08em' }}>{s.unit}</span>}
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(224,224,224,0.3)', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Main bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: '1.25rem' }}>

            {/* CARD 1 — Trust Score (large, span 2) */}
            <div style={{ gridColumn: 'span 2', borderRadius: '18px', border: '1px solid rgba(0,229,200,0.2)', background: '#000', overflow: 'hidden', position: 'relative', transition: 'border-color 0.3s, box-shadow 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,200,0.4)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(0,229,200,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,229,200,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ height: '2px', background: 'linear-gradient(90deg, #00b8d9, #00e5c8, #00f5d4)' }} />
              <div style={{ padding: '2.25rem 2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(0,229,200,0.5)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Trust Score</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                      Highest trust score.<br />Every single account.
                    </div>
                  </div>
                  {/* Score visual */}
                  <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: '50%', border: '2px solid rgba(0,229,200,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 0 30px rgba(0,229,200,0.15)' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(#00e5c8 0deg 324deg, rgba(0,229,200,0.08) 324deg 360deg)' }} />
                    <div style={{ position: 'absolute', inset: '4px', borderRadius: '50%', background: '#000' }} />
                    <span style={{ position: 'relative', fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '16px', background: 'linear-gradient(135deg, #00b8d9, #00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>90%</span>
                  </div>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'rgba(224,224,224,0.45)', lineHeight: 1.75, marginBottom: '1.5rem', maxWidth: '520px' }}>
                  The automation mimics genuine human behaviour at every step — from how photos are selected, to timing between taps, to question responses. Bumble&apos;s trust algorithms see a real person, not a bot.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['Native interaction patterns', 'Real device fingerprint', 'Human-timed sequences', 'Organic profile build'].map(t => (
                    <div key={t} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(0,229,200,0.6)', border: '1px solid rgba(0,229,200,0.15)', background: 'rgba(0,229,200,0.04)', padding: '5px 12px', borderRadius: '4px' }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 2 — Pay Per Success */}
            <div style={{ borderRadius: '18px', border: '1px solid rgba(168,85,247,0.2)', background: '#000', overflow: 'hidden', position: 'relative', transition: 'border-color 0.3s, box-shadow 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(168,85,247,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(168,85,247,0.8), rgba(0,229,200,0.5))' }} />
              <div style={{ padding: '2rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '10px', border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.9)" strokeWidth="1.75"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(168,85,247,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Zero Risk</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.01em', marginBottom: '0.75rem', lineHeight: 1.3 }}>Credits deducted only on confirmed live accounts</div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(224,224,224,0.4)', lineHeight: 1.7 }}>
                  Stage 6 AI vision confirms the account is active before a single credit is touched. Failed runs cost you nothing.
                </p>
              </div>
            </div>

            {/* CARD 3 — Photo Pipeline */}
            <div style={{ borderRadius: '18px', border: '1px solid rgba(0,212,255,0.18)', background: '#000', overflow: 'hidden', position: 'relative', transition: 'border-color 0.3s, box-shadow 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.18)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(0,212,255,0.8), rgba(0,229,200,0.5))' }} />
              <div style={{ padding: '2rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '10px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.9)" strokeWidth="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(0,212,255,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Custom Built</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.01em', marginBottom: '0.75rem', lineHeight: 1.3 }}>Proprietary photo pipeline</div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(224,224,224,0.4)', lineHeight: 1.7 }}>
                  Custom-built tools process every photo before upload — uniqueness, quality, and platform compliance all handled automatically.
                </p>
              </div>
            </div>

            {/* CARD 4 — Battle Tested (span 2) */}
            <div style={{ gridColumn: 'span 2', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)', background: '#000', overflow: 'hidden', position: 'relative', transition: 'border-color 0.3s, box-shadow 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,200,0.2)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,200,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(0,229,200,0.2), rgba(168,85,247,0.3), transparent)' }} />
              <div style={{ padding: '2rem 2.5rem', display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(224,224,224,0.3)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Battle-Tested</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.01em', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                    6+ months of development. 4 years of industry expertise.
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(224,224,224,0.4)', lineHeight: 1.7, maxWidth: '420px' }}>
                    Every edge case encountered. Every failure mode patched. The system was built by operators who have spent 4+ years inside the dating app agency industry — we know exactly what breaks accounts and how to avoid it.
                  </p>
                </div>
                {/* Timeline visual */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    { label: 'Industry start',   date: '2021', color: 'rgba(224,224,224,0.2)' },
                    { label: 'Automation R&D',   date: '2024', color: 'rgba(0,212,255,0.5)' },
                    { label: 'Pipeline built',   date: '2025', color: 'rgba(0,229,200,0.7)' },
                    { label: 'System live',      date: '2026', color: '#00e5c8', active: true },
                  ].map((t, i) => (
                    <div key={t.date} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: i < 3 ? '16px' : '0', position: 'relative' }}>
                      {i < 3 && <div style={{ position: 'absolute', left: '5px', top: '14px', width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />}
                      <div style={{ width: 11, height: 11, borderRadius: '50%', border: `1px solid ${t.color}`, background: (t as {active?: boolean}).active ? t.color : 'transparent', flexShrink: 0, boxShadow: (t as {active?: boolean}).active ? `0 0 10px ${t.color}` : 'none' }} />
                      <div>
                        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', fontWeight: 700, color: t.color, letterSpacing: '0.1em' }}>{t.date}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(224,224,224,0.3)' }}>{t.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom guarantee banner */}
          <div style={{ marginTop: '1.5rem', padding: '1.75rem 2.5rem', borderRadius: '14px', border: '1px solid rgba(0,229,200,0.12)', background: 'rgba(0,229,200,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', border: '1px solid rgba(0,229,200,0.25)', background: 'rgba(0,229,200,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(0,229,200,0.1)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.01em', marginBottom: '2px' }}>Guaranteed quality or you don&apos;t pay.</div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.05em' }}>Credits are charged exclusively on AI-confirmed live accounts. Every time.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexShrink: 0 }}>
              {['No pay on failure', 'AI-confirmed only', 'Tested at scale'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5c8', boxShadow: '0 0 8px rgba(0,229,200,0.6)' }} />
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(0,229,200,0.5)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '7rem 2.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(0,229,200,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Pricing
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1.25rem' }}>
              Pay only when accounts go live
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', color: 'rgba(224,224,224,0.4)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.75 }}>
              1 credit = $1 = 1 live Bumble account.<br />Credits are charged only at Stage 6 AI confirmation.
            </p>
          </div>

          {/* Two-column layout: Trial (left) + Monthly teaser (right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>

            {/* ─── TRIAL CARD ─── */}
            <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,229,200,0.3)', background: '#000', boxShadow: '0 0 80px rgba(0,229,200,0.07)', position: 'relative', transition: 'transform 0.25s, box-shadow 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 80px rgba(0,229,200,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 80px rgba(0,229,200,0.07)' }}
            >
              {/* Gradient top bar */}
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #00b8d9, #00e5c8, #00f5d4)' }} />

              {/* Trial ends badge */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontFamily: '"JetBrains Mono", monospace', fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', color: '#000', background: 'linear-gradient(135deg, #00b8d9, #00e5c8)', padding: '5px 12px', borderRadius: '4px' }}>
                ENDS 15 MARCH
              </div>

              <div style={{ padding: '2.25rem 2.5rem 2.5rem' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', letterSpacing: '0.2em', color: '#00e5c8', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Trial</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(224,224,224,0.35)', marginBottom: '2rem' }}>Test the full system, no monthly commitment</div>

                {/* Price hero */}
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '4.5rem', letterSpacing: '-0.05em', lineHeight: 1, background: 'linear-gradient(135deg, #00b8d9, #00e5c8, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 20px rgba(0,229,200,0.4))' }}>
                    2
                  </span>
                  <div style={{ paddingBottom: '10px' }}>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 700, color: '#00e5c8', letterSpacing: '0.05em' }}>credits</div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(224,224,224,0.35)', letterSpacing: '0.05em' }}>per account</div>
                  </div>
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.08em', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  Max 10 accounts · No monthly fee · Limited period
                </div>

                {/* Benefits */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2.25rem' }}>
                  {TRIAL_BENEFITS.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px', opacity: 0.8 }}>
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(224,224,224,0.5)', lineHeight: 1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup" style={{
                  display: 'block', textAlign: 'center', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                  fontSize: '12px', letterSpacing: '0.14em', color: '#000',
                  background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
                  padding: '15px', borderRadius: '10px', textDecoration: 'none',
                  boxShadow: '0 0 30px rgba(0,229,200,0.35)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 50px rgba(0,229,200,0.55)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,200,0.35)' }}
                >
                  START TRIAL — 2 CREDITS/ACCOUNT
                </Link>
              </div>
            </div>

            {/* ─── MONTHLY PLANS TEASER ─── */}
            <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(168,85,247,0.2)', background: '#000', position: 'relative', transition: 'transform 0.25s, box-shadow 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 80px rgba(168,85,247,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Gradient top bar */}
              <div style={{ height: '3px', background: 'linear-gradient(90deg, rgba(168,85,247,0.8), rgba(0,229,200,0.8))' }} />

              {/* Coming soon badge */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontFamily: '"JetBrains Mono", monospace', fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(168,85,247,0.9)', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.07)', padding: '5px 12px', borderRadius: '4px' }}>
                MONTHLY PLANS
              </div>

              <div style={{ padding: '2.25rem 2.5rem 2.5rem' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(168,85,247,0.9)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Scale</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(224,224,224,0.35)', marginBottom: '2rem' }}>Volume pricing — the more you create, the less you pay</div>

                {/* Price teaser */}
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', letterSpacing: '0.15em', color: 'rgba(224,224,224,0.3)', marginBottom: '6px' }}>AS LOW AS</div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '4.5rem', letterSpacing: '-0.05em', lineHeight: 1, background: 'linear-gradient(135deg, rgba(168,85,247,0.9), #00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.35))' }}>
                      0.5
                    </span>
                  </div>
                  <div style={{ paddingBottom: '10px' }}>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 700, color: 'rgba(168,85,247,0.9)', letterSpacing: '0.05em' }}>credits</div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(224,224,224,0.35)', letterSpacing: '0.05em' }}>per account</div>
                  </div>
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.08em', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  Tiered volume pricing · The more you run, the less each costs
                </div>

                {/* Benefits */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2.25rem' }}>
                  {MONTHLY_BENEFITS.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.8)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px', opacity: 0.8 }}>
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(224,224,224,0.5)', lineHeight: 1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>

                {/* "Waitlist" CTA — vague, creates curiosity */}
                <a href="https://t.me/aidetectionkiller" target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textAlign: 'center', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                  fontSize: '12px', letterSpacing: '0.14em', color: 'rgba(168,85,247,0.9)',
                  background: 'transparent', border: '1px solid rgba(168,85,247,0.3)',
                  padding: '15px', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.07)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(168,85,247,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  GET EARLY ACCESS
                </a>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div style={{ textAlign: 'center', marginTop: '2rem', fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(224,224,224,0.18)', letterSpacing: '0.1em' }}>
            Payments via crypto · @aidetectionkiller on Telegram
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
          background: 'radial-gradient(ellipse, rgba(0,229,200,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', marginBottom: '2.5rem',
            border: '1px solid rgba(0,229,200,0.2)',
            background: 'rgba(0,229,200,0.04)',
            borderRadius: '100px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5c8', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', letterSpacing: '0.18em', color: '#00e5c8' }}>
              ACCEPTING NEW OPERATORS
            </span>
          </div>

          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '1.5rem' }}>
            Ready to automate<br />
            <span style={{ background: 'linear-gradient(135deg, #00b8d9, #00e5c8, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 30px rgba(0,229,200,0.4))' }}>
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
            color: '#000', background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
            padding: '18px 52px', borderRadius: '8px',
            textDecoration: 'none',
            boxShadow: '0 0 40px rgba(0,229,200,0.4), 0 0 80px rgba(0,229,200,0.15)',
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 60px rgba(0,229,200,0.6), 0 0 100px rgba(0,229,200,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,200,0.4), 0 0 80px rgba(0,229,200,0.15)' }}
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
          <div style={{ width: 22, height: 22, border: '1px solid rgba(0,229,200,0.4)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="2.5">
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
