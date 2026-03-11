'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, CheckCircle2, ExternalLink, Key, MessageCircle, Monitor, Shield, Zap } from 'lucide-react'

export default function SettingsPage() {
  const [geelarkKey, setGeelarkKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('user_settings').select('geelark_api_key').single().then(({ data }) => {
      if (data?.geelark_api_key) setGeelarkKey(data.geelark_api_key)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('user_settings')
      .update({ geelark_api_key: geelarkKey.trim() })
      .eq('user_id', user.id)
    setLoading(false)
    if (error) { setError(error.message) } else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'transparent' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
          CONFIGURATION
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Settings
        </h1>
      </div>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Geelark Integration card ── */}
        <div style={{
          borderRadius: 16, padding: '1.75rem',
          border: '1px solid rgba(0,229,200,0.12)',
          background: 'rgba(0,229,200,0.015)',
        }}>

          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              border: '1px solid rgba(0,229,200,0.3)',
              background: 'rgba(0,229,200,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Key size={15} style={{ color: '#00e5c8' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                Geelark Integration
              </div>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.1em', marginTop: 2 }}>
                REQUIRED TO RUN AUTOMATION
              </div>
            </div>
          </div>

          {/* What it does */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
              What this does
            </div>
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              border: '1px solid rgba(0,229,200,0.08)',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Monitor size={12} style={{ color: '#00e5c8', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(224,224,224,0.6)', lineHeight: 1.6 }}>
                  When you launch a batch, the automation provisions <span style={{ color: '#00e5c8', fontWeight: 600 }}>cloud Android phones directly inside your Geelark account</span>. You will see them appear live in your Geelark dashboard under your profiles list.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Shield size={12} style={{ color: 'rgba(0,212,255,0.6)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(224,224,224,0.6)', lineHeight: 1.6 }}>
                  Your key is used only to create and manage phones in <span style={{ color: 'rgba(0,212,255,0.8)', fontWeight: 600 }}>your own Geelark account</span>. We never share keys or use them for anything else.
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimers */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(251,191,36,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
              Before you run — checklist
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                {
                  title: 'Profile slots',
                  body: 'Your Geelark plan must have enough free profile slots for the batch size. If your plan is full, Geelark will reject the phone creation and the job will fail.',
                  color: 'rgba(251,191,36,0.7)',
                  bg: 'rgba(251,191,36,0.04)',
                  border: 'rgba(251,191,36,0.15)',
                },
                {
                  title: 'Geelark minutes / run time credits',
                  body: 'Each account creation uses Geelark run-time minutes. If your account runs out of minutes mid-automation, the cloud phone will be killed and the account will fail. Ensure you have sufficient minutes before launching a large batch.',
                  color: 'rgba(251,191,36,0.7)',
                  bg: 'rgba(251,191,36,0.04)',
                  border: 'rgba(251,191,36,0.15)',
                },
              ].map(item => (
                <div key={item.title} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${item.border}`,
                  background: item.bg,
                }}>
                  <AlertTriangle size={11} style={{ color: item.color, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, color: item.color, marginBottom: 3 }}>
                      {item.title}
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(224,224,224,0.45)', lineHeight: 1.6 }}>
                      {item.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to get key — step by step */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,212,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
              How to get your API key
            </div>
            <div style={{
              padding: '14px 16px', borderRadius: 10,
              border: '1px solid rgba(0,212,255,0.12)',
              background: 'rgba(0,212,255,0.03)',
              display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              {[
                { step: '01', label: 'Go to geelark.com', desc: 'Open the Geelark website and log in to your account' },
                { step: '02', label: 'Open your account menu', desc: 'Click your avatar or account name in the top-right corner' },
                { step: '03', label: 'Navigate to Settings', desc: 'Select "Settings" from the dropdown menu' },
                { step: '04', label: 'Click "Open API"', desc: 'Find the "Open API" tab in the Settings sidebar' },
                { step: '05', label: 'Generate or copy your token', desc: 'Click "Generate Token" if you don\'t have one, then copy it to clipboard' },
                { step: '06', label: 'Paste below and save', desc: 'Paste the token in the field below and click Save Settings' },
              ].map((s, i, arr) => (
                <div key={s.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: i < arr.length - 1 ? 12 : 0, marginBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 700, color: '#00d4ff',
                  }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700, color: 'rgba(0,212,255,0.85)', marginBottom: 2 }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(224,224,224,0.4)', lineHeight: 1.5 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
              <a
                href="https://geelark.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#00d4ff',
                  textDecoration: 'none', padding: '6px 12px', borderRadius: 6,
                  border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.05)',
                  width: 'fit-content',
                }}
              >
                <ExternalLink size={10} />
                Open geelark.com
              </a>
            </div>
          </div>

          {/* Error / success */}
          {error && (
            <div style={{
              marginBottom: '1rem', padding: '10px 14px',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.06)',
              borderRadius: 8,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444',
            }}>
              {error}
            </div>
          )}
          {saved && (
            <div style={{
              marginBottom: '1rem', padding: '10px 14px',
              border: '1px solid rgba(0,229,200,0.3)',
              background: 'rgba(0,229,200,0.06)',
              borderRadius: 8,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#00e5c8',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCircle2 size={13} />
              API key saved — automation is ready to launch
            </div>
          )}

          {/* Input + save */}
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block', marginBottom: 8,
                fontSize: 9, fontFamily: '"JetBrains Mono", monospace',
                color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>
                Geelark API Key
              </label>
              <input
                type="password"
                value={geelarkKey}
                onChange={e => setGeelarkKey(e.target.value)}
                placeholder="Paste your Geelark API token here"
                autoComplete="off"
                spellCheck={false}
                className="matrix-input"
              />
              {geelarkKey && (
                <div style={{ marginTop: 6, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={9} />
                  Key entered · click Save to apply
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !geelarkKey.trim()}
              className="btn-matrix-solid"
              style={{ borderRadius: 8, padding: '11px 24px', fontSize: 11, letterSpacing: '0.1em', alignSelf: 'flex-start', opacity: !geelarkKey.trim() ? 0.4 : 1 }}
            >
              {loading ? 'Saving…' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Support */}
        <div style={{
          borderRadius: 14, padding: '1.75rem',
          border: '1px solid rgba(255,255,255,0.05)',
          background: '#000',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid rgba(0,212,255,0.2)',
              background: 'rgba(0,212,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MessageCircle size={13} style={{ color: '#00d4ff' }} />
            </div>
            <div style={{ fontSize: 12, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
              Support &amp; Payments
            </div>
          </div>
          <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'rgba(224,224,224,0.5)', lineHeight: 1.6 }}>
            For credits, billing questions, or support — contact{' '}
            <span style={{ color: '#00e5c8', fontWeight: 600 }}>@aidetectionkiller</span>
            {' '}on Telegram. Payments are processed via crypto.
          </div>
        </div>

        {/* System info */}
        <div style={{
          borderRadius: 14, padding: '1.5rem 1.75rem',
          border: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Zap size={12} style={{ color: 'rgba(0,229,200,0.3)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.2)', letterSpacing: '0.05em' }}>
            VA NIGHTMARE AUTOMATION · v1.0 · All systems operational
          </span>
        </div>
      </div>
    </div>
  )
}
