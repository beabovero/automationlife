import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Job } from '@/lib/types'
import { PlusCircle } from 'lucide-react'

function StatusBadge({ status }: { status: Job['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
            JOB MANAGEMENT
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            All Jobs
          </h1>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
            {jobs?.length ?? 0} total job{(jobs?.length ?? 0) !== 1 ? 's' : ''}
          </div>
        </div>
        <Link
          href="/create"
          style={{
            background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
            color: '#000',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.12em',
            padding: '12px 28px',
            borderRadius: 8,
            textDecoration: 'none',
            display: 'inline-flex',
            gap: 8,
            alignItems: 'center',
            boxShadow: '0 0 25px rgba(0,229,200,0.3)',
          }}
        >
          <PlusCircle size={13} />
          NEW JOB
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div style={{
          padding: '5rem',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', marginBottom: '1.5rem' }}>
            No jobs created yet
          </div>
          <Link
            href="/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 22px',
              border: '1px solid rgba(0,229,200,0.3)',
              borderRadius: 7,
              fontSize: 11,
              fontFamily: '"JetBrains Mono", monospace',
              color: 'rgba(0,229,200,0.7)',
              textDecoration: 'none',
              letterSpacing: '0.06em',
              background: 'rgba(0,229,200,0.03)',
            }}
          >
            <PlusCircle size={12} />
            Create your first job →
          </Link>
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(0,229,200,0.08)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,229,200,0.03)' }}>
                {['Job ID', 'Status', 'Accounts', 'Progress', 'Credits', 'Created', ''].map(h => (
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
              {jobs.map((job) => {
                const pct = job.total_accounts ? (job.completed_accounts / job.total_accounts) * 100 : 0
                return (
                  <tr key={job.id} style={{ borderBottom: '1px solid rgba(0,229,200,0.04)' }}>
                    <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.5)' }}>
                      {job.id.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.5)' }}>
                      {job.total_accounts}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 4, borderRadius: 999, background: 'rgba(0,229,200,0.08)', overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #00b8d9, #00e5c8)', borderRadius: 999 }} />
                        </div>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.35)' }}>
                          {job.completed_accounts}/{job.total_accounts}
                        </span>
                        {job.failed_accounts > 0 && (
                          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#ef4444' }}>({job.failed_accounts}✗)</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#00e5c8' }}>
                      {job.credits_charged}
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.35)' }}>
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <Link
                        href={`/jobs/${job.id}`}
                        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(0,212,255,0.7)', textDecoration: 'none' }}
                      >
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
  )
}
