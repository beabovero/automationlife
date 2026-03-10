'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserSettings } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

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
      // Get current balance
      const { data: settings } = await supabase
        .from('user_settings')
        .select('credits')
        .eq('user_id', selectedUser)
        .single() as { data: { credits: number } | null }
      if (!settings) throw new Error('User not found')

      const newBalance = settings.credits + amt

      // Update credits
      const { error: e1 } = await supabase
        .from('user_settings')
        .update({ credits: newBalance })
        .eq('user_id', selectedUser)
      if (e1) throw e1

      // Log transaction
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

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="font-mono text-xs text-[#a855f7] border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.06)] rounded px-2 py-0.5 uppercase tracking-widest">Admin</span>
        <h1 className="font-mono text-2xl font-bold text-white">Admin Panel</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Grant credits form */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-4 font-mono text-sm font-bold text-[#a855f7]">Grant / Deduct Credits</h2>

          {error && (
            <div className="mb-4 rounded border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-4 py-3 font-mono text-xs text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded border border-[rgba(0,229,200,0.3)] bg-[rgba(0,229,200,0.06)] px-4 py-3 font-mono text-xs text-[#00e5c8]">
              <CheckCircle2 size={14} />
              {success}
            </div>
          )}

          <form onSubmit={handleGrant} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(168,85,247,0.6)] uppercase">User</label>
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
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(168,85,247,0.6)] uppercase">
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
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(168,85,247,0.6)] uppercase">Note</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Crypto payment received"
                className="matrix-input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-matrix-solid w-full rounded py-2.5 text-sm" style={{ background: '#a855f7', borderColor: '#a855f7' }}>
              {loading ? 'Processing…' : 'Apply Credits'}
            </button>
          </form>
        </div>

        {/* Users list */}
        <div>
          <h2 className="mb-4 font-mono text-xs font-bold tracking-widest text-[rgba(168,85,247,0.6)] uppercase">
            All Users ({users.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-[rgba(168,85,247,0.15)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(168,85,247,0.1)] bg-[rgba(168,85,247,0.03)]">
                  {['User ID', 'Credits', 'Accounts', 'Plan'].map(h => (
                    <th key={h} className="px-3 py-3 text-left font-mono text-[10px] tracking-widest text-[rgba(168,85,247,0.5)] uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.user_id}
                    onClick={() => setSelectedUser(u.user_id)}
                    className={`cursor-pointer border-b border-[rgba(168,85,247,0.06)] transition-colors hover:bg-[rgba(168,85,247,0.04)] ${
                      selectedUser === u.user_id ? 'bg-[rgba(168,85,247,0.08)]' : i % 2 !== 0 ? 'bg-[rgba(0,0,0,0.2)]' : ''
                    }`}
                  >
                    <td className="px-3 py-3 font-mono text-xs text-[rgba(224,224,224,0.6)]">{u.user_id.slice(0, 12)}…</td>
                    <td className="px-3 py-3 font-mono text-xs text-[#00e5c8] font-bold">{u.credits}</td>
                    <td className="px-3 py-3 font-mono text-xs text-[rgba(224,224,224,0.4)]">{u.total_accounts_created}</td>
                    <td className="px-3 py-3 font-mono text-xs text-[#a855f7]">{u.plan ?? '—'}</td>
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
