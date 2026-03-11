'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import SimulationPanel from '@/components/SimulationPanel'
import {
  Upload, X, PlusCircle, Zap, Lock, AlertTriangle, Eye,
  PhoneCall, Cpu, MessageSquare, ShieldCheck, User, Settings, CheckCircle2,
} from 'lucide-react'

const MAX_PHOTOS = 6

// ─── Real 7-stage pipeline from _dashboard_workflow.json ──────────────────────
const AUTOMATION_STAGES = [
  {
    n: 1,
    short: 'BOOT',
    label: 'Cloud Phone Boot',
    icon: <Cpu size={13} />,
    color: '#00d4ff',
    desc: 'Dedicated Geelark Android cloud phone provisioned — Bumble APK installed & ready',
    detail: 'Stage 1 — classic mode · ~25s',
  },
  {
    n: 2,
    short: 'LAUNCH',
    label: 'App Launch',
    icon: <PhoneCall size={13} />,
    color: '#00d4ff',
    desc: 'Bumble opens on the cloud phone — initial loading screens cleared automatically',
    detail: 'Stage 2–3 — classic mode · ~10s',
  },
  {
    n: 3,
    short: 'OTP',
    label: 'SMS Verification',
    icon: <MessageSquare size={13} />,
    color: '#00e5c8',
    desc: 'German virtual number purchased via PVAPins · bumble10 product · number entered, OTP intercepted & auto-typed (180s window)',
    detail: 'Stage 4 — classic mode · PVAPins · Germany',
    highlight: true,
  },
  {
    n: 4,
    short: 'AI PERMS',
    label: 'AI Permission Handler',
    icon: <ShieldCheck size={13} />,
    color: '#a855f7',
    desc: 'Claude Sonnet vision AI handles ALL system popups — location, notifications, privacy consent, passkey — in any order they appear',
    detail: 'Stage 5 — AI vision loop · claude-sonnet-4',
    highlight: true,
  },
  {
    n: 5,
    short: 'PROFILE',
    label: 'Profile Build',
    icon: <User size={13} />,
    color: '#00e5c8',
    desc: 'Your name & birthday entered · your photos uploaded one by one — indistinguishable from a real user signing up',
    detail: 'Stage 6 (checkpoints 6.1–6.3) — classic',
  },
  {
    n: 6,
    short: 'PREFS',
    label: 'Preferences & Bio',
    icon: <Settings size={13} />,
    color: '#00e5c8',
    desc: 'Gender, who-to-meet, height, interests, habits — set by automation · profile bio answer generated live by Claude Haiku AI',
    detail: 'Stage 6 (checkpoints 6.4–6.12) — hybrid',
  },
  {
    n: 7,
    short: 'LIVE',
    label: 'Account Confirmed',
    icon: <CheckCircle2 size={13} />,
    color: '#00e5c8',
    desc: '"It\'s cool to be kind" terms detected & accepted · tutorial completed · AI vision confirms account is LIVE — credit charged only here',
    detail: 'Stage 7 — hybrid · charged on success only',
    highlight: true,
  },
]

