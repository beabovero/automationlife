'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import SimulationPanel from '@/components/SimulationPanel'
import {
  Upload, X, PlusCircle, Zap, Lock, AlertTriangle, Eye,
  Globe, Server, CheckCircle2, Info,
} from 'lucide-react'

const MAX_PHOTOS = 6

// ─── Pipeline stages — generic, no internal details exposed ──────────────────
const PIPELINE_STAGES = [
  {
    n: 1,
    label: 'Phone Setup',
    desc: 'A dedicated cloud phone is provisioned and configured with your proxy connection.',
  },
  {
    n: 2,
    label: 'App Installation',
    desc: 'The target application is installed and launched on the cloud phone.',
  },
  {
    n: 3,
    label: 'Phone Verification',
    desc: 'A virtual number is acquired for the selected country. The verification code is intercepted and submitted automatically.',
    highlight: true,
  },
  {
    n: 4,
    label: 'Automatic Setup',
    desc: 'All permission dialogs and system screens are handled automatically without any manual intervention.',
  },
  {
    n: 5,
    label: 'Profile Creation',
    desc: 'Your display name, birthday and photos are submitted — exactly like a real user signing up.',
  },
  {
    n: 6,
    label: 'Profile Configuration',
    desc: 'Interests, preferences and profile answers are configured automatically.',
  },
  {
    n: 7,
    label: 'Account Confirmed',
    desc: 'Final verification confirms the account is active. Credit is charged only at this step.',
    highlight: true,
  },
]

// ─── Countries — Thailand hardcoded for trial, others locked ─────────────────
const COUNTRIES = [
  { code: 'TH', flag: '🇹🇭', name: 'Thailand', available: true,  note: 'Available now' },
  { code: 'US', flag: '🇺🇸', name: 'USA',       available: false, note: 'Coming soon' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany',   available: false, note: 'Coming soon' },
  { code: 'GB', flag: '🇬🇧', name: 'UK',        available: false, note: 'Coming soon' },
  { code: 'FR', flag: '🇫🇷', name: 'France',    available: false, note: 'Coming soon' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        {children}
      </span>
      {hint && (
        <span style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.2)' }}>
          — {hint}
        </span>
      )}
    </div>
  )
}

function parseProxies(raw: string): string[] {
  return raw.split('\n').map(l => l.trim()).filter(l => l.length > 0)
}

