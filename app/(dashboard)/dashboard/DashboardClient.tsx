'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Job, AccountStatusEvent } from '@/lib/types'
import { PlusCircle, Activity, Zap, TrendingUp, ChevronRight, Clock, AlertTriangle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveAccount = {
  id: string
  job_id: string
  status: string
  stage_reached: number | null
  current_checkpoint: string | null
}

interface Props {
  userId: string
  userEmail: string
  initialCredits: number
  initialTotalAccounts: number
  initialPlan: string | null
  initialJobs: Job[]
  initialEvents: AccountStatusEvent[]
  initialActiveAccounts: ActiveAccount[]
  todayCount: number
  weekCount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  return sameDay
    ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getEventColor(status: string): string {
  if (status === 'completed' || status === 'success') return '#00e5c8'
  if (status === 'failed' || status === 'error') return '#ef4444'
  if (status === 'retrying') return '#a855f7'
  return 'rgba(0,212,255,0.8)'
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Working late,'
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  if (h < 21) return 'Good evening,'
  return 'Night shift,'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Job['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

// Real 7-stage pipeline matching _dashboard_workflow.json
const STAGE_NAMES = [
  { short: 'BOOT',    label: 'Cloud Phone Boot' },
  { short: 'LAUNCH',  label: 'App Launch' },
  { short: 'OTP',     label: 'SMS Verify' },
  { short: 'AI PERMS',label: 'Permission AI' },
  { short: 'PROFILE', label: 'Profile Build' },
  { short: 'PREFS',   label: 'Preferences' },
  { short: 'LIVE',    label: 'Confirmed Live' },
]

function StagePipeline({ currentStage }: { currentStage: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'nowrap', overflow: 'hidden' }}>
      {STAGE_NAMES.map((s, i) => {
        const n = i + 1
        const active = n === currentStage
        const done = n < currentStage
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              padding: '3px 6px', borderRadius: 4, fontSize: 7.5,
              fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.03em',
              border: `1px solid ${active ? '#00e5c8' : done ? 'rgba(0,229,200,0.25)' : 'rgba(255,255,255,0.06)'}`,
              background: active ? 'rgba(0,229,200,0.12)' : done ? 'rgba(0,229,200,0.04)' : 'transparent',
              color: active ? '#00e5c8' : done ? 'rgba(0,229,200,0.45)' : 'rgba(224,224,224,0.18)',
              boxShadow: active ? '0 0 10px rgba(0,229,200,0.35)' : 'none',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
            }}
              title={s.label}
            >
              {n}·{s.short}
            </div>
            {i < 6 && (
              <div style={{ width: 5, height: 1, background: done ? 'rgba(0,229,200,0.25)' : 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SuccessRing({ rate, size = 64 }: { rate: number; size?: number }) {
  const r = size / 2 - 5
  const circ = 2 * Math.PI * r
  const offset = circ - (rate / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,229,200,0.07)" strokeWidth="3.5" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#srGrad)" strokeWidth="3.5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
      <defs>
        <linearGradient id="srGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00b8d9" />
          <stop offset="100%" stopColor="#00e5c8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Animated counter hook ─────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const start = prev.current
    const diff = target - start
    if (diff === 0) return
    const steps = Math.max(1, Math.floor(duration / 16))
    let i = 0
    const timer = setInterval(() => {
      i++
      const t = i / steps
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // ease-in-out
      setVal(Math.round(start + diff * ease))
      if (i >= steps) { setVal(target); prev.current = target; clearInterval(timer) }
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return val
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardClient({
  userId, userEmail, initialCredits, initialTotalAccounts, initialPlan,
  initialJobs, initialEvents, initialActiveAccounts, todayCount, weekCount,
}: Props) {
  const supabase = createClient()

  const [credits, setCredits] = useState(initialCredits)
  const [totalAccounts, setTotalAccounts] = useState(initialTotalAccounts)
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [events, setEvents] = useState<AccountStatusEvent[]>(initialEvents)
  const [activeAccounts, setActiveAccounts] = useState<ActiveAccount[]>(initialActiveAccounts)
  const [tick, setTick] = useState(0)
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set())
  const feedRef = useRef<HTMLDivElement>(null)

  // Animated counters
  const animCredits = useCountUp(credits)
  const animTotal = useCountUp(totalAccounts)
  const animToday = useCountUp(todayCount)
  const animWeek = useCountUp(weekCount)

  // Periodic re-render for running times
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 8000)
    return () => clearInterval(t)
  }, [])

  // Refetch active accounts helper
  const refreshActiveAccounts = useCallback(async (currentJobs: Job[]) => {
    const ids = currentJobs.filter(j => j.status === 'processing' || j.status === 'queued').map(j => j.id)
    if (ids.length === 0) { setActiveAccounts([]); return }
    const { data } = await supabase.from('accounts').select('id, job_id, status, stage_reached, current_checkpoint').in('job_id', ids)
    if (data) setActiveAccounts(data)
  }, [])

  // Realtime subscriptions
  useEffect(() => {
    const jobsCh = supabase.channel('dash-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${userId}` }, payload => {
        setJobs(prev => {
          let next: Job[]
          if (payload.eventType === 'INSERT') next = [payload.new as Job, ...prev]
          else if (payload.eventType === 'UPDATE') next = prev.map(j => j.id === (payload.new as Job).id ? payload.new as Job : j)
          else next = prev
          refreshActiveAccounts(next)
          return next
        })
      })
      .subscribe()

    const eventsCh = supabase.channel('dash-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'account_status_events', filter: `user_id=eq.${userId}` }, payload => {
        const ev = payload.new as AccountStatusEvent
        setNewEventIds(prev => new Set([...prev, ev.id]))
        setEvents(prev => [ev, ...prev.slice(0, 49)])
        setTimeout(() => setNewEventIds(prev => { const n = new Set(prev); n.delete(ev.id); return n }), 2000)
      })
      .subscribe()

    const creditsCh = supabase.channel('dash-credits')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_settings', filter: `user_id=eq.${userId}` }, payload => {
        setCredits(payload.new.credits)
        setTotalAccounts(payload.new.total_accounts_created)
      })
      .subscribe()

    const accountsCh = supabase.channel('dash-accounts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `user_id=eq.${userId}` }, () => {
        setJobs(current => { refreshActiveAccounts(current); return current })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(jobsCh)
      supabase.removeChannel(eventsCh)
      supabase.removeChannel(creditsCh)
      supabase.removeChannel(accountsCh)
    }
  }, [userId])

  // ── Derived values ──────────────────────────────────────────────────────────

  const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued')
  const recentJobs = jobs.slice(0, 8)
  const totalAttempted = jobs.reduce((s, j) => s + (j.total_accounts ?? 0), 0)
  const successRate = totalAttempted > 0 ? Math.round((totalAccounts / totalAttempted) * 100) : null

  const now = Date.now() // captured at render, updated by tick
  void tick

  const getRunningTime = (job: Job) => {
    const start = job.started_at ? new Date(job.started_at).getTime() : new Date(job.created_at).getTime()
    return formatDuration(now - start)
  }

  const getETA = (job: Job): string | null => {
    if (!job.started_at || job.completed_accounts === 0) return null
    const elapsed = now - new Date(job.started_at).getTime()
    const rate = job.completed_accounts / elapsed
    const remaining = job.total_accounts - job.completed_accounts
    if (remaining <= 0) return null
    return formatDuration(remaining / rate) + ' left'
  }

  const getJobStage = (jobId: string): number => {
    const accs = activeAccounts.filter(a => a.job_id === jobId && a.stage_reached)
    if (accs.length === 0) return 1
    return Math.max(...accs.map(a => a.stage_reached ?? 1))
  }

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '2rem 2.5rem', minHeight: '100vh', background: 'transparent' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.22em', marginBottom: 5 }}>
            OPERATOR DASHBOARD
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.025em', marginBottom: 4 }}>
            {getGreeting()} <span style={{ background: 'linear-gradient(135deg,#00b8d9,#00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{userEmail.split('@')[0]}</span>
          </div>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.22)', letterSpacing: '0.05em' }}>
            {dateLabel}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeJobs.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.04)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', display: 'inline-block', boxShadow: '0 0 8px #00d4ff', animation: 'blink 1.2s ease-in-out infinite' }} />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,212,255,0.7)', letterSpacing: '0.1em' }}>
                {activeJobs.length} JOB{activeJobs.length > 1 ? 'S' : ''} LIVE
              </span>
            </div>
          )}
          <Link
            href="/create"
            style={{
              background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
              color: '#000', fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.12em',
              padding: '11px 24px', borderRadius: 8, textDecoration: 'none',
              display: 'inline-flex', gap: 8, alignItems: 'center',
              boxShadow: '0 0 20px rgba(0,229,200,0.3)',
            }}
          >
            <PlusCircle size={13} />
            NEW JOB
          </Link>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {/* Credits */}
        <div style={{ borderRadius: 14, padding: '1.4rem 1.5rem', border: '1px solid rgba(0,229,200,0.15)', background: 'rgba(0,229,200,0.025)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', width: 5, height: 5, borderRadius: '50%', background: '#00e5c8', boxShadow: '0 0 8px #00e5c8' }} />
          <div style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Credits</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.6rem', letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(135deg,#00b8d9,#00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {animCredits.toFixed(0)}
          </div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 5 }}>1 credit = 1 account</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#00b8d9,#00e5c8)' }} />
        </div>

        {/* Total accounts */}
        <div style={{ borderRadius: 14, padding: '1.4rem 1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,212,255,0.8)' }} />
          <div style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>All Time</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.6rem', letterSpacing: '-0.04em', lineHeight: 1, color: '#00d4ff' }}>
            {animTotal}
          </div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 5 }}>accounts created</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,rgba(0,212,255,0.6),rgba(0,212,255,0.15))' }} />
        </div>

        {/* Today */}
        <div style={{ borderRadius: 14, padding: '1.4rem 1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,229,200,0.6)' }} />
          <div style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Today</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.6rem', letterSpacing: '-0.04em', lineHeight: 1, color: '#00e5c8' }}>
            {animToday}
          </div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 5 }}>
            {animWeek} this week
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,rgba(0,229,200,0.5),rgba(0,229,200,0.1))' }} />
        </div>

        {/* Success rate */}
        <div style={{ borderRadius: 14, padding: '1.4rem 1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', width: 5, height: 5, borderRadius: '50%', background: 'rgba(168,85,247,0.7)' }} />
          <div style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Success Rate</div>
          {successRate !== null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SuccessRing rate={successRate} size={58} />
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em', lineHeight: 1, color: '#a855f7' }}>{successRate}%</div>
                <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 4 }}>{totalAttempted} attempted</div>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.6rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'rgba(224,224,224,0.2)' }}>—</div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,rgba(168,85,247,0.5),rgba(168,85,247,0.1))' }} />
        </div>

        {/* Active jobs */}
        <div style={{ borderRadius: 14, padding: '1.4rem 1.5rem', border: activeJobs.length > 0 ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.05)', background: activeJobs.length > 0 ? 'rgba(0,212,255,0.04)' : 'rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', width: 5, height: 5, borderRadius: '50%', background: activeJobs.length > 0 ? '#00d4ff' : 'rgba(224,224,224,0.15)', boxShadow: activeJobs.length > 0 ? '0 0 10px #00d4ff' : 'none', animation: activeJobs.length > 0 ? 'blink 1.5s ease-in-out infinite' : 'none' }} />
          <div style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: activeJobs.length > 0 ? 'rgba(0,212,255,0.5)' : 'rgba(224,224,224,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Active Jobs</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.6rem', letterSpacing: '-0.04em', lineHeight: 1, color: activeJobs.length > 0 ? '#00d4ff' : 'rgba(224,224,224,0.3)' }}>
            {activeJobs.length}
          </div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: activeJobs.length > 0 ? 'rgba(0,212,255,0.4)' : 'rgba(224,224,224,0.2)', marginTop: 5 }}>
            {activeJobs.length > 0 ? 'running now' : 'all idle'}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: activeJobs.length > 0 ? 'linear-gradient(90deg,rgba(0,212,255,0.6),rgba(0,212,255,0.15))' : 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>

      {/* ── Low credits warning ────────────────────────────────────────────── */}
      {credits === 0 && (
        <div style={{ borderRadius: 10, border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.03)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <AlertTriangle size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.55)' }}>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>NO CREDITS</span> — Contact <span style={{ color: '#fbbf24' }}>@aidetectionkiller</span> on Telegram to top up via crypto.
          </div>
        </div>
      )}
      {credits > 0 && credits < 5 && (
        <div style={{ borderRadius: 10, border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.02)', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <Zap size={12} style={{ color: 'rgba(251,191,36,0.6)', flexShrink: 0 }} />
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(251,191,36,0.5)' }}>
            CREDITS RUNNING LOW · {credits} remaining — top up soon to avoid interruptions
          </div>
        </div>
      )}

      {/* ── Main 2-column grid ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>

        {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Live Operations */}
          {activeJobs.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.9rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', display: 'inline-block', boxShadow: '0 0 10px #00d4ff', animation: 'blink 1.2s ease-in-out infinite' }} />
                <span style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,212,255,0.5)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                  Live Operations
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {activeJobs.map(job => {
                  const pct = job.total_accounts ? Math.round((job.completed_accounts / job.total_accounts) * 100) : 0
                  const stage = getJobStage(job.id)
                  const eta = getETA(job)
                  const running = getRunningTime(job)
                  return (
                    <div key={job.id} style={{
                      borderRadius: 14, padding: '1.4rem 1.6rem',
                      border: '1px solid rgba(0,212,255,0.15)',
                      background: 'rgba(0,212,255,0.025)',
                      position: 'relative', overflow: 'hidden',
                      animation: 'glow-border 3s ease-in-out infinite',
                    }}>
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.08)' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: 'blink 0.9s ease-in-out infinite' }} />
                            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: '#00d4ff', letterSpacing: '0.15em' }}>LIVE</span>
                          </div>
                          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(224,224,224,0.7)' }}>
                            Job {job.id.slice(0, 8)}…
                          </span>
                          <StatusBadge status={job.status} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={10} style={{ color: 'rgba(224,224,224,0.3)' }} />
                          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.35)', letterSpacing: '0.05em' }}>
                            {running}
                          </span>
                          {eta && <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.45)' }}>· {eta}</span>}
                        </div>
                      </div>

                      {/* Progress */}
                      <div style={{ marginBottom: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-0.04em', color: '#00d4ff' }}>
                            {pct}%
                          </div>
                          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.4)' }}>
                            {job.completed_accounts}/{job.total_accounts} · {job.failed_accounts > 0 ? <span style={{ color: '#ef4444' }}>{job.failed_accounts} failed</span> : '0 failed'}
                          </div>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,212,255,0.08)', overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%',
                            background: 'linear-gradient(90deg, #00b8d9, #00e5c8)',
                            borderRadius: 999,
                            transition: 'width 0.8s ease',
                            boxShadow: '0 0 12px rgba(0,229,200,0.4)',
                          }} />
                        </div>
                      </div>

                      {/* Stage pipeline */}
                      <div style={{ marginBottom: '0.9rem' }}>
                        <StagePipeline currentStage={stage} />
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Link
                          href={`/jobs/${job.id}`}
                          style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,212,255,0.5)', textDecoration: 'none', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          View details <ChevronRight size={10} />
                        </Link>
                      </div>

                      {/* Glow strip */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#00b8d9,#00e5c8)', opacity: 0.6 }} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Jobs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
              <span style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                Recent Jobs
              </span>
              <Link href="/jobs" style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.35)', textDecoration: 'none', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={10} />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <Activity size={28} style={{ color: 'rgba(0,229,200,0.15)' }} />
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(224,224,224,0.25)' }}>No jobs yet</div>
                <Link href="/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: '1px solid rgba(0,229,200,0.25)', borderRadius: 7, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.6)', textDecoration: 'none', letterSpacing: '0.06em', background: 'rgba(0,229,200,0.03)' }}>
                  <PlusCircle size={11} />
                  Create your first job →
                </Link>
              </div>
            ) : (
              <div style={{ border: '1px solid rgba(0,229,200,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,229,200,0.025)' }}>
                      {['Job ID', 'Status', 'Progress', 'Credits', 'Created', ''].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: 'rgba(0,229,200,0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid rgba(0,229,200,0.05)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map(job => {
                      const pct = job.total_accounts ? Math.round((job.completed_accounts / job.total_accounts) * 100) : 0
                      return (
                        <tr key={job.id} style={{ borderBottom: '1px solid rgba(0,229,200,0.035)' }}>
                          <td style={{ padding: '11px 14px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.5)' }}>
                            {job.id.slice(0, 8)}…
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <StatusBadge status={job.status} />
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{ width: 72, height: 3, borderRadius: 999, background: 'rgba(0,229,200,0.07)', overflow: 'hidden', flexShrink: 0 }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#00b8d9,#00e5c8)', borderRadius: 999 }} />
                              </div>
                              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.3)' }}>
                                {job.completed_accounts}/{job.total_accounts}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '11px 14px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#00e5c8' }}>
                            {job.credits_charged}
                          </td>
                          <td style={{ padding: '11px 14px', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.28)' }}>
                            {new Date(job.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <Link href={`/jobs/${job.id}`} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,212,255,0.55)', textDecoration: 'none' }}>
                              View →
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions (if no jobs) */}
          {jobs.length === 0 && (
            <div style={{ borderRadius: 14, padding: '1.75rem', border: '1px solid rgba(0,229,200,0.1)', background: 'rgba(0,229,200,0.02)' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Quick Start
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { icon: <PlusCircle size={16} />, label: 'Create New Job', sub: 'Start automating', href: '/create', color: '#00e5c8' },
                  { icon: <TrendingUp size={16} />, label: 'View Credits', sub: 'Check your balance', href: '/credits', color: '#00d4ff' },
                ].map(a => (
                  <Link key={a.href} href={a.href} style={{ textDecoration: 'none', padding: '1rem 1.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: a.color, flexShrink: 0 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: a.color, fontWeight: 700, marginBottom: 2 }}>{a.label}</div>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.3)' }}>{a.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Live Activity Feed */}
          <div style={{ borderRadius: 14, border: '1px solid rgba(0,229,200,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Feed header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,229,200,0.06)', background: 'rgba(0,229,200,0.025)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: events.length > 0 ? '#00e5c8' : 'rgba(224,224,224,0.2)', display: 'inline-block', boxShadow: events.length > 0 ? '0 0 8px #00e5c8' : 'none', animation: events.length > 0 ? 'blink 1.4s ease-in-out infinite' : 'none' }} />
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Activity Feed
                </span>
              </div>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.2)' }}>
                {events.length} events
              </span>
            </div>

            {/* Feed body */}
            <div
              ref={feedRef}
              style={{ padding: '12px', overflowY: 'auto', maxHeight: 320, fontFamily: '"JetBrains Mono", monospace', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.5)' }}
            >
              {events.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: 11, color: 'rgba(224,224,224,0.2)' }}>
                  Waiting for activity…
                </div>
              ) : events.map(ev => {
                const isNew = newEventIds.has(ev.id)
                const color = getEventColor(ev.status)
                return (
                  <div
                    key={ev.id}
                    style={{
                      display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 10,
                      padding: '4px 6px', borderRadius: 4,
                      background: isNew ? 'rgba(0,229,200,0.06)' : 'transparent',
                      borderLeft: isNew ? '2px solid rgba(0,229,200,0.4)' : '2px solid transparent',
                      transition: 'background 0.5s, border-color 0.5s',
                      animation: isNew ? 'slide-up 0.2s ease forwards' : 'none',
                    }}
                  >
                    <span style={{ color: 'rgba(0,229,200,0.3)', flexShrink: 0, fontSize: 9, marginTop: 1 }}>
                      {formatTime(ev.created_at)}
                    </span>
                    {ev.stage && (
                      <span style={{ color: 'rgba(168,85,247,0.6)', flexShrink: 0, fontSize: 9, marginTop: 1 }}>
                        S{ev.stage}{ev.checkpoint ? `·${ev.checkpoint.slice(0, 8)}` : ''}
                      </span>
                    )}
                    <span style={{ color, lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {ev.message ?? ev.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Credits Status Card */}
          <div style={{ borderRadius: 14, padding: '1.4rem', border: '1px solid rgba(0,229,200,0.1)', background: 'rgba(0,229,200,0.02)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Credit Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(135deg,#00b8d9,#00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {credits.toFixed(0)}
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.3)', marginTop: 4 }}>available credits</div>
              </div>
              {/* Mini bar */}
              <div style={{ flex: 1 }}>
                <div style={{ height: 3, borderRadius: 999, background: 'rgba(0,229,200,0.08)', overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${Math.min(100, (credits / Math.max(credits + totalAccounts, 1)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#00b8d9,#00e5c8)', borderRadius: 999 }} />
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.25)' }}>
                  {initialPlan ?? 'Trial plan'}
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(0,229,200,0.07)', marginBottom: '1rem' }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(224,224,224,0.4)', lineHeight: 1.6 }}>
              Top up via Telegram{' '}
              <span style={{ color: '#00e5c8', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>@aidetectionkiller</span>
              {' '}· Crypto accepted
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#00b8d9,#00e5c8)' }} />
          </div>

          {/* Performance summary */}
          {jobs.length > 0 && (
            <div style={{ borderRadius: 14, padding: '1.25rem 1.4rem', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.9rem' }}>
                Performance
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Jobs completed', value: jobs.filter(j => j.status === 'completed').length, color: '#00e5c8' },
                  { label: 'Jobs failed', value: jobs.filter(j => j.status === 'failed').length, color: '#ef4444' },
                  { label: 'Credits spent', value: jobs.reduce((s, j) => s + (j.credits_charged ?? 0), 0), color: '#a855f7' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.35)' }}>{r.label}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
