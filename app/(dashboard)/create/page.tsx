'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import SimulationPanel from '@/components/SimulationPanel'
import { Upload, X, PlusCircle, Zap } from 'lucide-react'

const MAX_PHOTOS = 6

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
  const [noCredits, setNoCredits] = useState(false)

  useState(() => {
    supabase.from('user_settings').select('credits').single().then(({ data }) => {
      setCredits(data?.credits ?? 0)
      if ((data?.credits ?? 0) === 0) setNoCredits(true)
    })
  })

  const onDrop = useCallback((accepted: File[]) => {
    const remaining = MAX_PHOTOS - photos.length
    const toAdd = accepted.slice(0, remaining)
    setPhotos(prev => [...prev, ...toAdd])
    setPhotoPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
  }, [photos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: MAX_PHOTOS,
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
        config: { ...form, geelark_api_key: form.geelark_api_key, photos: [] },
        started_at: null,
        completed_at: null,
        worker_id: null,
        error_message: null,
      }).select().single()
      if (jobErr) throw jobErr

      const storagePaths: string[] = []
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const path = `${user.id}/${job.id}/${i}_${file.name}`
        const { error: upErr } = await supabase.storage.from('account-photos').upload(path, file)
        if (upErr) throw upErr
        storagePaths.push(path)
        await supabase.from('account_photos').insert({
          account_id: job.id,
          job_id: job.id,
          user_id: user.id,
          storage_path: path,
          original_filename: file.name,
          order_index: i,
        })
      }

      await supabase.from('jobs').update({
        config: { ...form, geelark_api_key: form.geelark_api_key, photos: storagePaths }
      }).eq('id', job.id)

      router.push(`/jobs/${job.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
      setLoading(false)
    }
  }

  if (noCredits) {
    return (
      <div style={{ padding: '2.5rem', minHeight: '100vh', background: '#000' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
            NEW JOB
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Create Automation Job
          </h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{
            borderRadius: 14, padding: '3rem 2rem',
            border: '1px solid rgba(251,191,36,0.2)',
            background: 'rgba(251,191,36,0.02)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 12, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.08em', marginBottom: 10 }}>
              NO CREDITS AVAILABLE
            </div>
            <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'rgba(224,224,224,0.55)', marginBottom: 6, lineHeight: 1.6 }}>
              Contact{' '}
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>@aidetectionkiller</span>
              {' '}on Telegram to top up via crypto.
            </div>
            <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.5)', marginTop: 4 }}>
              1 credit = $1 = 1 account
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
              Demo Preview
            </div>
            <SimulationPanel />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
            NEW JOB
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Create Automation Job
          </h1>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
            Available credits:{' '}
            <span style={{ color: '#00e5c8', fontWeight: 700 }}>{credits ?? '…'}</span>
            {' '}· charged on success only
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(0,229,200,0.15)', background: 'rgba(0,229,200,0.04)' }}>
          <Zap size={12} style={{ color: '#00e5c8' }} />
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.6)', letterSpacing: '0.06em' }}>
            {form.accounts_count} credit{form.accounts_count !== 1 ? 's' : ''} reserved
          </span>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: '1.5rem', padding: '12px 16px',
          border: '1px solid rgba(239,68,68,0.3)',
          background: 'rgba(239,68,68,0.06)',
          borderRadius: 10,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Job config */}
            <div style={{ borderRadius: 14, padding: '1.75rem', border: '1px solid rgba(0,229,200,0.1)', background: 'rgba(0,229,200,0.02)' }}>
              <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Job Configuration
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Number of Accounts
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={credits ?? 100}
                    value={form.accounts_count}
                    onChange={e => setForm(f => ({ ...f, accounts_count: parseInt(e.target.value) || 1 }))}
                    className="matrix-input"
                    required
                  />
                  <div style={{ marginTop: 6, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.3)' }}>
                    Cost: {form.accounts_count} credit{form.accounts_count !== 1 ? 's' : ''} · charged on success only
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Geelark API Key
                  </label>
                  <input
                    type="text"
                    value={form.geelark_api_key}
                    onChange={e => setForm(f => ({ ...f, geelark_api_key: e.target.value }))}
                    placeholder="gl_xxxxxxxxxxxxxxxx"
                    className="matrix-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Profile details */}
            <div style={{ borderRadius: 14, padding: '1.75rem', border: '1px solid rgba(255,255,255,0.05)', background: '#000' }}>
              <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Profile Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={form.profile_name}
                    onChange={e => setForm(f => ({ ...f, profile_name: e.target.value }))}
                    placeholder="Emma"
                    className="matrix-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Profile Bio
                  </label>
                  <textarea
                    value={form.profile_bio}
                    onChange={e => setForm(f => ({ ...f, profile_bio: e.target.value }))}
                    placeholder="Looking for meaningful connections..."
                    rows={3}
                    className="matrix-input"
                    style={{ resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                      Age Min
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={80}
                      value={form.bumble_age_min}
                      onChange={e => setForm(f => ({ ...f, bumble_age_min: parseInt(e.target.value) }))}
                      className="matrix-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                      Age Max
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={80}
                      value={form.bumble_age_max}
                      onChange={e => setForm(f => ({ ...f, bumble_age_max: parseInt(e.target.value) }))}
                      className="matrix-input"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Target City
                  </label>
                  <input
                    type="text"
                    value={form.bumble_city}
                    onChange={e => setForm(f => ({ ...f, bumble_city: e.target.value }))}
                    placeholder="New York"
                    className="matrix-input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Photos + Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderRadius: 14, padding: '1.75rem', border: '1px solid rgba(255,255,255,0.05)', background: '#000' }}>
              <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Profile Photos ({photos.length}/{MAX_PHOTOS})
              </div>

              {photos.length < MAX_PHOTOS && (
                <div
                  {...getRootProps()}
                  style={{
                    marginBottom: 16,
                    cursor: 'pointer',
                    borderRadius: 10,
                    border: `2px dashed ${isDragActive ? '#00e5c8' : 'rgba(0,229,200,0.2)'}`,
                    background: isDragActive ? 'rgba(0,229,200,0.06)' : 'transparent',
                    padding: '2rem',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <input {...getInputProps()} />
                  <Upload size={22} style={{ color: 'rgba(0,229,200,0.4)', margin: '0 auto 10px' }} />
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(0,229,200,0.5)' }}>
                    {isDragActive ? 'Drop photos here' : 'Drag & drop or click to upload'}
                  </div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.3)', marginTop: 6 }}>
                    JPG, PNG — max {MAX_PHOTOS} photos
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(0,229,200,0.15)' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 22, height: 22,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.75)',
                        border: 'none', cursor: 'pointer',
                        color: '#ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={11} />
                    </button>
                    {i === 0 && (
                      <div style={{
                        position: 'absolute', bottom: 4, left: 4,
                        background: 'rgba(0,0,0,0.75)',
                        padding: '2px 6px', borderRadius: 4,
                        fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#00e5c8',
                      }}>
                        MAIN
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(0,229,200,0.3)' : 'linear-gradient(135deg, #00b8d9, #00e5c8)',
                color: '#000',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.12em',
                padding: '16px 28px',
                borderRadius: 10,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: loading ? 'none' : '0 0 30px rgba(0,229,200,0.35)',
                textTransform: 'uppercase',
              }}
            >
              <PlusCircle size={14} />
              {loading ? 'Creating job…' : `Launch ${form.accounts_count} Account${form.accounts_count !== 1 ? 's' : ''}`}
            </button>

            {/* Cost breakdown */}
            <div style={{ borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid rgba(0,229,200,0.07)', background: 'rgba(0,229,200,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.35)' }}>Estimated cost</span>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700, color: '#00e5c8' }}>
                  {form.accounts_count} credit{form.accounts_count !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ marginTop: 4, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.3)', letterSpacing: '0.05em' }}>
                Only charged for successfully created accounts
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