function validateProxy(line: string): boolean {
  // host:port:user:pass  OR  host:port
  const parts = line.split(':')
  return parts.length >= 2 && parts[0].length > 0 && !isNaN(parseInt(parts[1]))
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateJobPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    accounts_count: 1,
    desired_name: '',
    birthday: '',
    gender: 'female' as 'male' | 'female',
    country: 'TH',
    proxies_raw: '',
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
    if (!form.desired_name.trim()) { setError('Display name is required'); return }
    if (!form.birthday) { setError('Birthday is required'); return }

    const proxies = parseProxies(form.proxies_raw)
    if (proxies.length === 0) { setError('At least one proxy is required'); return }
    const invalidProxy = proxies.find(p => !validateProxy(p))
    if (invalidProxy) { setError(`Invalid proxy format: "${invalidProxy}" — expected host:port:user:pass`); return }
    if (proxies.length < form.accounts_count) {
      setError(`You need at least ${form.accounts_count} proxy line${form.accounts_count > 1 ? 's' : ''} (one per account). You provided ${proxies.length}.`)
      return
    }

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
        config: {
          accounts_count: form.accounts_count,
          desired_name: form.desired_name,
          birthday: form.birthday,
          gender: form.gender,
          country: form.country,
          proxies,
          photos: [],
        },
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
        await supabase.from('account_photos').insert({
          account_id: job.id, job_id: job.id, user_id: user.id,
          storage_path: path, original_filename: file.name, order_index: i,
        })
      }

      await supabase.from('jobs').update({
        config: {
          accounts_count: form.accounts_count,
          desired_name: form.desired_name,
          birthday: form.birthday,
          gender: form.gender,
          country: form.country,
          proxies,
          photos: storagePaths,
        },
      }).eq('id', job.id)

      router.push(`/jobs/${job.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
      setLoading(false)
    }
  }

  const proxies = parseProxies(form.proxies_raw)
  const proxyCount = proxies.length
  const proxyValid = proxies.every(validateProxy)
  const proxyError = proxyCount > 0 && !proxyValid
  const noCredits = credits !== null && credits === 0
  const insufficientCredits = credits !== null && credits < form.accounts_count && credits > 0
  const canSubmit = !noCredits && !insufficientCredits && !loading

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'transparent' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
            NEW JOB
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Launch Automation Job
          </h1>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
            {credits === null
              ? 'Loading…'
              : noCredits
                ? <span style={{ color: 'rgba(251,191,36,0.6)' }}>0 credits — top up to launch</span>
                : <span>Available: <span style={{ color: '#00e5c8', fontWeight: 700 }}>{credits}</span> credits · 1 credit = 1 account · charged on success only</span>
            }
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
          border: `1px solid ${noCredits ? 'rgba(251,191,36,0.2)' : 'rgba(0,229,200,0.15)'}`,
          background: noCredits ? 'rgba(251,191,36,0.04)' : 'rgba(0,229,200,0.04)',
        }}>
          {noCredits ? <Lock size={12} style={{ color: 'rgba(251,191,36,0.5)' }} /> : <Zap size={12} style={{ color: '#00e5c8' }} />}
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: noCredits ? 'rgba(251,191,36,0.5)' : 'rgba(0,229,200,0.6)', letterSpacing: '0.06em' }}>
            {noCredits ? 'LOCKED — NO CREDITS' : `${form.accounts_count} credit${form.accounts_count !== 1 ? 's' : ''} reserved`}
          </span>
        </div>
      </div>

      {/* ── No credits banner ── */}
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
              PREVIEW MODE — NO CREDITS
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(224,224,224,0.5)' }}>
              Explore the full configuration below. To launch accounts, contact{' '}
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>@aidetectionkiller</span> on Telegram to top up via crypto.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#fbbf24', letterSpacing: '0.12em', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={9} /> PREVIEW
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '10px 16px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', borderRadius: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 380px', gap: '1.25rem' }}>

          {/* ── Column 1: Config + Profile ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Job count */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: '1px solid rgba(0,229,200,0.1)', background: 'rgba(0,229,200,0.02)' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                Job Configuration
              </div>
              <FieldLabel>Number of Accounts</FieldLabel>
              <input
                type="number" min={1} max={credits ?? 100}
                value={form.accounts_count}
                onChange={e => setForm(f => ({ ...f, accounts_count: parseInt(e.target.value) || 1 }))}
                className="matrix-input"
                required
              />
              <div style={{ marginTop: 5, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: insufficientCredits ? '#ef4444' : 'rgba(0,229,200,0.3)' }}>
                {insufficientCredits
                  ? `⚠ Need ${form.accounts_count} credits, you have ${credits}`
                  : `${form.accounts_count} credit${form.accounts_count !== 1 ? 's' : ''} · charged on success only`}
              </div>
            </div>

            {/* Country */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.35)' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                Target Country
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    disabled={!c.available}
                    onClick={() => c.available && setForm(f => ({ ...f, country: c.code }))}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 8, cursor: c.available ? 'pointer' : 'not-allowed',
                      border: form.country === c.code
                        ? '1px solid rgba(0,229,200,0.5)'
                        : c.available
                          ? '1px solid rgba(255,255,255,0.08)'
                          : '1px solid rgba(255,255,255,0.04)',
                      background: form.country === c.code
                        ? 'rgba(0,229,200,0.08)'
                        : 'rgba(0,0,0,0.3)',
                      opacity: c.available ? 1 : 0.45,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: form.country === c.code ? '#00e5c8' : c.available ? 'rgba(224,224,224,0.7)' : 'rgba(224,224,224,0.3)', fontWeight: form.country === c.code ? 700 : 400 }}>
                        {c.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {form.country === c.code && <CheckCircle2 size={13} style={{ color: '#00e5c8' }} />}
                      {!c.available && (
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: 'rgba(224,224,224,0.25)', letterSpacing: '0.08em' }}>
                          SOON
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Thailand trial note */}
              <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderRadius: 7, border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.03)' }}>
                <Info size={12} style={{ color: 'rgba(251,191,36,0.5)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(251,191,36,0.5)', lineHeight: 1.6 }}>
                  Trial: Thailand only. After creation, manually change location to your desired country (e.g. USA) via app settings.
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
                  <FieldLabel>Display Name</FieldLabel>
                  <input
                    type="text" value={form.desired_name}
                    onChange={e => setForm(f => ({ ...f, desired_name: e.target.value }))}
                    placeholder="Emma"
                    className="matrix-input" required={!noCredits}
                  />
                </div>

                <div>
                  <FieldLabel>Birthday</FieldLabel>
                  <input
                    type="date" value={form.birthday}
                    onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                    className="matrix-input" style={{ colorScheme: 'dark' }}
                    required={!noCredits}
                  />
                </div>

                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['female', 'male'] as const).map(g => (
                      <button
                        key={g} type="button"
                        onClick={() => setForm(f => ({ ...f, gender: g }))}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          border: form.gender === g ? '1px solid rgba(0,229,200,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          background: form.gender === g ? 'rgba(0,229,200,0.1)' : 'rgba(0,0,0,0.4)',
                          color: form.gender === g ? '#00e5c8' : 'rgba(224,224,224,0.3)',
                          boxShadow: form.gender === g ? '0 0 14px rgba(0,229,200,0.2)' : 'none',
                          transition: 'all 0.15s',
                        }}
                      >
                        {g === 'female' ? '♀ Female' : '♂ Male'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── Column 2: Proxies + Photos + Submit ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Proxies */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: `1px solid ${proxyError ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`, background: 'rgba(0,0,0,0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Server size={12} style={{ color: 'rgba(0,229,200,0.4)' }} />
                  Proxies
                </div>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: proxyError ? '#ef4444' : proxyCount > 0 ? '#00e5c8' : 'rgba(224,224,224,0.25)' }}>
                  {proxyCount > 0 ? `${proxyCount} line${proxyCount > 1 ? 's' : ''}${proxyError ? ' · invalid format' : ' · valid'}` : 'none'}
                </span>
              </div>

              <textarea
                value={form.proxies_raw}
                onChange={e => setForm(f => ({ ...f, proxies_raw: e.target.value }))}
                placeholder={'host:port:user:pass\nhost:port:user:pass\n…'}
                rows={6}
                className="matrix-input"
                style={{ resize: 'vertical', fontFamily: '"JetBrains Mono", monospace', fontSize: 10 }}
                required={!noCredits}
              />

              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.3)', letterSpacing: '0.04em' }}>
                  Format: <span style={{ color: 'rgba(0,229,200,0.5)' }}>host:port:username:password</span> — one per line
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.2)' }}>
                  One proxy per account · must match selected country (Thailand)
                </div>
                {proxyCount > 0 && form.accounts_count > proxyCount && (
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#ef4444' }}>
                    ⚠ {form.accounts_count - proxyCount} more proxy line{form.accounts_count - proxyCount > 1 ? 's' : ''} needed
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.35)', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  Profile Photos
                </div>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: photos.length > 0 ? '#00e5c8' : 'rgba(224,224,224,0.25)' }}>
                  {photos.length}/{MAX_PHOTOS}
                </span>
              </div>

              {photos.length < MAX_PHOTOS && (
                <div
                  {...getRootProps()}
                  style={{
                    marginBottom: 14, cursor: 'pointer', borderRadius: 10,
                    border: `2px dashed ${isDragActive ? '#00e5c8' : 'rgba(0,229,200,0.2)'}`,
                    background: isDragActive ? 'rgba(0,229,200,0.06)' : 'transparent',
                    padding: '1.5rem', textAlign: 'center', transition: 'all 0.15s',
                  }}
                >
                  <input {...getInputProps()} />
                  <Upload size={18} style={{ color: 'rgba(0,229,200,0.35)', margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.45)' }}>
                    {isDragActive ? 'Drop here' : 'Drag & drop or click'}
                  </div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.25)', marginTop: 4 }}>
                    JPG, PNG · up to {MAX_PHOTOS} photos
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(0,229,200,0.15)' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button" onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.85)', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={10} />
                    </button>
                    {i === 0 && (
                      <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.85)', padding: '2px 5px', borderRadius: 3, fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: '#00e5c8' }}>
                        MAIN
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
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
              {noCredits
                ? <><Lock size={13} /> No Credits — Top Up to Launch</>
                : loading
                  ? 'Queuing job…'
                  : <><PlusCircle size={13} /> Launch {form.accounts_count} Account{form.accounts_count !== 1 ? 's' : ''}</>
              }
            </button>

            {/* Cost breakdown */}
            {!noCredits && (
              <div style={{ borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid rgba(0,229,200,0.07)', background: 'rgba(0,229,200,0.02)' }}>
                {[
                  { label: 'Accounts', value: `${form.accounts_count}×` },
                  { label: 'Price per account', value: '1 credit' },
                  { label: 'Proxies ready', value: proxyCount >= form.accounts_count ? `${proxyCount} ✓` : `${proxyCount}/${form.accounts_count}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.6)', fontWeight: 700 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'rgba(0,229,200,0.07)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 18, color: '#00e5c8' }}>{form.accounts_count} cr</span>
                </div>
                <div style={{ marginTop: 6, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.3)' }}>
                  Charged only when account is confirmed active
                </div>
              </div>
            )}

          </div>

          {/* ── Column 3: Pipeline / Simulation ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 6, borderRadius: 8, border: '1px solid rgba(0,229,200,0.1)', padding: 4, background: 'rgba(0,0,0,0.4)' }}>
              {(['pipeline', 'simulation'] as const).map(tab => (
                <button
                  key={tab} type="button"
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
                  {tab === 'pipeline' ? 'How It Works' : 'Preview'}
                </button>
              ))}
            </div>

            {previewTab === 'pipeline' ? (

              <div style={{ borderRadius: 14, border: '1px solid rgba(0,229,200,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,229,200,0.06)', background: 'rgba(0,229,200,0.025)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Automation Process
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Globe size={10} style={{ color: 'rgba(0,229,200,0.3)' }} />
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.3)' }}>
                      {COUNTRIES.find(c => c.code === form.country)?.flag} {COUNTRIES.find(c => c.code === form.country)?.name}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  {PIPELINE_STAGES.map((s, i) => (
                    <div
                      key={s.n}
                      style={{
                        padding: '11px 16px',
                        borderBottom: i < PIPELINE_STAGES.length - 1 ? '1px solid rgba(0,229,200,0.04)' : 'none',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        background: s.highlight ? 'rgba(0,229,200,0.015)' : 'transparent',
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        border: `1px solid ${s.highlight ? 'rgba(0,229,200,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        background: s.highlight ? 'rgba(0,229,200,0.07)' : 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: s.highlight ? '0 0 8px rgba(0,229,200,0.12)' : 'none',
                      }}>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 700, color: s.highlight ? '#00e5c8' : 'rgba(224,224,224,0.3)' }}>{s.n}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, color: s.highlight ? '#e0e0e0' : 'rgba(224,224,224,0.7)', marginBottom: 3 }}>
                          {s.label}
                        </div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(224,224,224,0.4)', lineHeight: 1.5 }}>
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '10px 16px', background: 'rgba(0,229,200,0.025)', borderTop: '1px solid rgba(0,229,200,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5c8', boxShadow: '0 0 8px #00e5c8' }} />
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.45)', letterSpacing: '0.08em' }}>
                    Credit charged at step 7 only — account must be confirmed active
                  </span>
                </div>
              </div>

            ) : (

              <div>
                <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Live Preview
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
