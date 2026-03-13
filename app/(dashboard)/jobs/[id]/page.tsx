'use client'
import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Job, Account, AccountStatusEvent } from '@/lib/types'
import { ArrowLeft, RefreshCw } from 'lucide-react'

// Human-readable labels for each workflow stage (matches _dashboard_workflow.json)
const STAGE_LABELS: Record<string, string> = {
  '1':   'Install Bumble',
  '2':   'Open Bumble',
  '3':   'Create Account (OTP)',
  '4':   'App Approvals',
  '5':   'Profile Setup',
  '6':   'Accept Terms',
  'pipeline': 'Photo Pipeline',
  'provision': 'Phone Provisioning',
  'photos': 'Photo Upload',
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued:     'rgba(251,191,36,0.15)',
    processing: 'rgba(0,212,255,0.15)',
    completed:  'rgba(0,229,200,0.15)',
    active:     'rgba(0,229,200,0.15)',
    failed:     'rgba(239,68,68,0.15)',
    partial:    'rgba(168,85,247,0.15)',
    pending:    'rgba(224,224,224,0.08)',
  }
  const text: Record<string, string> = {
    queued:     '#fbbf24',
    processing: '#00d4ff',
    completed:  '#00e5c8',
    active:     '#00e5c8',
    failed:     '#ef4444',
    partial:    '#a855f7',
    pending:    'rgba(224,224,224,0.4)',
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 4,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
      background: map[status] ?? 'rgba(255,255,255,0.06)',
      color: text[status] ?? '#e0e0e0',
      border: `1px solid ${(text[status] ?? '#e0e0e0')}33`,
      textTransform: 'uppercase',
    }}>
      {status}
    </span>
  )
}

function EventDot({ status }: { status: string }) {
  const color = status === 'completed' ? '#00e5c8'
    : status === 'failed' ? '#ef4444'
    : '#00d4ff'
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6,
      borderRadius: '50%', background: color,
      flexShrink: 0, marginTop: 3,
    }} />
  )
}

