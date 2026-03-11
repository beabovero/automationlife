'use client'
import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Job, Account, AccountStatusEvent } from '@/lib/types'
import { ArrowLeft, RefreshCw } from 'lucide-react'

// Generic phase labels shown to users — no internal process details
const STAGE_LABELS: Record<number, string> = {
  1: 'SETUP',
  2: 'INSTALL',
  3: 'VERIFY',
  4: 'PERMS',
  5: 'PROFILE',
  6: 'CONFIG',
  7: 'ACTIVE',
}

function StatusBadge({ status }: { status: string }) {
  const cls = ['queued','processing','completed','failed','retrying','partial'].includes(status)
    ? `badge badge-${status}`
    : 'badge'
  return <span className={cls}>{status}</span>
}

function AccountRow({ account }: { account: Account }) {
  const [expanded, setExpanded] = useState(false)
  const [events, setEvents] = useState<AccountStatusEvent[]>([])
  const supabase = createClient()

  const loadEvents = async () => {
    const { data } = await supabase
      .from('account_status_events')
      .select('*')
      .eq('account_id', account.id)
      .order('created_at', { ascending: true })
    setEvents(data ?? [])
  }

  const toggle = async () => {
    if (!expanded && events.length === 0) await loadEvents()
    setExpanded(e => !e)
  }

  return (
    <>
      <tr
        onClick={toggle}
        style={{ borderBottom: '1px solid rgba(0,229,200,0.04)', cursor: 'pointer' }}
      >
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.5)' }}>{account.id.slice(0, 8)}…</td>
        <td style={{ padding: '12px 16px' }}><StatusBadge status={account.status} /></td>
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.4)' }}>
          {account.stage_reached
            ? <span style={{ color: '#00e5c8' }}>Phase {account.stage_reached} · <span style={{ color: 'rgba(0,229,200,0.5)', fontSize: 9 }}>{STAGE_LABELS[account.stage_reached] ?? '—'}</span></span>
            : <span style={{ color: 'rgba(224,224,224,0.2)' }}>—</span>
          }
        </td>
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.4)' }}>{account.retry_count}</td>
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#00e5c8' }}>{account.credits_charged}</td>
        <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(0,212,255,0.6)' }}>
          {expanded ? '▼' : '▶'}
        </td>
      </tr>
      {expanded && (
        <tr style={{ borderBottom: '1px solid rgba(0,229,200,0.04)', background: 'rgba(0,0,0,0.4)' }}>
          <td colSpan={6} style={{ padding: '16px 20px' }}>
            {account.error_message && (
              <div style={{
                marginBottom: 12, padding: '10px 14px',
                border: '1px solid rgba(239,68,68,0.2)',
                background: 'rgba(239,68,68,0.04)',
                borderRadius: 6,
                fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444',
              }}>
                {account.error_message}
              </div>
            )}
            {events.length === 0 ? (
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.25)' }}>No events yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                {events.map(ev => (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>
                    <span style={{ color: 'rgba(0,229,200,0.3)', flexShrink: 0 }}>
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </span>
                    {ev.stage && (
                      <span style={{ color: 'rgba(0,212,255,0.55)', flexShrink: 0, fontSize: 10 }}>
                        P{ev.stage} · {STAGE_LABELS[ev.stage] ?? '—'}
                      </span>
                    )}
                    <span style={{ color: 'rgba(224,224,224,0.6)' }}>{ev.message}</span>
                  </div>
                ))}
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
      supabase.from('accounts').select('*').eq('job_id', id).order('created_at'),
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

  const pct = job.total_accounts ? (job.completed_accounts / job.total_accounts) * 100 : 0

  const statCards = [
    { label: 'Total',     value: job.total_accounts,    color: '#e0e0e0',  accent: 'rgba(224,224,224,0.2)' },
    { label: 'Completed', value: job.completed_accounts, color: '#00e5c8',  accent: '#00e5c8' },
    { label: 'Failed',    value: job.failed_accounts,    color: '#ef4444',  accent: '#ef4444' },
    { label: 'Credits',   value: job.credits_charged,    color: '#00e5c8',  accent: '#00b8d9' },
  ]

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'transparent' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2.5rem' }}>
        <Link
          href="/jobs"
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid rgba(0,229,200,0.15)',
            background: 'rgba(0,229,200,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(0,229,200,0.6)', textDecoration: 'none', flexShrink: 0,
          }}
        >
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

      {/* Stats */}
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
              {s.value}
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
            borderRadius: 999,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ marginTop: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.25)' }}>
          {job.completed_accounts} of {job.total_accounts} accounts completed
        </div>
      </div>

      {/* Error */}
      {job.error_message && (
        <div style={{
          marginBottom: '1.5rem', padding: '12px 16px',
          border: '1px solid rgba(239,68,68,0.3)',
          background: 'rgba(239,68,68,0.06)',
          borderRadius: 10,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444',
        }}>
          {job.error_message}
        </div>
      )}

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
                {['Account', 'Status', 'Stage', 'Retries', 'Credits', ''].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 9,
                      color: 'rgba(0,229,200,0.4)',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(0,229,200,0.06)',
                    }}
                  >
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
