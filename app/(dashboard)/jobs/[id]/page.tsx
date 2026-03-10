'use client'
import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Job, Account, AccountStatusEvent } from '@/lib/types'
import { ArrowLeft, RefreshCw } from 'lucide-react'

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
        className="cursor-pointer border-b border-[rgba(0,255,65,0.06)] transition-colors hover:bg-[rgba(0,255,65,0.02)]"
      >
        <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.6)]">{account.id.slice(0, 8)}…</td>
        <td className="px-4 py-3"><StatusBadge status={account.status} /></td>
        <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.4)]">
          S{account.stage_reached ?? 0} · {account.current_checkpoint ?? '—'}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.4)]">{account.retry_count}</td>
        <td className="px-4 py-3 font-mono text-xs text-[#00ff41]">{account.credits_charged}</td>
        <td className="px-4 py-3 font-mono text-xs text-[rgba(0,212,255,0.7)]">
          {expanded ? '▼' : '▶'}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-[rgba(0,255,65,0.06)] bg-[rgba(0,0,0,0.3)]">
          <td colSpan={6} className="px-6 py-4">
            {account.error_message && (
              <div className="mb-3 rounded border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] px-3 py-2 font-mono text-xs text-red-400">
                {account.error_message}
              </div>
            )}
            {events.length === 0 ? (
              <div className="font-mono text-xs text-[rgba(224,224,224,0.3)]">No events yet</div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {events.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3 font-mono text-xs">
                    <span className="text-[rgba(0,255,65,0.3)] shrink-0">
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </span>
                    <span className="text-[rgba(0,212,255,0.6)] shrink-0">S{ev.stage}·{ev.checkpoint}</span>
                    <span className="text-[rgba(224,224,224,0.6)]">{ev.message}</span>
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

    // Realtime subscription
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
      <div className="flex h-full items-center justify-center p-8">
        <RefreshCw size={20} className="animate-spin text-[#00ff41]" />
      </div>
    )
  }

  if (!job) {
    return <div className="p-8 font-mono text-sm text-red-400">Job not found</div>
  }

  const pct = job.total_accounts ? (job.completed_accounts / job.total_accounts) * 100 : 0

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/jobs" className="text-[rgba(0,212,255,0.6)] hover:text-[#00d4ff] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold text-white">Job {job.id.slice(0, 8)}…</h1>
          <p className="font-mono text-xs text-[rgba(0,255,65,0.4)]">
            Created {new Date(job.created_at).toLocaleString()}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={job.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          ['Total',     job.total_accounts,     '#e0e0e0'],
          ['Completed', job.completed_accounts,  '#00ff41'],
          ['Failed',    job.failed_accounts,     '#ef4444'],
          ['Credits',   job.credits_charged,     '#00ff41'],
        ].map(([label, val, color]) => (
          <div key={label as string} className="glass-card rounded-xl p-4">
            <div className="font-mono text-2xl font-black" style={{ color: color as string }}>{val}</div>
            <div className="font-mono text-[10px] tracking-widest text-[rgba(224,224,224,0.4)] uppercase">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between font-mono text-xs text-[rgba(0,255,65,0.5)]">
          <span>Progress</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(0,255,65,0.1)]">
          <div
            className="h-full rounded-full bg-[#00ff41] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Error */}
      {job.error_message && (
        <div className="mb-6 rounded border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-4 py-3 font-mono text-xs text-red-400">
          {job.error_message}
        </div>
      )}

      {/* Accounts table */}
      <h2 className="mb-4 font-mono text-xs font-bold tracking-widest text-[rgba(0,255,65,0.6)] uppercase">
        Accounts ({accounts.length})
      </h2>
      {accounts.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center font-mono text-xs text-[rgba(224,224,224,0.3)]">
          {job.status === 'queued' ? 'Waiting for worker to pick up job…' : 'No accounts yet'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[rgba(0,255,65,0.1)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,65,0.1)] bg-[rgba(0,255,65,0.03)]">
                {['Account', 'Status', 'Stage', 'Retries', 'Credits', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.5)] uppercase">
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
