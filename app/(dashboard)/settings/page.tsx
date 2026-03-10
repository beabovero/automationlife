'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

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
    <div className="p-8">
      <h1 className="mb-8 font-mono text-2xl font-bold text-white">Settings</h1>

      <div className="max-w-lg space-y-6">
        {/* Geelark */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-1 font-mono text-sm font-bold text-white">Geelark Integration</h2>
          <p className="mb-5 text-xs text-[rgba(224,224,224,0.5)]">
            Your Geelark API key is used to provision and manage cloud phones for account creation.
            You can also provide it per-job when creating a new job.
          </p>

          {error && (
            <div className="mb-4 rounded border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-4 py-3 font-mono text-xs text-red-400">
              {error}
            </div>
          )}

          {saved && (
            <div className="mb-4 flex items-center gap-2 rounded border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] px-4 py-3 font-mono text-xs text-[#00ff41]">
              <CheckCircle2 size={14} />
              Settings saved
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,255,65,0.5)] uppercase">
                Geelark API Key
              </label>
              <input
                type="text"
                value={geelarkKey}
                onChange={e => setGeelarkKey(e.target.value)}
                placeholder="gl_xxxxxxxxxxxxxxxx"
                className="matrix-input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-matrix-solid rounded px-6 py-2.5 text-sm">
              {loading ? 'Saving…' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Contact */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-1 font-mono text-sm font-bold text-white">Support & Payments</h2>
          <p className="text-xs text-[rgba(224,224,224,0.5)]">
            For credits, billing questions, or support — contact{' '}
            <span className="text-[#00ff41]">@aidetectionkiller</span> on Telegram.
            Payments are processed via crypto.
          </p>
        </div>
      </div>
    </div>
  )
}
