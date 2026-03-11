'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, X, PlusCircle, Zap, Lock, AlertTriangle, ChevronDown, ChevronRight,
  Copy, CheckCircle2, Info, RefreshCw,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 4
const TRIAL_MAX = 10
const CREDITS_PER_ACCOUNT = 2

// Only Thailand available for trial
const AVAILABLE_COUNTRIES = [
  { code: 'TH', flag: '🇹🇭', name: 'Thailand', note: 'Trial — change location post-creation' },
]
const LOCKED_COUNTRIES = [
  { code: 'US', flag: '🇺🇸', name: 'USA' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'GB', flag: '🇬🇧', name: 'UK' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountDraft = {
  id: string
  profile_name: string    // Geelark dashboard label (order ID, @handle, etc.)
  profile_note: string    // Optional remarks
  desired_name: string    // Bumble display name
  birthday: string        // YYYY-MM-DD
  gender: 'male' | 'female'
  proxy: string           // host:port:user:pass
  photos: File[]
  photoPreviews: string[]
  expanded: boolean
}

function makeAccount(n: number): AccountDraft {
  return {
    id: `${Date.now()}-${n}`,
    profile_name: '',
    profile_note: '',
    desired_name: '',
    birthday: '',
    gender: 'female',
    proxy: '',
    photos: [],
    photoPreviews: [],
    expanded: false,
  }
}

function isReady(a: AccountDraft): boolean {
  return (
    a.profile_name.trim().length > 0 &&
    a.desired_name.trim().length > 0 &&
    a.birthday.length > 0 &&
    a.proxy.trim().length > 0 &&
    isValidProxy(a.proxy.trim()) &&
    a.photos.length > 0
  )
}

function isValidProxy(p: string): boolean {
  const parts = p.split(':')
  return parts.length >= 2 && parts[0].length > 0 && !isNaN(parseInt(parts[1]))
}

// ─── Row photo uploader component ────────────────────────────────────────────

function PhotoUploader({ account, onChange }: {
  account: AccountDraft
  onChange: (updates: Partial<AccountDraft>) => void
}) {
  const onDrop = useCallback((accepted: File[]) => {
    const remaining = MAX_PHOTOS - account.photos.length
    const toAdd = accepted.slice(0, remaining)
    const newPhotos = [...account.photos, ...toAdd]
    const newPreviews = [...account.photoPreviews, ...toAdd.map(f => URL.createObjectURL(f))]
    onChange({ photos: newPhotos, photoPreviews: newPreviews })
  }, [account.photos, account.photoPreviews])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] },
    maxFiles: MAX_PHOTOS, disabled: account.photos.length >= MAX_PHOTOS,
  })

  const remove = (i: number) => {
    URL.revokeObjectURL(account.photoPreviews[i])
    onChange({
      photos: account.photos.filter((_, idx) => idx !== i),
      photoPreviews: account.photoPreviews.filter((_, idx) => idx !== i),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      {/* Slots row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Filled photo slots */}
        {account.photoPreviews.map((src, i) => (
          <div key={i} style={{ position: 'relative', width: 90, height: 90, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,229,200,0.3)', flexShrink: 0, boxShadow: '0 0 12px rgba(0,229,200,0.1)' }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button" onClick={() => remove(i)}
              style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(239,68,68,0.4)', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={10} />
            </button>
            {i === 0 && (
              <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.85)', padding: '2px 6px', borderRadius: 3, fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: '#00e5c8', letterSpacing: '0.06em' }}>
                MAIN
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.75)', padding: '1px 5px', borderRadius: 3, fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: 'rgba(224,224,224,0.6)' }}>
              {i + 1}
            </div>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: MAX_PHOTOS - account.photos.length }).map((_, i) => {
          const slotIndex = account.photos.length + i
          const isDropZone = i === 0 && account.photos.length < MAX_PHOTOS
          return isDropZone ? (
            <div
              key={`empty-${i}`}
              {...getRootProps()}
              style={{
                width: 90, height: 90, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
                border: `2px dashed ${isDragActive ? '#00e5c8' : 'rgba(0,229,200,0.3)'}`,
                background: isDragActive ? 'rgba(0,229,200,0.08)' : 'rgba(0,229,200,0.02)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.15s',
                boxShadow: isDragActive ? '0 0 16px rgba(0,229,200,0.2)' : 'none',
              }}
            >
              <input {...getInputProps()} />
              <Upload size={20} style={{ color: isDragActive ? '#00e5c8' : 'rgba(0,229,200,0.45)' }} />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: isDragActive ? '#00e5c8' : 'rgba(0,229,200,0.4)', letterSpacing: '0.1em' }}>
                {isDragActive ? 'DROP' : 'ADD'}
              </span>
            </div>
          ) : (
            <div
              key={`empty-${i}`}
              style={{ width: 90, height: 90, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.1)' }}>{slotIndex + 1}</span>
            </div>
          )
        })}
      </div>

      {/* Status line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
            <div key={i} style={{ width: 18, height: 3, borderRadius: 2, background: i < account.photos.length ? '#00e5c8' : 'rgba(255,255,255,0.07)' }} />
          ))}
        </div>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: account.photos.length > 0 ? 'rgba(0,229,200,0.5)' : 'rgba(239,68,68,0.5)' }}>
          {account.photos.length === 0
            ? '⚠ At least 1 photo required'
            : `${account.photos.length}/${MAX_PHOTOS} photos · ${MAX_PHOTOS - account.photos.length > 0 ? `${MAX_PHOTOS - account.photos.length} slot${MAX_PHOTOS - account.photos.length > 1 ? 's' : ''} remaining` : 'all slots filled'}`
          }
        </span>
      </div>
    </div>
  )
}

// ─── Account row ─────────────────────────────────────────────────────────────

const CELL: React.CSSProperties = {
  padding: '0 6px',
  fontFamily: '"JetBrains Mono", monospace',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(0,229,200,0.1)',
  borderRadius: 5,
  color: '#e0e0e0',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 11,
  padding: '6px 8px',
  outline: 'none',
}

function AccountRow({
  account, index, onChange, onCopyDown, isLast,
}: {
  account: AccountDraft
  index: number
  onChange: (updates: Partial<AccountDraft>) => void
  onCopyDown: (field: keyof AccountDraft, value: unknown) => void
  isLast: boolean
}) {
  const ready = isReady(account)
  const proxyOk = account.proxy.trim().length > 0 && isValidProxy(account.proxy.trim())
  const proxyBad = account.proxy.trim().length > 0 && !isValidProxy(account.proxy.trim())

  return (
    <>
      {/* Main data row */}
      <tr style={{
        borderBottom: account.expanded ? 'none' : '1px solid rgba(0,229,200,0.05)',
        background: account.expanded ? 'rgba(0,229,200,0.02)' : 'transparent',
      }}>
        {/* # */}
        <td style={{ ...CELL, width: 40, textAlign: 'center', padding: '8px 4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ready ? '#00e5c8' : 'rgba(224,224,224,0.3)', fontWeight: 700 }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            {ready && <CheckCircle2 size={10} style={{ color: '#00e5c8' }} />}
          </div>
        </td>

        {/* Geelark Name */}
        <td style={{ ...CELL, width: 160 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={account.profile_name}
              onChange={e => onChange({ profile_name: e.target.value })}
              placeholder="@handle or Order#123"
              style={{ ...INPUT_STYLE, borderColor: account.profile_name ? 'rgba(0,229,200,0.2)' : 'rgba(239,68,68,0.2)' }}
            />
            {account.profile_name && !isLast && (
              <button
                type="button"
                title="Copy value to all accounts below"
                onClick={() => onCopyDown('profile_name', account.profile_name)}
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,229,200,0.3)', padding: 0 }}
              >
                <Copy size={9} />
              </button>
            )}
          </div>
        </td>

        {/* Note (optional) */}
        <td style={{ ...CELL, width: 120 }}>
          <input
            type="text"
            value={account.profile_note}
            onChange={e => onChange({ profile_note: e.target.value })}
            placeholder="optional"
            style={{ ...INPUT_STYLE, borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </td>

        {/* Bumble Name */}
        <td style={{ ...CELL, width: 130 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={account.desired_name}
              onChange={e => onChange({ desired_name: e.target.value })}
              placeholder="Emma"
              style={{ ...INPUT_STYLE, borderColor: account.desired_name ? 'rgba(0,229,200,0.2)' : 'rgba(239,68,68,0.2)' }}
            />
            {account.desired_name && !isLast && (
              <button
                type="button"
                title="Copy to all below"
                onClick={() => onCopyDown('desired_name', account.desired_name)}
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,229,200,0.3)', padding: 0 }}
              >
                <Copy size={9} />
              </button>
            )}
          </div>
        </td>

        {/* Birthday */}
        <td style={{ ...CELL, width: 130 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={account.birthday}
              onChange={e => onChange({ birthday: e.target.value })}
              style={{ ...INPUT_STYLE, colorScheme: 'dark', borderColor: account.birthday ? 'rgba(0,229,200,0.2)' : 'rgba(239,68,68,0.2)' }}
            />
            {account.birthday && !isLast && (
              <button
                type="button"
                title="Copy to all below"
                onClick={() => onCopyDown('birthday', account.birthday)}
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,229,200,0.3)', padding: 0 }}
              >
                <Copy size={9} />
              </button>
            )}
          </div>
        </td>

        {/* Gender */}
        <td style={{ ...CELL, width: 72 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['F', 'M'] as const).map(g => (
              <button
                key={g} type="button"
                onClick={() => onChange({ gender: g === 'F' ? 'female' : 'male' })}
                style={{
                  flex: 1, padding: '5px 0', borderRadius: 4,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  border: (g === 'F' ? 'female' : 'male') === account.gender ? '1px solid rgba(0,229,200,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  background: (g === 'F' ? 'female' : 'male') === account.gender ? 'rgba(0,229,200,0.1)' : 'transparent',
                  color: (g === 'F' ? 'female' : 'male') === account.gender ? '#00e5c8' : 'rgba(224,224,224,0.3)',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </td>

        {/* Proxy */}
        <td style={{ ...CELL, width: 200 }}>
          <input
            type="text"
            value={account.proxy}
            onChange={e => onChange({ proxy: e.target.value })}
            placeholder="host:port:user:pass"
            style={{
              ...INPUT_STYLE,
              fontSize: 10,
              borderColor: proxyBad ? 'rgba(239,68,68,0.4)' : proxyOk ? 'rgba(0,229,200,0.25)' : 'rgba(239,68,68,0.2)',
              color: proxyBad ? '#ef4444' : '#e0e0e0',
            }}
          />
        </td>

        {/* Photos */}
        <td style={{ ...CELL, width: 110, padding: '8px 8px' }}>
          <button
            type="button"
            onClick={() => onChange({ expanded: !account.expanded })}
            style={{
              width: '100%',
              background: account.photos.length === MAX_PHOTOS
                ? 'rgba(0,229,200,0.1)'
                : account.photos.length > 0
                  ? 'rgba(0,229,200,0.05)'
                  : 'rgba(239,68,68,0.07)',
              border: account.photos.length > 0
                ? `1px solid ${account.photos.length === MAX_PHOTOS ? 'rgba(0,229,200,0.4)' : 'rgba(0,229,200,0.2)'}`
                : '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: i < account.photos.length ? '#00e5c8' : 'rgba(255,255,255,0.08)', border: i < account.photos.length ? 'none' : '1px dashed rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
                    {i < account.photoPreviews.length && (
                      <img src={account.photoPreviews[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                ))}
              </div>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: account.photos.length > 0 ? 'rgba(0,229,200,0.6)' : 'rgba(239,68,68,0.5)', letterSpacing: '0.04em' }}>
                {account.photos.length === 0 ? 'required' : `${account.photos.length}/${MAX_PHOTOS} photos`}
              </span>
            </div>
            {account.expanded
              ? <ChevronDown size={11} style={{ color: 'rgba(0,229,200,0.5)', flexShrink: 0 }} />
              : <Upload size={11} style={{ color: account.photos.length > 0 ? 'rgba(0,229,200,0.4)' : 'rgba(239,68,68,0.4)', flexShrink: 0 }} />
            }
          </button>
        </td>
      </tr>

      {/* Expanded photo row */}
      {account.expanded && (
        <tr style={{ borderBottom: '1px solid rgba(0,229,200,0.08)', background: 'rgba(0,0,0,0.4)' }}>
          <td colSpan={8} style={{ padding: '18px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ paddingTop: 2, flexShrink: 0 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 4 }}>
                  PROFILE PHOTOS
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: 'rgba(224,224,224,0.25)', lineHeight: 1.6 }}>
                  Account #{String(index + 1).padStart(2, '0')}<br />
                  {MAX_PHOTOS} slots · JPG / PNG
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <PhotoUploader account={account} onChange={onChange} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateJobPage() {
  const router = useRouter()
  const supabase = createClient()

  const [phase, setPhase] = useState<'setup' | 'configure'>('setup')
  const [batchSize, setBatchSize] = useState(3)
  const [country] = useState('TH')
  const [accounts, setAccounts] = useState<AccountDraft[]>([])
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('user_settings').select('credits').single().then(({ data }) => {
      setCredits(data?.credits ?? 0)
    })
  }, [])

  const initBatch = () => {
    const fresh: AccountDraft[] = Array.from({ length: batchSize }, (_, i) => makeAccount(i))
    setAccounts(fresh)
    setPhase('configure')
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const updateAccount = (id: string, updates: Partial<AccountDraft>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  // Copy a field value from row i downward to all subsequent rows
  const copyDown = (fromId: string, field: keyof AccountDraft, value: unknown) => {
    setAccounts(prev => {
      const idx = prev.findIndex(a => a.id === fromId)
      if (idx === -1) return prev
      return prev.map((a, i) => i > idx ? { ...a, [field]: value } : a)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if ((credits ?? 0) === 0) { setError('No credits available. Top up to launch jobs.'); return }
    const cost = accounts.length * CREDITS_PER_ACCOUNT
    if ((credits ?? 0) < cost) { setError(`Insufficient credits. Need ${cost}, you have ${credits}.`); return }

    const notReady = accounts.filter(a => !isReady(a))
    if (notReady.length > 0) {
      setError(`${notReady.length} account${notReady.length > 1 ? 's' : ''} are incomplete. Check all required fields and photos.`)
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: settings } = await supabase.from('user_settings').select('credits').eq('user_id', user.id).single()
      const actualCost = accounts.length * CREDITS_PER_ACCOUNT
      if ((settings?.credits ?? 0) < actualCost) {
        setError(`Insufficient credits. Need ${actualCost}, have ${settings?.credits ?? 0}.`)
        setLoading(false)
        return
      }

      const { data: job, error: jobErr } = await supabase.from('jobs').insert({
        user_id: user.id,
        status: 'queued',
        total_accounts: accounts.length,
        completed_accounts: 0,
        failed_accounts: 0,
        credits_reserved: actualCost,
        credits_charged: 0,
        config: {
          country,
          accounts: accounts.map(a => ({
            profile_name: a.profile_name,
            profile_note: a.profile_note,
            desired_name: a.desired_name,
            birthday: a.birthday,
            gender: a.gender,
            proxy: a.proxy,
            photos: [],
          })),
        },
        started_at: null, completed_at: null, worker_id: null, error_message: null,
      }).select().single()
      if (jobErr) throw jobErr

      // Upload photos per account
      const accountsWithPhotos = await Promise.all(accounts.map(async (a, ai) => {
        const paths: string[] = []
        for (let pi = 0; pi < a.photos.length; pi++) {
          const file = a.photos[pi]
          const path = `${user.id}/${job.id}/acc${ai}_${pi}_${file.name}`
          const { error: upErr } = await supabase.storage.from('account-photos').upload(path, file)
          if (upErr) throw upErr
          paths.push(path)
          await supabase.from('account_photos').insert({
            account_id: job.id, job_id: job.id, user_id: user.id,
            storage_path: path, original_filename: file.name, order_index: pi,
          })
        }
        return {
          profile_name: a.profile_name,
          profile_note: a.profile_note,
          desired_name: a.desired_name,
          birthday: a.birthday,
          gender: a.gender,
          proxy: a.proxy,
          photos: paths,
        }
      }))

      await supabase.from('jobs').update({
        config: { country, accounts: accountsWithPhotos },
      }).eq('id', job.id)

      router.push(`/jobs/${job.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
      setLoading(false)
    }
  }

  const readyCount = accounts.filter(isReady).length
  const totalCost = accounts.length * CREDITS_PER_ACCOUNT
  const noCredits = credits !== null && credits === 0
  const insufficientCredits = credits !== null && credits < totalCost && credits > 0
  const canSubmit = !noCredits && !insufficientCredits && !loading && readyCount === accounts.length && accounts.length > 0

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'transparent' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
            NEW BATCH JOB · TRIAL
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Launch Automation Batch
          </h1>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
            {credits === null
              ? 'Loading…'
              : noCredits
                ? <span style={{ color: 'rgba(251,191,36,0.6)' }}>0 credits — top up to launch</span>
                : <span>
                    Available: <span style={{ color: '#00e5c8', fontWeight: 700 }}>{credits}</span> credits
                    {' · '}<span style={{ color: 'rgba(168,85,247,0.7)' }}>2 credits / account · trial period</span>
                  </span>
            }
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'rgba(168,85,247,0.2) 1px solid', background: 'rgba(168,85,247,0.04)' }}>
          <Zap size={11} style={{ color: 'rgba(168,85,247,0.6)' }} />
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(168,85,247,0.6)', letterSpacing: '0.06em' }}>
            TRIAL · MAX {TRIAL_MAX} ACCOUNTS
          </span>
        </div>
      </div>

      {/* ── No credits banner ── */}
      {noCredits && (
        <div style={{ borderRadius: 12, border: '1px solid rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.04)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
          <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(224,224,224,0.5)' }}>
            <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', fontSize: 10 }}>NO CREDITS</span> — You can configure your batch in preview mode. To launch, contact{' '}
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>@aidetectionkiller</span> on Telegram to top up via crypto.
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

        {/* ── Phase 1: Batch setup ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

          {/* Batch size */}
          <div style={{ borderRadius: 14, padding: '1.5rem', border: '1px solid rgba(0,229,200,0.1)', background: 'rgba(0,229,200,0.02)' }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.2em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Batch Size
            </div>
            <input
              type="number" min={1} max={TRIAL_MAX}
              value={batchSize}
              onChange={e => {
                const v = Math.min(TRIAL_MAX, Math.max(1, parseInt(e.target.value) || 1))
                setBatchSize(v)
                if (phase === 'configure') {
                  setAccounts(prev => {
                    if (v > prev.length) return [...prev, ...Array.from({ length: v - prev.length }, (_, i) => makeAccount(prev.length + i))]
                    return prev.slice(0, v)
                  })
                }
              }}
              className="matrix-input"
              style={{ fontSize: '1.8rem', fontWeight: 900, textAlign: 'center', padding: '10px' }}
            />
            <div style={{ marginTop: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.3)' }}>
              Max {TRIAL_MAX} accounts per batch · trial period
            </div>
          </div>

          {/* Country */}
          <div style={{ borderRadius: 14, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.35)' }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.2em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Target Country
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {AVAILABLE_COUNTRIES.map(c => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,229,200,0.4)', background: 'rgba(0,229,200,0.08)' }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>
                  <div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#00e5c8', fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: 'rgba(0,229,200,0.4)' }}>{c.note}</div>
                  </div>
                  <CheckCircle2 size={14} style={{ color: '#00e5c8', marginLeft: 'auto' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                {LOCKED_COUNTRIES.map(c => (
                  <span key={c.code} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.2)', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
                    {c.flag} {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Cost + trial info */}
          <div style={{ borderRadius: 14, padding: '1.5rem', border: '1px solid rgba(168,85,247,0.1)', background: 'rgba(168,85,247,0.02)' }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.5)', letterSpacing: '0.2em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Cost Estimate
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Accounts', value: `${batchSize}×` },
                { label: 'Rate', value: `${CREDITS_PER_ACCOUNT} credits each` },
                { label: 'Total', value: `${batchSize * CREDITS_PER_ACCOUNT} credits`, big: true },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.label}</span>
                  <span style={r.big ? { fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 22, color: '#a855f7' } : { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(168,85,247,0.7)', fontWeight: 700 }}>
                    {r.value}
                  </span>
                </div>
              ))}
              <div style={{ height: 1, background: 'rgba(168,85,247,0.07)', margin: '4px 0' }} />
              {credits !== null && (
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: insufficientCredits ? '#ef4444' : 'rgba(0,229,200,0.4)' }}>
                  {insufficientCredits
                    ? `⚠ Need ${totalCost}, you have ${credits}`
                    : `✓ ${credits} available — ${credits - totalCost} remaining after launch`
                  }
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.03)', alignItems: 'flex-start' }}>
                <Info size={10} style={{ color: 'rgba(251,191,36,0.5)', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: 'rgba(251,191,36,0.45)', lineHeight: 1.6 }}>
                  Trial rate · Charged only on confirmed active accounts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Initialize batch button ── */}
        {phase === 'setup' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={initBatch}
              style={{
                background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
                color: '#000', fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.12em',
                padding: '14px 40px', borderRadius: 10, border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 0 28px rgba(0,229,200,0.25)',
                textTransform: 'uppercase',
              }}
            >
              <PlusCircle size={14} />
              Initialize {batchSize} Account{batchSize > 1 ? 's' : ''} →
            </button>
          </div>
        )}

        {/* ── Phase 2: Account configuration table ── */}
        {phase === 'configure' && (
          <div ref={tableRef}>
            {/* Table header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Account Configuration
                </span>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: readyCount === accounts.length ? '#00e5c8' : 'rgba(224,224,224,0.3)', padding: '2px 8px', borderRadius: 4, border: `1px solid ${readyCount === accounts.length ? 'rgba(0,229,200,0.3)' : 'rgba(255,255,255,0.06)'}`, background: readyCount === accounts.length ? 'rgba(0,229,200,0.07)' : 'transparent' }}>
                  {readyCount}/{accounts.length} ready
                </span>
              </div>
              <button
                type="button"
                onClick={initBatch}
                style={{ background: 'none', border: '1px solid rgba(0,229,200,0.15)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(0,229,200,0.4)', fontFamily: '"JetBrains Mono", monospace', fontSize: 9 }}
              >
                <RefreshCw size={9} /> Reset
              </button>
            </div>

            {/* Info bar */}
            <div style={{ display: 'flex', gap: 16, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(0,229,200,0.06)', background: 'rgba(0,0,0,0.3)', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.4)', letterSpacing: '0.08em' }}>
                <span style={{ color: '#00e5c8' }}>Geelark Name</span> — your internal reference shown in your Geelark dashboard (e.g. @handle, Order#123)
              </div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.25)' }}>
                Click <Copy size={9} style={{ display: 'inline', verticalAlign: 'middle' }} /> to copy a value to all rows below
              </div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.25)' }}>
                Click <span style={{ color: 'rgba(0,229,200,0.4)' }}>N/6</span> to upload photos for each account
              </div>
            </div>

            {/* Scrollable table */}
            <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid rgba(0,229,200,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
                <thead>
                  <tr style={{ background: 'rgba(0,229,200,0.03)', borderBottom: '1px solid rgba(0,229,200,0.06)' }}>
                    {[
                      { label: '#', w: 40 },
                      { label: 'Geelark Name', w: 160, hint: 'internal ref' },
                      { label: 'Note', w: 120, hint: 'optional' },
                      { label: 'Display Name', w: 130, hint: 'in-app' },
                      { label: 'Birthday', w: 130 },
                      { label: 'Gender', w: 72 },
                      { label: 'Proxy', w: 200, hint: 'host:port:user:pass' },
                      { label: 'Photos', w: 110, hint: `${MAX_PHOTOS} required` },
                    ].map(h => (
                      <th key={h.label} style={{ padding: '10px 6px', textAlign: 'left', fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: 'rgba(0,229,200,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, width: h.w }}>
                        {h.label}
                        {h.hint && <span style={{ color: 'rgba(224,224,224,0.2)', marginLeft: 4 }}>· {h.hint}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account, i) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      index={i}
                      isLast={i === accounts.length - 1}
                      onChange={updates => updateAccount(account.id, updates)}
                      onCopyDown={(field, value) => copyDown(account.id, field, value)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Submit footer ── */}
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', borderRadius: 14, border: `1px solid ${canSubmit ? 'rgba(0,229,200,0.15)' : 'rgba(255,255,255,0.05)'}`, background: canSubmit ? 'rgba(0,229,200,0.025)' : 'rgba(0,0,0,0.3)' }}>
              {/* Status */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: canSubmit ? '#00e5c8' : 'rgba(224,224,224,0.4)', fontWeight: 700, marginBottom: 4 }}>
                  {canSubmit
                    ? `✓ All ${accounts.length} accounts configured — ready to launch`
                    : `${readyCount}/${accounts.length} accounts ready · complete all required fields`
                  }
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.25)' }}>
                  {accounts.length} accounts × {CREDITS_PER_ACCOUNT} credits = <span style={{ color: 'rgba(168,85,247,0.7)', fontWeight: 700 }}>{totalCost} credits total</span>
                  {' · '}charged only on confirmed active accounts
                </div>
              </div>

              {/* Launch button */}
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  background: noCredits
                    ? 'rgba(255,255,255,0.04)'
                    : canSubmit
                      ? 'linear-gradient(135deg, #00b8d9, #00e5c8)'
                      : 'rgba(255,255,255,0.06)',
                  color: canSubmit && !noCredits ? '#000' : 'rgba(224,224,224,0.3)',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700, fontSize: 12, letterSpacing: '0.12em',
                  padding: '14px 32px', borderRadius: 10, border: 'none',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                  boxShadow: canSubmit ? '0 0 28px rgba(0,229,200,0.3)' : 'none',
                  textTransform: 'uppercase', transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {noCredits
                  ? <><Lock size={13} /> No Credits</>
                  : loading
                    ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Launching…</>
                    : <><PlusCircle size={13} /> Launch {accounts.length} Account{accounts.length > 1 ? 's' : ''}</>
                }
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  )
}
