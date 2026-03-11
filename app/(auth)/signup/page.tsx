'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MatrixRain from '@/components/MatrixRain'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div style={{
        position: 'relative',
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        overflow: 'hidden',
      }}>
        <MatrixRain opacity={0.07} />
        <div className="scanlines" />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px', padding: '0 24px', textAlign: 'center' }}>
          {/* Shield / check icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}>
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'rgba(0,229,200,0.08)',
              border: '2px solid rgba(0,229,200,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(0,229,200,0.25)',
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="check-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00b8d9" />
                    <stop offset="55%" stopColor="#00e5c8" />
                    <stop offset="100%" stopColor="#00f5d4" />
                  </linearGradient>
                </defs>
                <polyline points="8,21 17,30 32,12" stroke="url(#check-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 800,
            fontSize: '1.4rem',
            letterSpacing: '0.12em',
            background: 'linear-gradient(135deg, #00b8d9, #00e5c8, #00f5d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '14px',
          }}>
            ACCOUNT INITIALIZED
          </div>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            color: 'rgba(224,224,224,0.5)',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}>
            Check your email to confirm, then sign in.
          </p>

          <Link href="/login" style={{
            display: 'inline-block',
            padding: '13px 40px',
            background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
            color: '#000',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            borderRadius: '8px',
            textDecoration: 'none',
            boxShadow: '0 0 24px rgba(0,229,200,0.35)',
          }}>
            SIGN IN
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'flex', minHeight: '100vh', background: '#000', overflow: 'hidden' }}>
      <MatrixRain opacity={0.07} />
      <div className="scanlines" />

      {/* Left brand panel */}
      <div style={{
        width: '45%',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        background: 'rgba(0,229,200,0.02)',
        borderRight: '1px solid rgba(0,229,200,0.08)',
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bolt-grad-signup" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00b8d9" />
                <stop offset="55%" stopColor="#00e5c8" />
                <stop offset="100%" stopColor="#00f5d4" />
              </linearGradient>
            </defs>
            <polygon points="18,2 8,18 15,18 14,30 24,14 17,14" fill="url(#bolt-grad-signup)" />
          </svg>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '0.18em',
            background: 'linear-gradient(135deg, #00b8d9, #00e5c8, #00f5d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            VA NIGHTMARE
          </span>
        </div>

        {/* Center content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '24px', paddingBottom: '24px' }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            color: 'rgba(0,229,200,0.45)',
            textTransform: 'uppercase',
            marginBottom: '28px',
          }}>
            OPERATOR TERMINAL
          </div>

          <div style={{ marginBottom: '48px' }}>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              lineHeight: 1.1,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              <div>Automate.</div>
              <div>Scale.</div>
              <div style={{
                background: 'linear-gradient(135deg, #00b8d9, #00e5c8, #00f5d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 18px rgba(0,229,200,0.55))',
              }}>
                Dominate.
              </div>
            </div>
          </div>

          {/* Benefit rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              'Fully automated A-Z account creation',
              'Pay only for live confirmed accounts',
              'Scale without teams or VAs',
            ].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00e5c8',
                  boxShadow: '0 0 8px rgba(0,229,200,0.7)',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.78rem',
                  color: 'rgba(224,224,224,0.7)',
                  letterSpacing: '0.02em',
                }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '100px',
          background: 'rgba(0,229,200,0.04)',
          border: '1px solid rgba(0,229,200,0.15)',
          width: 'fit-content',
        }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px rgba(34,197,94,0.8)',
            animation: 'pulse-green 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            color: 'rgba(0,229,200,0.6)',
            textTransform: 'uppercase',
          }}>
            SYSTEM ONLINE · AUTOMATIONS RUNNING
          </span>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        width: '55%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Form heading */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              color: 'rgba(0,229,200,0.5)',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}>
              CREATE ACCOUNT
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              color: 'rgba(224,224,224,0.45)',
            }}>
              New Operator
            </div>
          </div>

          {/* Glass card */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(0,229,200,0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            padding: '36px 32px',
            boxShadow: '0 0 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,229,200,0.02)',
          }}>
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(239,68,68,0.35)',
                background: 'rgba(239,68,68,0.07)',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.75rem',
                color: '#f87171',
                letterSpacing: '0.02em',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignup}>
              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(0,229,200,0.6)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="agent@agency.com"
                  required
                  className="matrix-input"
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(0,229,200,0.6)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="matrix-input"
                />
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(0,229,200,0.6)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="matrix-input"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? 'rgba(0,229,200,0.3)' : 'linear-gradient(135deg, #00b8d9, #00e5c8)',
                  color: '#000',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 0 24px rgba(0,229,200,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s, opacity 0.15s',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 30px rgba(0,229,200,0.5)'
                  }
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? 'none' : '0 0 24px rgba(0,229,200,0.35)'
                }}
              >
                {loading ? 'INITIALIZING...' : 'INITIALIZE ACCOUNT'}
              </button>
            </form>

            {/* Footer link */}
            <div style={{
              marginTop: '24px',
              textAlign: 'center',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.72rem',
              color: 'rgba(224,224,224,0.35)',
              letterSpacing: '0.04em',
            }}>
              Already have an account?{' '}
              <Link href="/login" style={{
                color: '#00e5c8',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(0,229,200,0.3)',
                paddingBottom: '1px',
              }}>
                Sign in
              </Link>
            </div>
          </div>

          {/* Trial badge */}
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(251,191,36,0.25)',
            background: 'rgba(251,191,36,0.04)',
            textAlign: 'center',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.68rem',
            color: 'rgba(251,191,36,0.75)',
            letterSpacing: '0.04em',
            lineHeight: 1.5,
          }}>
            Trial period active until 15 March · 2 credits/account · 10 accounts max
          </div>
        </div>
      </div>
    </div>
  )
}
