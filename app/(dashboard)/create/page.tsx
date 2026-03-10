'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import SimulationPanel from '@/components/SimulationPanel'
import { Upload, X, AlertCircle } from 'lucide-react'

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

  // Load credits once
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

      // Check credits
      const { data: settings } = await supabase.from('user_settings').select('credits').eq('user_id', user.id).single()
      if ((settings?.credits ?? 0) < form.accounts_count) {
        setError(`Insufficient credits. You have ${settings?.credits ?? 0}, need ${form.accounts_count}.`)
        setLoading(false)
        return
      }

      // Insert job
      const { data: job, error: jobErr } = await supabase.from('jobs').insert({
        user_id: user.id,
        status: 'queued',
        total_accounts: form.accounts_count,
        completed_accounts: 0,
        failed_accounts: 0,
        credits_reserved: form.accounts_count,
        credits_charged: 0,
        config: {
          ...form,
          geelark_api_key: form.geelark_api_key,
          photos: [],
        },
        started_at: null,
        completed_at: null,
        worker_id: null,
        error_message: null,
      }).select().single()
      if (jobErr) throw jobErr

      // Upload photos
      const storagePaths: string[] = []
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const path = `${user.id}/${job.id}/${i}_${file.name}`
        const { error: upErr } = await supabase.storage.from('account-photos').upload(path, file)
        if (upErr) throw upErr
        storagePaths.push(path)

        // Insert photo record
        await supabase.from('account_photos').insert({
          account_id: job.id, // temporary reference, updated by worker
          job_id: job.id,
          user_id: user.id,
          storage_path: path,
          original_filename: file.name,
          order_index: i,
        })
      }

      // Update job with photo paths
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
      <div className="p-8">
        <h1 className="mb-8 font-mono text-2xl font-bold text-white">New Job</h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="glass-card rounded-xl p-8 text-center">
            <AlertCircle size={40} className="mx-auto mb-4 text-[#fbbf24]" />
            <div className="font-mono text-lg font-bold text-[#fbbf24]">No Credits Available</div>
            <p className="mt-2 text-sm text-[rgba(224,224,224,0.6)]">
              Contact <span className="text-[#fbbf24] font-bold">@aidetectionkiller</span> on Telegram
              to top up your credits via crypto.
            </p>
            <p className="mt-1 text-xs text-[rgba(224,224,224,0.4)]">1 credit = $1 = 1 account</p>
            <div className="mt-6 space-y-2 text-xs font-mono text-[rgba(0,229,200,0.5)]">
              <div>Trial (first time): $2/account · max 10 accounts</div>
              <div>No-plan: $5/account</div>
              <div>Monthly plan: $250/month, tiered per-account pricing</div>
            </div>
          </div>
          <div>
            <div className="mb-3 font-mono text-xs tracking-widest text-[rgba(0,229,200,0.5)] uppercase">Demo Preview</div>
            <SimulationPanel />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 font-mono text-2xl font-bold text-white">New Automation Job</h1>
      <p className="mb-8 font-mono text-xs text-[rgba(0,229,200,0.4)]">
        Available credits: <span className="text-[#00e5c8]">{credits ?? '…'}</span>
      </p>

      {error && (
        <div className="mb-6 rounded border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-4 py-3 font-mono text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Account count */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="mb-4 font-mono text-xs font-bold tracking-widest text-[rgba(0,229,200,0.6)] uppercase">
                Job Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.5)] uppercase">
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
                  <p className="mt-1 font-mono text-[10px] text-[rgba(0,229,200,0.3)]">
                    Cost: {form.accounts_count} credit{form.accounts_count !== 1 ? 's' : ''} · charged on success only
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.5)] uppercase">
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

            {/* Profile */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="mb-4 font-mono text-xs font-bold tracking-widest text-[rgba(0,229,200,0.6)] uppercase">
                Profile Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.5)] uppercase">
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
                  <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.5)] uppercase">
                    Profile Bio
                  </label>
                  <textarea
                    value={form.profile_bio}
                    onChange={e => setForm(f => ({ ...f, profile_bio: e.target.value }))}
                    placeholder="Looking for meaningful connections..."
                    rows={3}
                    className="matrix-input resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.5)] uppercase">
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
                    <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.5)] uppercase">
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
                  <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.5)] uppercase">
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

          {/* Right column — Photos */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="mb-4 font-mono text-xs font-bold tracking-widest text-[rgba(0,229,200,0.6)] uppercase">
                Profile Photos ({photos.length}/{MAX_PHOTOS})
              </h2>

              {photos.length < MAX_PHOTOS && (
                <div
                  {...getRootProps()}
                  className={`mb-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all ${
                    isDragActive
                      ? 'border-[#00e5c8] bg-[rgba(0,229,200,0.06)]'
                      : 'border-[rgba(0,229,200,0.2)] hover:border-[rgba(0,229,200,0.4)] hover:bg-[rgba(0,229,200,0.02)]'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload size={24} className="mx-auto mb-2 text-[rgba(0,229,200,0.4)]" />
                  <p className="font-mono text-xs text-[rgba(0,229,200,0.5)]">
                    {isDragActive ? 'Drop photos here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-[rgba(0,229,200,0.3)]">
                    JPG, PNG — max {MAX_PHOTOS} photos
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-[rgba(0,229,200,0.15)]">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 rounded bg-[rgba(0,0,0,0.7)] px-1.5 py-0.5 font-mono text-[9px] text-[#00e5c8]">
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
              className="btn-matrix-solid w-full rounded py-3 text-base"
            >
              {loading ? 'Creating job...' : `Launch ${form.accounts_count} Account${form.accounts_count !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