function AccountRow({ account }: { account: Account }) {
  const [expanded, setExpanded] = useState(false)
  const [events, setEvents] = useState<AccountStatusEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const supabase = createClient()

  const loadEvents = async () => {
    setLoadingEvents(true)
    const { data } = await supabase
      .from('account_status_events')
      .select('*')
      .eq('account_id', account.id)
      .order('created_at', { ascending: true })
    setEvents(data ?? [])
    setLoadingEvents(false)
  }

  const toggle = async () => {
    if (!expanded && events.length === 0) await loadEvents()
    setExpanded(e => !e)
  }

  // Subscribe to new events in real-time when expanded
  useEffect(() => {
    if (!expanded) return
    const ch = supabase
      .channel(`events-${account.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'account_status_events',
        filter: `account_id=eq.${account.id}`,
      }, payload => {
        setEvents(prev => [...prev, payload.new as AccountStatusEvent])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [expanded, account.id])

  const lastEvent = events[events.length - 1]

  return (
    <>
      <tr onClick={toggle} style={{ borderBottom: '1px solid rgba(0,229,200,0.04)', cursor: 'pointer' }}>
        {/* Account ID */}
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.5)' }}>
          <div>{account.profile_name || account.id.slice(0, 8) + '…'}</div>
          {account.geelark_env_id && (
            <div style={{ fontSize: 9, color: 'rgba(0,212,255,0.4)', marginTop: 2 }}>
              phone: {account.geelark_env_id}
            </div>
          )}
        </td>

        {/* Status */}
        <td style={{ padding: '12px 16px' }}>
          <StatusBadge status={account.status} />
        </td>

        {/* Last event / failure reason */}
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, maxWidth: 260 }}>
          {account.failure_reason ? (
            <span style={{ color: '#ef4444' }}>{account.failure_reason}</span>
          ) : lastEvent ? (
            <span style={{ color: 'rgba(224,224,224,0.5)' }}>{lastEvent.label}</span>
          ) : (
            <span style={{ color: 'rgba(224,224,224,0.2)' }}>—</span>
          )}
        </td>

        {/* Retries */}
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.4)' }}>
          {account.retry_attempt ?? 0}
        </td>

        {/* Credits */}
        <td style={{ padding: '12px 16px' }}>
          {account.credits_charged
            ? <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#00e5c8', background: 'rgba(0,229,200,0.08)', padding: '2px 6px', borderRadius: 3 }}>CHARGED</span>
            : <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.2)' }}>—</span>
          }
        </td>

        {/* Expand */}
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,212,255,0.5)' }}>
          {expanded ? '▼' : '▶'}
        </td>
      </tr>

      {expanded && (
        <tr style={{ borderBottom: '1px solid rgba(0,229,200,0.04)', background: 'rgba(0,0,0,0.5)' }}>
          <td colSpan={6} style={{ padding: '16px 20px' }}>

            {/* Failure reason banner */}
            {account.failure_reason && (
              <div style={{
                marginBottom: 12, padding: '10px 14px',
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.06)',
                borderRadius: 6, display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ color: '#ef4444', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', flexShrink: 0, paddingTop: 1 }}>
                  FAILURE
                </span>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444' }}>
                  {account.failure_reason}
                </span>
              </div>
            )}

            {/* Event timeline */}
            {loadingEvents ? (
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.25)' }}>Loading events…</div>
            ) : events.length === 0 ? (
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.25)' }}>No events yet</div>
            ) : (
              <div>
                <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.15em', marginBottom: 8 }}>
                  EVENT LOG · {events.length} entries
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                  {events.map(ev => (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>
                      <EventDot status={ev.status} />
                      <span style={{ color: 'rgba(0,229,200,0.3)', flexShrink: 0, fontSize: 10, width: 72 }}>
                        {new Date(ev.created_at).toLocaleTimeString()}
                      </span>
                      <span style={{
                        color: ev.status === 'failed' ? '#ef4444'
                          : ev.status === 'completed' ? '#00e5c8'
                          : 'rgba(224,224,224,0.6)',
                        flex: 1,
                      }}>
                        {ev.label ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [job, setJob] = useState<Job | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = async () => {
    const [{ data: j }, { data: a }] = await Promise.all([
      supabase.from('jobs').select('*').eq('id', id).single(),
      supabase.from('accounts').select('*').eq('job_id', id).order('position'),
    ])
    setJob(j)
    setAccounts(a ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`job-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `id=eq.${id}` },
        payload => setJob(payload.new as Job))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `job_id=eq.${id}` },
        () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'transparent' }}>
        <RefreshCw size={20} style={{ color: '#00e5c8', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!job) {
    return (
      <div style={{ padding: '2.5rem', background: 'transparent', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#ef4444' }}>
        Job not found
      </div>
    )
  }

  const pending = job.total_accounts - job.completed_count - job.failed_count
  const pct = job.total_accounts ? (job.completed_count / job.total_accounts) * 100 : 0

  const statCards = [
    { label: 'Total',     value: job.total_accounts,  color: '#e0e0e0', accent: 'rgba(224,224,224,0.2)' },
    { label: 'Completed', value: job.completed_count, color: '#00e5c8', accent: '#00e5c8' },
    { label: 'Failed',    value: job.failed_count,    color: '#ef4444', accent: '#ef4444' },
    { label: 'Pending',   value: Math.max(0, pending), color: '#fbbf24', accent: '#fbbf24' },
  ]

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'transparent' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2.5rem' }}>
        <Link href="/jobs" style={{
          width: 36, height: 36, borderRadius: 8,
          border: '1px solid rgba(0,229,200,0.15)',
          background: 'rgba(0,229,200,0.03)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(0,229,200,0.6)', textDecoration: 'none', flexShrink: 0,
        }}>
          <ArrowLeft size={15} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 4 }}>
            JOB DETAIL
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Job {job.id.slice(0, 8)}…
          </h1>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 4 }}>
            Created {new Date(job.created_at).toLocaleString()}
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            borderRadius: 14, padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.05)',
            background: '#000', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.04em', lineHeight: 1, color: s.color }}>
              {s.value ?? 0}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: s.accent, opacity: 0.4 }} />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '2rem', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid rgba(0,229,200,0.08)', background: 'rgba(0,229,200,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(0,229,200,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Overall Progress
          </span>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700, color: '#00e5c8' }}>
            {pct.toFixed(0)}%
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,229,200,0.08)', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: 'linear-gradient(90deg, #00b8d9, #00e5c8)',
            borderRadius: 999, transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ marginTop: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.25)' }}>
          {job.completed_count} of {job.total_accounts} accounts completed
        </div>
      </div>

      {/* Accounts table */}
      <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Accounts ({accounts.length})
      </div>

      {accounts.length === 0 ? (
        <div style={{
          padding: '4rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14,
          textAlign: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(224,224,224,0.25)',
        }}>
          {job.status === 'queued' ? 'Waiting for worker to pick up job…' : 'No accounts yet'}
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(0,229,200,0.08)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,229,200,0.03)' }}>
                {['Profile', 'Status', 'Last Event / Failure', 'Retries', 'Credits', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 9, color: 'rgba(0,229,200,0.4)',
                    letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
                    borderBottom: '1px solid rgba(0,229,200,0.06)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => <AccountRow key={a.id} account={a} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
