import { createClient, createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Job } from '@/lib/types'

function StatusBadge({ status }: { status: Job['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

export default async function AdminDashboardPage() {
  const [supabase, adminSupabase] = await Promise.all([createClient(), createAdminClient()])

  const [
    { data: users },
    { data: allJobs },
    { data: txs },
  ] = await Promise.all([
    adminSupabase.from('user_settings').select('*').order('created_at', { ascending: false }),
    adminSupabase.from('jobs').select('*').order('created_at', { ascending: false }),
    adminSupabase.from('credit_transactions').select('amount, type').eq('type', 'admin_grant'),
  ])

  const totalUsers = users?.length ?? 0
  const totalCreditsInSystem = users?.reduce((s, u) => s + (u.credits ?? 0), 0) ?? 0
  const totalAccountsCreated = users?.reduce((s, u) => s + (u.total_accounts_created ?? 0), 0) ?? 0
  const totalRevenue = allJobs?.reduce((s, j) => s + (j.credits_charged ?? 0), 0) ?? 0
  const activeJobs = allJobs?.filter(j => j.status === 'processing' || j.status === 'queued').length ?? 0
  const recentJobs = allJobs?.slice(0, 8) ?? []
  const recentUsers = users?.slice(0, 5) ?? []

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const stats = [
    { label: 'Total Users',      value: totalUsers,                     color: '#a855f7',  accentFrom: 'rgba(168,85,247,0.7)', accentTo: 'rgba(168,85,247,0.2)', dot: 'rgba(168,85,247,0.8)' },
    { label: 'Credits In System', value: totalCreditsInSystem.toFixed(0), color: 'gradient', accentFrom: '#00b8d9',             accentTo: '#00e5c8',             dot: '#00e5c8' },
    { label: 'Accounts Created',  value: totalAccountsCreated,           color: '#00d4ff',  accentFrom: 'rgba(0,212,255,0.6)', accentTo: 'rgba(0,212,255,0.2)', dot: 'rgba(0,212,255,0.8)' },
    { label: 'Revenue (Credits)', value: totalRevenue.toFixed(0),        color: '#00e5c8',  accentFrom: '#00b8d9',             accentTo: '#00e5c8',             dot: '#00f5d4' },
    { label: 'Active Jobs',       value: activeJobs,                     color: '#fbbf24',  accentFrom: 'rgba(251,191,36,0.6)',accentTo: 'rgba(251,191,36,0.2)', dot: 'rgba(251,191,36,0.9)' },
  ]

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.5)', letterSpacing: '0.2em', marginBottom: 6 }}>
            SYSTEM OVERVIEW
          </div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Admin Dashboard
          </h1>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
            {dateLabel}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.05)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5c8', boxShadow: '0 0 8px #00e5c8' }} />
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(168,85,247,0.7)', letterSpacing: '0.1em' }}>
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            borderRadius: 14, padding: '1.4rem',
            border: '1px solid rgba(255,255,255,0.04)',
            background: '#000', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              width: 5, height: 5, borderRadius: '50%', background: s.dot,
            }} />
            <div style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {s.label}
            </div>
            <div style={
              s.color === 'gradient'
                ? { fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.25rem', letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(135deg, #00b8d9, #00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
                : { fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.25rem', letterSpacing: '-0.04em', lineHeight: 1, color: s.color }
            }>
              {s.value}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.accentFrom}, ${s.accentTo})` }} />
          </div>
        ))}
      </div>

      {/* Two-column: recent users + active jobs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recent users */}
        <div style={{ borderRadius: 14, border: '1px solid rgba(168,85,247,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(168,85,247,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(168,85,247,0.03)' }}>
            <span style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Recent Signups
            </span>
            <Link href="/admin/users" style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.4)', textDecoration: 'none', letterSpacing: '0.08em' }}>
              View all →
            </Link>
          </div>
          {recentUsers.map(u => (
            <div key={u.user_id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(168,85,247,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.7)' }}>
                  {u.user_id.slice(0, 12)}…
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.25)', marginTop: 2 }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700, color: '#00e5c8' }}>
                  {u.credits}
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(224,224,224,0.25)' }}>credits</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active/recent jobs */}
        <div style={{ borderRadius: 14, border: '1px solid rgba(0,229,200,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,229,200,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,229,200,0.02)' }}>
            <span style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Recent Jobs
            </span>
            <Link href="/admin/jobs" style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', textDecoration: 'none', letterSpacing: '0.08em' }}>
              View all →
            </Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {recentJobs.map(job => {
                const pct = job.total_accounts ? (job.completed_accounts / job.total_accounts) * 100 : 0
                return (
                  <tr key={job.id} style={{ borderBottom: '1px solid rgba(0,229,200,0.04)' }}>
                    <td style={{ padding: '10px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.45)' }}>
                      {job.id.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ width: 60, height: 3, borderRadius: 999, background: 'rgba(0,229,200,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #00b8d9, #00e5c8)', borderRadius: 999 }} />
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#00e5c8' }}>
                      {job.credits_charged}cr
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { href: '/admin/users', label: 'Manage Users', sub: 'Grant credits, view accounts', color: '#a855f7', border: 'rgba(168,85,247,0.15)', bg: 'rgba(168,85,247,0.03)' },
          { href: '/admin/jobs',  label: 'Job Monitor',  sub: 'All jobs across all users',    color: '#00e5c8', border: 'rgba(0,229,200,0.1)',   bg: 'rgba(0,229,200,0.02)'   },
          { href: '/admin/analytics', label: 'Analytics', sub: 'Charts and performance data', color: '#00d4ff', border: 'rgba(0,212,255,0.1)',   bg: 'rgba(0,212,255,0.02)'   },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{
            borderRadius: 12, padding: '1.25rem 1.5rem',
            border: `1px solid ${l.border}`,
            background: l.bg, textDecoration: 'none',
            display: 'block',
          }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700, color: l.color, letterSpacing: '0.06em', marginBottom: 4 }}>
              {l.label} →
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(224,224,224,0.4)' }}>
              {l.sub}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