// ─── Label style helper ────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: 7, fontSize: 9,
      fontFamily: '"JetBrains Mono", monospace',
      color: 'rgba(0,229,200,0.45)',
      letterSpacing: '0.16em', textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
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
    if (!form.desired_name.trim()) { setError('Profile display name is required'); return }
    if (!form.birthday) { setError('Birthday is required'); return }

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
          photos: [],
          // SMS handled by operator: Germany / PVAPins / bumble10
          // Bio auto-generated by Claude Haiku at checkpoint 6.10
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
          photos: storagePaths,
        },
      }).eq('id', job.id)

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

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
            NEW BUMBLE JOB
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Launch Automation Job
          </h1>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
            {credits === null
              ? 'Loading…'
              : noCredits
                ? <span style={{ color: 'rgba(251,191,36,0.6)' }}>0 credits — top up to launch</span>
                : <span>Available: <span style={{ color: '#00e5c8', fontWeight: 700 }}>{credits}</span> credits · 1 credit = 1 Bumble account · charged on success only</span>
            }
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
          border: `1px solid ${noCredits ? 'rgba(251,191,36,0.2)' : 'rgba(0,229,200,0.15)'}`,
          background: noCredits ? 'rgba(251,191,36,0.04)' : 'rgba(0,229,200,0.04)',
        }}>
          {noCredits
            ? <Lock size={12} style={{ color: 'rgba(251,191,36,0.5)' }} />
            : <Zap size={12} style={{ color: '#00e5c8' }} />
          }
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: noCredits ? 'rgba(251,191,36,0.5)' : 'rgba(0,229,200,0.6)', letterSpacing: '0.06em' }}>
            {noCredits ? 'LOCKED — NO CREDITS' : `${form.accounts_count} credit${form.accounts_count !== 1 ? 's' : ''} reserved`}
          </span>
        </div>
      </div>

      {/* ── No credits preview banner ── */}
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
              Explore the full automation configuration below. To launch, contact{' '}
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>@aidetectionkiller</span> on Telegram to top up via crypto.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#fbbf24', letterSpacing: '0.12em', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={9} />
            PREVIEW MODE
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

          {/* ── Column 1: Job config + Profile ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Job count */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: '1px solid rgba(0,229,200,0.1)', background: 'rgba(0,229,200,0.02)' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                Job Configuration
              </div>
              <FieldLabel>Number of Bumble Accounts</FieldLabel>
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
                  : `${form.accounts_count} credit${form.accounts_count !== 1 ? 's' : ''} · billed only on AI-confirmed live accounts`}
              </div>
            </div>

            {/* Profile fields */}
            <div style={{ borderRadius: 14, padding: '1.6rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.35)', flex: 1 }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                Profile Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Display name */}
                <div>
                  <FieldLabel>Display Name</FieldLabel>
                  <input
                    type="text"
                    value={form.desired_name}
                    onChange={e => setForm(f => ({ ...f, desired_name: e.target.value }))}
                    placeholder="Emma"
                    className="matrix-input"
                    required={!noCredits}
                  />
                  <div style={{ marginTop: 4, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.25)' }}>
                    Entered at stage 6 · maps to <span style={{ color: 'rgba(0,229,200,0.5)' }}>{'{{profile.desiredName}}'}</span>
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <FieldLabel>Birthday</FieldLabel>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                    className="matrix-input"
                    style={{ colorScheme: 'dark' }}
                    required={!noCredits}
                  />
                  <div style={{ marginTop: 4, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.25)' }}>
                    Day / month / year typed separately · maps to <span style={{ color: 'rgba(0,229,200,0.5)' }}>{'{{profile.birthday}}'}</span>
                  </div>
                </div>

                {/* Gender toggle */}
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['female', 'male'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
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
                  <div style={{ marginTop: 4, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.25)' }}>
                    Controls GenderTap + WhoToMeetTap steps at checkpoint 6.4–6.5
                  </div>
                </div>

              </div>
            </div>

            {/* SMS auto-config badge */}
            <div style={{ borderRadius: 10, padding: '0.9rem 1.2rem', border: '1px solid rgba(0,212,255,0.1)', background: 'rgba(0,212,255,0.03)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <MessageSquare size={14} style={{ color: 'rgba(0,212,255,0.5)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,212,255,0.6)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 3 }}>
                  SMS — AUTO-CONFIGURED BY OPERATOR
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.4)', lineHeight: 1.6 }}>
                  🇩🇪 Germany · PVAPins · product: bumble10<br />
                  OTP window: 180s · auto-fill on receive
                </div>
              </div>
            </div>

          </div>

          {/* ── Column 2: Photos + Submit ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Photos upload */}
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
                    padding: '1.75rem', textAlign: 'center', transition: 'all 0.15s',
                  }}
                >
                  <input {...getInputProps()} />
                  <Upload size={20} style={{ color: 'rgba(0,229,200,0.35)', margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.45)' }}>
                    {isDragActive ? 'Drop here' : 'Drag & drop or click to browse'}
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
                      type="button"
                      onClick={() => removePhoto(i)}
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

              {photos.length > 0 && (
                <div style={{ marginTop: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.3)' }}>
                  Photos uploaded to Geelark phone at checkpoint 6.3 + 6.11
                </div>
              )}
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
                  { label: 'Accounts', value: `${form.accounts_count}x` },
                  { label: 'Price per account', value: '1 credit' },
                  { label: 'Reserved', value: `${form.accounts_count} credit${form.accounts_count !== 1 ? 's' : ''}` },
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
                  Charged ONLY at Stage 7 · AI confirms account is live
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
                  {tab === 'pipeline' ? '7-Stage Pipeline' : 'Simulation'}
                </button>
              ))}
            </div>

            {previewTab === 'pipeline' ? (

              /* Automation pipeline */
              <div style={{ borderRadius: 14, border: '1px solid rgba(0,229,200,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,229,200,0.06)', background: 'rgba(0,229,200,0.025)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Bumble Automation Pipeline
                  </div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.3)' }}>7 stages</div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  {AUTOMATION_STAGES.map((s, i) => (
                    <div
                      key={s.n}
                      style={{
                        padding: '11px 16px',
                        borderBottom: i < AUTOMATION_STAGES.length - 1 ? '1px solid rgba(0,229,200,0.04)' : 'none',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        background: s.highlight ? 'rgba(0,229,200,0.015)' : 'transparent',
                      }}
                    >
                      {/* Stage number circle */}
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        border: `1px solid ${s.highlight ? 'rgba(0,229,200,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        background: s.highlight ? 'rgba(0,229,200,0.08)' : 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: s.color,
                        boxShadow: s.highlight ? '0 0 10px rgba(0,229,200,0.15)' : 'none',
                      }}>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 700, color: s.color }}>{s.n}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ color: s.color, flexShrink: 0 }}>{s.icon}</span>
                          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, color: '#e0e0e0', letterSpacing: '0.04em' }}>
                            {s.label}
                          </span>
                        </div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(224,224,224,0.4)', lineHeight: 1.5 }}>
                          {s.desc}
                        </div>
                        <div style={{ marginTop: 3, fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: 'rgba(0,229,200,0.25)', letterSpacing: '0.06em' }}>
                          {s.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '10px 16px', background: 'rgba(0,229,200,0.025)', borderTop: '1px solid rgba(0,229,200,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5c8', boxShadow: '0 0 8px #00e5c8' }} />
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.45)', letterSpacing: '0.08em' }}>
                    Credit charged only at Stage 7 — AI confirms account LIVE
                  </span>
                </div>
              </div>

            ) : (

              /* Simulation */
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
