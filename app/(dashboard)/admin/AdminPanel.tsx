'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserSettings } from '@/lib/types'
import { CheckCircle2, Shield, Users } from 'lucide-react'

export default function AdminPanel({ users }: { users: UserSettings[] }) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!selectedUser || !amount) { setError('Select a user and enter amount'); return }
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt === 0) { setError('Invalid amount'); return }

    setLoading(true)
    try {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('credits')
        .eq('user_id', selectedUser)
        .single() as { data: { credits: number } | null }
      if (!settings) throw new Error('User not found')

      const newBalance = settings.credits + amt

      const { error: e1 } = await supabase
        .from('user_settings')
        .update({ credits: newBalance })
        .eq('user_id', selectedUser)
      if (e1) throw e1

      const { data: { user: adminUser } } = await supabase.auth.getUser()
      const { error: e2 } = await supabase.from('credit_transactions').insert({
        user_id: selectedUser,
        type: 'admin_grant',
        amount: amt,
        balance_after: newBalance,
        description: description || `Admin grant by ${adminUser?.email}`,
        admin_user_id: adminUser?.id ?? null,
        job_id: null,
        account_id: null,
      })
      if (e2) throw e2

      setSuccess(`${amt > 0 ? '+' : ''}${amt} credits applied. New balance: ${newBalance}`)
      setAmount('')
      setDescription('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to grant credits')
    }
    setLoading(false)
  }

  const totalCredits = users.reduce((sum, u) => sum + (u.credits ?? 0), 0)
  const totalAccounts = users.reduce((sum, u) => sum + (u.total_accounts_created ?? 0), 0)

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            padding: '3px 10px', borderRadius: 4,
            border: '1px solid rgba(168,85,247,0.35)',
            background: 'rgba(168,85,247,0.08)',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9, fontWeight: 700,
            color: '#a855f7', letterSpacing: '0.15em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Shield size={9} />
            ADMIN ACCESS
          </div>
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Admin Panel
        </h1>
      </div>

      {/* System stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#a855f7', accent: 'rgba(168,85,247,0.6)' },
          { label: 'Total Credits', value: totalCredits.toFixed(0), color: '#00e5c8', accent: '#00b8d9' },
          { label: 'Accounts Created', value: totalAccounts, color: '#00d4ff', accent: 'rgba(0,212,255,0.6)' },
        ].map(s => (
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
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: s.accent, opacity: 0.5 }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem' }}>
        {/* Grant credits form */}
        <div style={{
          borderRadius: 14, padding: '1.75rem',
          border: '1px solid rgba(168,85,247,0.15)',
          background: 'rgba(168,85,247,0.02)',
        }}>
          <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#a855f7', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Grant / Deduct Credits
          </div>

          {error && (
            <div style={{
              marginBottom: '1rem', padding: '10px 14px',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.06)',
              borderRadius: 8,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444',
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              marginBottom: '1rem', padding: '10px 14px',
              border: '1px solid rgba(0,229,200,0.3)',
              background: 'rgba(0,229,200,0.06)',
              borderRadius: 8,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#00e5c8',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCircle2 size={13} />
              {success}
            </div>
          )}

          <form onSubmit={handleGrant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                User
              </label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="matrix-select"
                required
              >
                <option value="">Select user…</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.user_id.slice(0, 8)}… · {u.credits} credits
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Amount (negative to deduct)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100"
                className="matrix-input"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Note
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Crypto payment received"
                className="matrix-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '12px 28px',
                borderRadius: 8,
                border: 'none',
                fontSize: 11,
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 0 20px rgba(168,85,247,0.3)',
              }}
            >
              {loading ? 'Processing…' : 'Apply Credits'}
            </button>
          </form>
        </div>

        {/* Users list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <Users size={12} style={{ color: 'rgba(168,85,247,0.5)' }} />
            <span style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              All Users ({users.length})
            </span>
          </div>
          <div style={{ border: '1px solid rgba(168,85,247,0.1)', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(168,85,247,0.03)' }}>
                  {['User ID', 'Credits', 'Accounts', 'Plan'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'left',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 9,
                        color: 'rgba(168,85,247,0.5)',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(168,85,247,0.08)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.user_id}
                    onClick={() => setSelectedUser(u.user_id)}
                    style={{
                      borderBottom: '1px solid rgba(168,85,247,0.05)',
                      cursor: 'pointer',
                      background: selectedUser === u.user_id ? 'rgba(168,85,247,0.08)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.55)' }}>
                      {u.user_id.slice(0, 12)}…
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700, color: '#00e5c8' }}>
                      {u.credits}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.4)' }}>
                      {u.total_accounts_created}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#a855f7' }}>
                      {u.plan ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
