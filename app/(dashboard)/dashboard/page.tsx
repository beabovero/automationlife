import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Activity } from 'lucide-react'
import type { Job } from '@/lib/types'

function StatusBadge({ status }: { status: Job['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: settings }, { data: jobs }, { data: accounts }] = await Promise.all([
    supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
    supabase.from('jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('accounts').select('status').eq('user_id', user.id),
  ])

  const credits = settings?.credits ?? 0
  const totalAccounts = accounts?.length ?? 0
  const liveAccounts = accounts?.filter(a => a.status === 'active').length ?? 0
  const activeJobs = jobs?.filter(j => j.status === 'processing' || j.status === 'queued').length ?? 0

  const stats = [
    { label: 'Credits',        value: (credits).toFixed(0),  color: 'gradient' },
    { label: 'Total Accounts', value: totalAccounts,           color: '#00d4ff' },
    { label: 'Live Accounts',  value: liveAccounts,            color: '#00e5c8' },
    { label: 'Active Jobs',    value: activeJobs,              color: '#a855f7' },
  ]

  const statAccent: Record<string, string> = {
    'Credits':        'linear-gradient(90deg, #00b8d9, #00e5c8)',
    'Total Accounts': 'linear-gradient(90deg, rgba(0,212,255,0.6), rgba(0,212,255,0.2))',
    'Live Accounts':  'linear-gradient(90deg, #00b8d9, #00e5c8)',
    'Active Jobs':    'linear-gradient(90deg, rgba(168,85,247,0.6), rgba(168,85,247,0.2))',
  }

  const statDot: Record<string, string> = {
    'Credits':        '#00e5c8',
    'Total Accounts': 'rgba(0,212,255,0.8)',
    'Live Accounts':  '#00f5d4',
    'Active Jobs':    'rgba(168,85,247,0.8)',
  }

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      style={{
        padding: '2.5rem 2.5rem',
        minHeight: '100vh',
        background: '#000',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontFamily: '"JetBrains Mono", monospace',
              color: 'rgba(0,229,200,0.4)',
              letterSpacing: '0.2em',
              marginBottom: 6,
            }}
          >
            OPERATOR DASHBOARD
          </div>
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#fff',
              letterSpacing: '-0.02em',
              margin: 0,
              maxWidth: 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.email}
          </h1>
          <div
            style={{
              fontSize: 11,
              fontFamily: '"JetBrains Mono", monospace',
              color: 'rgba(224,224,224,0.25)',
              marginTop: 6,
            }}
          >
            {dateLabel}
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
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
          }}
        >
          <PlusCircle size={13} />
          NEW JOB
        </Link>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              borderRadius: 14,
              padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.05)',
              background: '#000',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = 'rgba(0,229,200,0.2)'
              el.style.boxShadow = '0 0 30px rgba(0,229,200,0.04)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = 'rgba(255,255,255,0.05)'
              el.style.boxShadow = 'none'
            }}
          >
            {/* Dot indicator top-right */}
            <div
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: statDot[s.label],
              }}
            />

            <div
              style={{
                fontSize: 9,
                fontFamily: '"JetBrains Mono", monospace',
                color: 'rgba(224,224,224,0.3)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              {s.label}
            </div>

            <div
              style={
                s.color === 'gradient'
                  ? {
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 900,
                      fontSize: '2.75rem',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }
                  : {
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 900,
                      fontSize: '2.75rem',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      color: s.color,
                    }
              }
            >
              {s.value}
            </div>

            {/* Bottom accent strip */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: statAccent[s.label],
              }}
            />
          </div>
        ))}
      </div>

      {/* No credits warning */}
      {credits === 0 && (
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(251,191,36,0.25)',
            background: 'rgba(251,191,36,0.04)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid rgba(251,191,36,0.4)',
              background: 'rgba(251,191,36,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                color: '#fbbf24',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              NO CREDITS AVAILABLE
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(224,224,224,0.55)',
              }}
            >
              Contact{' '}
              <span style={{ color: '#fbbf24' }}>@aidetectionkiller</span>{' '}
              on Telegram to top up via crypto.
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: '"JetBrains Mono", monospace',
              color: 'rgba(0,229,200,0.4)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            RECENT JOBS
          </span>
          <Link
            href="/jobs"
            style={{
              fontSize: 10,
              fontFamily: '"JetBrains Mono", monospace',
              color: 'rgba(0,229,200,0.4)',
              textDecoration: 'none',
              letterSpacing: '0.1em',
            }}
          >
            View all →
          </Link>
        </div>

        {!jobs || jobs.length === 0 ? (
          <div
            style={{
              padding: '4rem',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Activity size={32} style={{ color: 'rgba(0,229,200,0.2)' }} />
            <div
              style={{
                marginTop: '1rem',
                fontSize: 13,
                fontFamily: '"JetBrains Mono", monospace',
                color: 'rgba(224,224,224,0.3)',
              }}
            >
              No jobs yet
            </div>
            <Link
              href="/create"
              style={{
                marginTop: '1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 20px',
                border: '1px solid rgba(0,229,200,0.3)',
                borderRadius: 7,
                fontSize: 11,
                fontFamily: '"JetBrains Mono", monospace',
                color: 'rgba(0,229,200,0.7)',
                textDecoration: 'none',
                letterSpacing: '0.06em',
                background: 'rgba(0,229,200,0.03)',
                transition: 'all 0.15s',
              }}
            >
              Create your first job →
            </Link>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid rgba(0,229,200,0.08)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,229,200,0.03)' }}>
                  {['Job ID', 'Status', 'Progress', 'Credits', 'Created'].map(h => (
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
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    style={{
                      borderBottom: '1px solid rgba(0,229,200,0.04)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = 'rgba(0,229,200,0.015)'
                    }}
                    onMouseLeave={e => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        href={`/jobs/${job.id}`}
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: 11,
                          color: 'rgba(0,212,255,0.9)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => {
                          ;(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'
                        }}
                        onMouseLeave={e => {
                          ;(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'
                        }}
                      >
                        {job.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 80,
                            height: 4,
                            borderRadius: 999,
                            background: 'rgba(0,229,200,0.08)',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: `${job.total_accounts ? (job.completed_accounts / job.total_accounts) * 100 : 0}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #00b8d9, #00e5c8)',
                              borderRadius: 999,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: 11,
                            color: 'rgba(224,224,224,0.35)',
                          }}
                        >
                          {job.completed_accounts}/{job.total_accounts}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 11,
                        color: '#00e5c8',
                      }}
                    >
                      {job.credits_charged}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 11,
                        color: 'rgba(224,224,224,0.35)',
                      }}
                    >
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
