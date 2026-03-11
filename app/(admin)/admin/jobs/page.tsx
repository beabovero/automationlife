import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Job } from '@/lib/types'

function StatusBadge({ status }: { status: Job['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

const STATUS_OPTIONS = ['all', 'queued', 'processing', 'completed', 'failed', 'partial', 'retrying'] as const

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminJobsPage({ searchParams }: Props) {
  const { status } = await searchParams
  const activeFilter = (status ?? 'all') as typeof STATUS_OPTIONS[number]

  const adminSupabase = await createAdminClient()
  let query = adminSupabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(200)
  if (activeFilter !== 'all') query = query.eq('status', activeFilter)

  const { data: jobs } = await query

  const counts: Record<string, number> = { all: 0 }
  const { data: allJobs } = await adminSupabase.from('jobs').select('status')
  allJobs?.forEach(j => {
    counts[j.status] = (counts[j.status] ?? 0) + 1
    counts.all = (counts.all ?? 0) + 1
  })

  const totalRevenue = jobs?.reduce((s, j) => s + (j.credits_charged ?? 0), 0) ?? 0

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'transparent' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
          SYSTEM MONITOR
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Job Monitor
        </h1>
        <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
          All jobs across all users · {counts.all ?? 0} total
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Active', value: (counts.queued ?? 0) + (counts.processing ?? 0), color: '#00d4ff' },
          { label: 'Completed', value: counts.completed ?? 0, color: '#00e5c8' },
          { label: 'Failed', value: counts.failed ?? 0, color: '#ef4444' },
          { label: 'Revenue', value: `${totalRevenue}cr`, color: '#a855f7' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '10px 20px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.04)',
            background: '#000', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.label}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 16, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map(s => {
          const active = s === activeFilter
          return (
            <Link
              key={s}
              href={s === 'all' ? '/admin/jobs' : `/admin/jobs?status=${s}`}
              style={{
                padding: '6px 14px', borderRadius: 6, textDecoration: 'none',
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.08em',
                border: active ? '1px solid rgba(0,229,200,0.4)' : '1px solid rgba(255,255,255,0.06)',
                background: active ? 'rgba(0,229,200,0.08)' : 'transparent',
                color: active ? '#00e5c8' : 'rgba(224,224,224,0.4)',
                textTransform: 'uppercase',
              }}
            >
              {s} {counts[s] !== undefined ? `(${counts[s]})` : ''}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      {!jobs || jobs.length === 0 ? (
        <div style={{ padding: '4rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, textAlign: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(224,224,224,0.25)' }}>
          No jobs found for this filter
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(0,229,200,0.08)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,229,200,0.02)' }}>
                {['Job ID', 'User', 'Status', 'Accounts', 'Progress', 'Credits', 'Created'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                      color: 'rgba(0,229,200,0.4)', letterSpacing: '0.15em',
                      textTransform: 'uppercase', fontWeight: 600,
                      borderBottom: '1px solid rgba(0,229,200,0.06)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => {
                const pct = job.total_accounts ? (job.completed_accounts / job.total_accounts) * 100 : 0
                return (
                  <tr key={job.id} style={{ borderBottom: '1px solid rgba(0,229,200,0.04)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        href={`/jobs/${job.id}`}
                        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(0,212,255,0.7)', textDecoration: 'none' }}
                      >
                        {job.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.4)' }}>
                      {job.user_id.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.45)' }}>
                      {job.total_accounts}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 70, height: 3, borderRadius: 999, background: 'rgba(0,229,200,0.08)', overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #00b8d9, #00e5c8)', borderRadius: 999 }} />
                        </div>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.3)' }}>
                          {job.completed_accounts}/{job.total_accounts}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#00e5c8' }}>
                      {job.credits_charged}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.3)' }}>
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
