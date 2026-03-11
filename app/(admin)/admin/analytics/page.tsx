import { createAdminClient } from '@/lib/supabase/server'
import { BarChart2, TrendingUp, Lock } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const adminSupabase = await createAdminClient()

  const [{ data: users }, { data: jobs }, { data: txs }] = await Promise.all([
    adminSupabase.from('user_settings').select('credits, total_accounts_created, created_at'),
    adminSupabase.from('jobs').select('status, credits_charged, created_at, total_accounts'),
    adminSupabase.from('credit_transactions').select('amount, type, created_at'),
  ])

  const totalRevenue   = jobs?.reduce((s, j) => s + (j.credits_charged ?? 0), 0) ?? 0
  const totalAccounts  = jobs?.reduce((s, j) => s + (j.total_accounts ?? 0), 0) ?? 0
  const completedJobs  = jobs?.filter(j => j.status === 'completed' || j.status === 'partial').length ?? 0
  const successRate    = jobs?.length ? ((completedJobs / jobs.length) * 100).toFixed(0) : '0'
  const avgJobSize     = jobs?.length ? (totalAccounts / jobs.length).toFixed(1) : '0'
  const totalGranted   = txs?.filter(t => t.type === 'admin_grant').reduce((s, t) => s + Math.max(0, t.amount), 0) ?? 0

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'transparent' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.5)', letterSpacing: '0.2em', marginBottom: 6 }}>
          PERFORMANCE DATA
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Analytics
        </h1>
      </div>

      {/* Live stats bento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Revenue',   value: totalRevenue.toFixed(0),  unit: 'credits', color: '#00e5c8', gradient: true },
          { label: 'Success Rate',    value: `${successRate}%`,         unit: `${completedJobs}/${jobs?.length ?? 0} jobs`,   color: '#00d4ff', gradient: false },
          { label: 'Avg Job Size',    value: avgJobSize,                unit: 'accounts/job', color: '#a855f7', gradient: false },
          { label: 'Total Granted',   value: totalGranted.toFixed(0),  unit: 'credits issued', color: '#fbbf24', gradient: false },
          { label: 'Total Jobs Run',  value: jobs?.length ?? 0,         unit: 'all time',    color: '#e0e0e0', gradient: false },
          { label: 'Users Active',    value: users?.filter(u => (u.total_accounts_created ?? 0) > 0).length ?? 0, unit: 'created accounts', color: '#00e5c8', gradient: false },
        ].map(s => (
          <div key={s.label} style={{
            borderRadius: 14, padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.04)',
            background: '#000', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {s.label}
            </div>
            <div style={
              s.gradient
                ? { fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(135deg, #00b8d9, #00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
                : { fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.04em', lineHeight: 1, color: s.color }
            }>
              {s.value}
            </div>
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
              {s.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon banner */}
      <div style={{
        borderRadius: 16, padding: '3rem 2.5rem',
        border: '1px solid rgba(168,85,247,0.15)',
        background: 'rgba(168,85,247,0.03)',
        display: 'flex', alignItems: 'center', gap: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow bg */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{
          width: 64, height: 64, borderRadius: 16,
          border: '1px solid rgba(168,85,247,0.3)',
          background: 'rgba(168,85,247,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BarChart2 size={28} style={{ color: '#a855f7' }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              padding: '3px 10px', borderRadius: 4,
              border: '1px solid rgba(168,85,247,0.3)',
              background: 'rgba(168,85,247,0.08)',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 700,
              color: '#a855f7', letterSpacing: '0.15em',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Lock size={8} /> COMING SOON
            </div>
          </div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Advanced Analytics Dashboard
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(224,224,224,0.5)', margin: 0, lineHeight: 1.6, maxWidth: 500 }}>
            Revenue charts, account creation trends, user growth over time, job success rates by period, credit consumption heatmaps, and real-time system performance metrics.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {['Revenue over time', 'User growth chart', 'Job success rate', 'Credit heatmap'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={10} style={{ color: 'rgba(168,85,247,0.4)' }} />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.35)', letterSpacing: '0.05em' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
