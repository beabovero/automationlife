import { createAdminClient } from '@/lib/supabase/server'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const adminSupabase = await createAdminClient()

  // Fetch user settings + auth users in parallel
  const [{ data: users }, authResponse] = await Promise.all([
    adminSupabase.from('user_settings').select('*').order('created_at', { ascending: false }),
    adminSupabase.auth.admin.listUsers({ perPage: 1000 }),
  ])

  // Build email map from auth users
  const emailMap: Record<string, string> = {}
  authResponse.data?.users?.forEach(u => { if (u.email) emailMap[u.id] = u.email })

  const usersWithEmail = (users ?? []).map(u => ({
    ...u,
    email: emailMap[u.user_id],
  }))

  const totalCredits = usersWithEmail.reduce((s, u) => s + (u.credits ?? 0), 0)
  const totalAccounts = usersWithEmail.reduce((s, u) => s + (u.total_accounts_created ?? 0), 0)

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.5)', letterSpacing: '0.2em', marginBottom: 6 }}>
          USER MANAGEMENT
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          All Users
        </h1>
        <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.25)', marginTop: 6 }}>
          {usersWithEmail.length} registered users
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users',    value: usersWithEmail.length, color: '#a855f7' },
          { label: 'Credits System', value: totalCredits.toFixed(0), color: '#00e5c8' },
          { label: 'Accts Created',  value: totalAccounts,          color: '#00d4ff' },
        ].map(s => (
          <div key={s.label} style={{
            borderRadius: 12, padding: '1.25rem 1.5rem',
            border: '1px solid rgba(255,255,255,0.04)',
            background: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {s.label}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 22, color: s.color }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <UsersClient users={usersWithEmail} />
    </div>
  )
}
