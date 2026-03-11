'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Key, MessageCircle, Zap } from 'lucide-react'

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

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Geelark integration */}
        <div style={{
          borderRadius: 14, padding: '1.75rem',
          border: '1px solid rgba(0,229,200,0.1)',
          background: 'rgba(0,229,200,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid rgba(0,229,200,0.25)',
              background: 'rgba(0,229,200,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Key size={13} style={{ color: '#00e5c8' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                Geelark Integration
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: 'rgba(224,224,224,0.45)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Your Geelark API key is used to provision and manage cloud phones for account creation.
            You can also provide it per-job when creating a new job.
          </div>

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
              Settings saved successfully
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block', marginBottom: 8,
                fontSize: 9, fontFamily: '"JetBrains Mono", monospace',
                color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>
                API Key
              </label>
              <input
                type="text"
                value={geelarkKey}
                onChange={e => setGeelarkKey(e.target.value)}
                placeholder="gl_xxxxxxxxxxxxxxxx"
                className="matrix-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-matrix-solid"
              style={{ borderRadius: 8, padding: '11px 24px', fontSize: 11, letterSpacing: '0.1em', alignSelf: 'flex-start' }}
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
