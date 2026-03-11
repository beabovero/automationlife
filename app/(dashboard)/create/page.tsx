'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import SimulationPanel from '@/components/SimulationPanel'
import { Upload, X, PlusCircle, Zap, Lock, AlertTriangle, Eye } from 'lucide-react'

const MAX_PHOTOS = 6

const STAGE_FEATURES = [
  { n: 1, label: 'Cloud Phone',     desc: 'Dedicated Geelark Android phone provisioned per account' },
  { n: 2, label: 'Session Setup',   desc: 'Isolated app session, real device fingerprint' },
  { n: 3, label: 'SMS Verify',      desc: 'Real US number, live SMS code interception & input' },
  { n: 4, label: 'Profile Build',   desc: 'Name, bio, photos uploaded — exactly like a real user' },
  { n: 5, label: 'Preferences',     desc: 'Age range, city, who-to-meet — all configured' },
  { n: 6, label: 'AI Confirmation', desc: 'Vision AI confirms account is live before charging' },
]

export default function CreateJobPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    accounts_count: 1,
    bumble_city: '',
    bumble_age_min: 22,
    bumble_age_max: 35,
    profile_name: '',
    profile_bio: '',
    geelark_api_key: '',
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [previewTab, setPreviewTab] = useState<'pipeline' | 'simulation'>('pipeline')

  useEffect(() => {
    supabase.from('user_settings').select('credits').single().then(({ data }) => {
      setCredits(data?.credits ?? 0)
    })
  }, [])

  const onDrop = useCallback((accepted: File[]) => {
    const remaining = MAX_PHOTOS - photos.length
    const toAdd = accepted.slice(0, remaining)
    setPhotos(prev => [...prev, ...toAdd])
    setPhotoPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
  }, [photos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: MAX_PHOTOS,
    disabled: photos.length >= MAX_PHOTOS,
  })

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photoPreviews[i])
    setPhotos(p => p.filter((_, idx) => idx !== i))
    setPhotoPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if ((credits ?? 0) === 0) { setError('No credits available. Top up to launch jobs.'); return }
    if (photos.length === 0) { setError('Upload at least one profile photo'); return }
    if (!form.geelark_api_key.trim()) { setError('Geelark API key is required'); return }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: settings } = await supabase.from('user_settings').select('credits').eq('user_id', user.id).single()
      if ((settings?.credits ?? 0) < form.accounts_count) {
        setError(`Insufficient credits. You have ${settings?.credits ?? 0}, need ${form.accounts_count}.`)
        setLoading(false)
        return
      }

      const { data: job, error: jobErr } = await supabase.from('jobs').insert({
        user_id: user.id,
        status: 'queued',
        total_accounts: form.accounts_count,
        completed_accounts: 0,
        failed_accounts: 0,
        credits_reserved: form.accounts_count,
        credits_charged: 0,
        config: { ...form, photos: [] },
        started_at: null, completed_at: null, worker_id: null, error_message: null,
      }).select().single()
      if (jobErr) throw jobErr

      const storagePaths: string[] = []
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const path = `${user.id}/${job.id}/${i}_${file.name}`
        const { error: upErr } = await supabase.storage.from('account-photos').upload(path, file)
        if (upErr) throw upErr
        storagePaths.push(path)
        await supabase.from('account_photos').insert({ account_id: job.id, job_id: job.id, user_id: user.id, storage_path: path, original_filename: file.name, order_index: i })
      }

      await supabase.from('jobs').update({ config: { ...form, photos: storagePaths } }).eq('id', job.id)
      router.push(`/jobs/${job.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
      setLoading(false)
    }
  }

  const noCredits = credits !== null && credits === 0
  const insufficientCredits = credits !== null && credits < form.accounts_count && credits > 0
  const canSubmit = !noCredits && !insufficientCredits && !loading

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'transparent' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
            NEW JOB
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Create Automation Job
          </h1>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
            {credits === null
              ? 'Loading…'
              : noCredits
                ? <span style={{ color: 'rgba(251,191,36,0.6)' }}>0 credits — top up to launch</span>
                : <span>Available: <span style={{ color: '#00e5c8', fontWeight: 700 }}>{credits}</span> credits · charged on success only</span>
            }
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${noCredits ? 'rgba(251,191,36,0.2)' : 'rgba(0,229,200,0.15)'}`, background: noCredits ? 'rgba(251,191,36,0.04)' : 'rgba(0,229,200,0.04)' }}>
          {noCredits ? <Lock size={12} style={{ color: 'rgba(251,191,36,0.5)' }} /> : <Zap size={12} style={{ color: '#00e5c8' }} />}
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: noCredits ? 'rgba(251,191,36,0.5)' : 'rgba(0,229,200,0.6)', letterSpacing: '0.06em' }}>
            {noCredits ? 'LOCKED — NO CREDITS' : `${form.accounts_count} credit${form.accounts_count !== 1 ? 's' : ''} reserved`}
          </span>
        </div>
      </div>

      {/* No credits banner */}
      {noCredits && (
        <div style={{
          borderRadius: 12, border: '1px solid rgba(251,191,36,0.25)',
          background: 'rgba(251,191,36,0.04)', padding: '1.1rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.08em', marginBottom: 4 }}>
              NO CREDITS — PREVIEW MODE
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(224,224,224,0.5)' }}>
              You can explore all features below. To launch jobs, contact{' '}
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>@aidetectionkiller</span> on Telegram to top up via crypto.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#fbbf24', letterSpacing: '0.12em', flexShrink: 0 }}>
            <Eye size={9} style={{ display: 'inline', marginRight: 4 }} />
            PREVIEW MODE
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '10px 16px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', borderRadius: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 360px', gap: '1.25rem' }}>

          {/* ── Column 1: Job config + Profile ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Job config */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: '1px solid rgba(0,229,200,0.1)', background: 'rgba(0,229,200,0.02)' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                Job Configuration
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 7, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Number of Accounts
                  </label>
                  <input
                    type="number" min={1} max={credits ?? 100}
                    value={form.accounts_count}
                    onChange={e => setForm(f => ({ ...f, accounts_count: parseInt(e.target.value) || 1 }))}
                    className="matrix-input" required
                  />
                  <div style={{ marginTop: 5, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: insufficientCredits ? '#ef4444' : 'rgba(0,229,200,0.3)' }}>
                    {insufficientCredits ? `⚠ Need ${form.accounts_count}, have ${credits}` : `${form.accounts_count} credit${form.accounts_count !== 1 ? 's' : ''} · success-only billing`}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 7, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Geelark API Key
                  </label>
                  <input
                    type="text" value={form.geelark_api_key}
                    onChange={e => setForm(f => ({ ...f, geelark_api_key: e.target.value }))}
                    placeholder="gl_xxxxxxxxxxxxxxxx"
                    className="matrix-input" required={!noCredits}
                  />
                </div>
              </div>
            </div>

            {/* Profile */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.35)' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                Profile Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 7, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Profile Name
                  </label>
                  <input type="text" value={form.profile_name} onChange={e => setForm(f => ({ ...f, profile_name: e.target.value }))} placeholder="Emma" className="matrix-input" required={!noCredits} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 7, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Profile Bio
                  </label>
                  <textarea value={form.profile_bio} onChange={e => setForm(f => ({ ...f, profile_bio: e.target.value }))} placeholder="Looking for meaningful connections..." rows={3} className="matrix-input" style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 7, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Age Min</label>
                    <input type="number" min={18} max={80} value={form.bumble_age_min} onChange={e => setForm(f => ({ ...f, bumble_age_min: parseInt(e.target.value) }))} className="matrix-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 7, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Age Max</label>
                    <input type="number" min={18} max={80} value={form.bumble_age_max} onChange={e => setForm(f => ({ ...f, bumble_age_max: parseInt(e.target.value) }))} className="matrix-input" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 7, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Target City
                  </label>
                  <input type="text" value={form.bumble_city} onChange={e => setForm(f => ({ ...f, bumble_city: e.target.value }))} placeholder="New York" className="matrix-input" required={!noCredits} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Column 2: Photos + Submit ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Photos */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.35)' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                Profile Photos ({photos.length}/{MAX_PHOTOS})
              </div>
              {photos.length < MAX_PHOTOS && (
                <div {...getRootProps()} style={{ marginBottom: 14, cursor: 'pointer', borderRadius: 10, border: `2px dashed ${isDragActive ? '#00e5c8' : 'rgba(0,229,200,0.2)'}`, background: isDragActive ? 'rgba(0,229,200,0.06)' : 'transparent', padding: '1.75rem', textAlign: 'center', transition: 'all 0.15s' }}>
                  <input {...getInputProps()} />
                  <Upload size={20} style={{ color: 'rgba(0,229,200,0.35)', margin: '0 auto 8px' }} />
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.45)' }}>
                    {isDragActive ? 'Drop here' : 'Drag & drop or click'}
                  </div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.25)', marginTop: 4 }}>
                    JPG, PNG — up to {MAX_PHOTOS} photos
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(0,229,200,0.15)' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={10} />
                    </button>
                    {i === 0 && <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.8)', padding: '2px 5px', borderRadius: 3, fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: '#00e5c8' }}>MAIN</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                background: noCredits
                  ? 'rgba(255,255,255,0.04)'
                  : loading
                    ? 'rgba(0,229,200,0.3)'
                    : 'linear-gradient(135deg, #00b8d9, #00e5c8)',
                color: noCredits ? 'rgba(224,224,224,0.3)' : '#000',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.12em',
                padding: '15px 28px', borderRadius: 10,
                border: noCredits ? '1px solid rgba(255,255,255,0.08)' : 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: canSubmit ? '0 0 28px rgba(0,229,200,0.3)' : 'none',
                textTransform: 'uppercase', transition: 'all 0.2s',
              }}
            >
              {noCredits ? <><Lock size={13} /> No Credits — Top Up to Launch</> : loading ? 'Creating job…' : <><PlusCircle size={13} /> Launch {form.accounts_count} Account{form.accounts_count !== 1 ? 's' : ''}</>}
            </button>

            {/* Cost breakdown */}
            {!noCredits && (
              <div style={{ borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid rgba(0,229,200,0.07)', background: 'rgba(0,229,200,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Estimated cost</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 16, color: '#00e5c8' }}>{form.accounts_count} credit{form.accounts_count !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.3)' }}>
                  Charged only on AI-confirmed live accounts
                </div>
              </div>
            )}
          </div>

          {/* ── Column 3: Pipeline preview + Simulation ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 6, borderRadius: 8, border: '1px solid rgba(0,229,200,0.1)', padding: 4, background: 'rgba(0,0,0,0.4)' }}>
              {(['pipeline', 'simulation'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPreviewTab(tab)}
                  style={{
                    flex: 1, padding: '7px', borderRadius: 6, border: 'none',
                    background: previewTab === tab ? 'rgba(0,229,200,0.1)' : 'transparent',
                    color: previewTab === tab ? '#00e5c8' : 'rgba(224,224,224,0.3)',
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                    fontWeight: previewTab === tab ? 700 : 400,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {tab === 'pipeline' ? 'Pipeline' : 'Simulation'}
                </button>
              ))}
            </div>

            {previewTab === 'pipeline' ? (
              /* Automation pipeline breakdown */
              <div style={{ borderRadius: 14, border: '1px solid rgba(0,229,200,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(0,229,200,0.06)', background: 'rgba(0,229,200,0.025)' }}>
                  <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    6-Stage Automation Pipeline
                  </div>
                </div>
                <div style={{ padding: '6px 0' }}>
                  {STAGE_FEATURES.map((s, i) => (
                    <div key={s.n} style={{ padding: '12px 18px', borderBottom: i < 5 ? '1px solid rgba(0,229,200,0.04)' : 'none', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(0,229,200,0.2)', background: 'rgba(0,229,200,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 700, color: '#00e5c8' }}>{s.n}</span>
                      </div>
                      <div>
                        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, color: '#e0e0e0', marginBottom: 3, letterSpacing: '0.04em' }}>{s.label}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(224,224,224,0.4)', lineHeight: 1.5 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 18px', background: 'rgba(0,229,200,0.025)', borderTop: '1px solid rgba(0,229,200,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5c8', boxShadow: '0 0 8px #00e5c8' }} />
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.1em' }}>
                    Credits charged ONLY at Stage 6 success
                  </span>
                </div>
              </div>
            ) : (
              /* Live simulation */
              <div>
                <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Live Automation Preview
                </div>
                <SimulationPanel />
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
