'use client'
import { useState } from 'react'
import type { UserSettings } from '@/lib/types'
import AdminGrantCredits from '@/components/AdminGrantCredits'
import { Search, CreditCard } from 'lucide-react'

interface UserWithEmail extends UserSettings {
  email?: string
}

export default function UsersClient({ users }: { users: UserWithEmail[] }) {
  const [search, setSearch] = useState('')
  const [grantTarget, setGrantTarget] = useState<UserWithEmail | null>(null)
  const [localCredits, setLocalCredits] = useState<Record<string, number>>({})

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return u.user_id.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q) || (u.plan ?? '').toLowerCase().includes(q)
  })

  const getCredits = (u: UserWithEmail) => localCredits[u.user_id] ?? u.credits

  return (
    <>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,229,200,0.4)', pointerEvents: 'none' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by user ID, email or plan…"
          className="matrix-input"
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Table */}
      <div style={{ border: '1px solid rgba(168,85,247,0.1)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(168,85,247,0.04)' }}>
              {['User ID', 'Email', 'Credits', 'Accounts', 'Plan', 'Joined', 'Actions'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                    color: 'rgba(168,85,247,0.5)', letterSpacing: '0.15em',
                    textTransform: 'uppercase', fontWeight: 600,
                    borderBottom: '1px solid rgba(168,85,247,0.08)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(168,85,247,0.05)' }}>
                <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.5)' }}>
                  {u.user_id.slice(0, 12)}…
                </td>
                <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.6)' }}>
                  {u.email ? (
                    <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{u.email}</span>
                  ) : (
                    <span style={{ color: 'rgba(224,224,224,0.2)' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700, color: '#00e5c8' }}>
                  {getCredits(u)}
                </td>
                <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.4)' }}>
                  {u.total_accounts_created}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                    color: u.plan ? '#a855f7' : 'rgba(224,224,224,0.25)',
                    letterSpacing: '0.06em',
                  }}>
                    {u.plan ?? '—'}
                  </span>
                </td>
                <td style={{ padding: '13px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.3)' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <button
                    onClick={() => setGrantTarget(u)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 6,
                      border: '1px solid rgba(168,85,247,0.3)',
                      background: 'rgba(168,85,247,0.05)',
                      fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                      color: '#a855f7', cursor: 'pointer', letterSpacing: '0.06em',
                    }}
                  >
                    <CreditCard size={10} />
                    Credits
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(224,224,224,0.25)' }}>
            No users match your search
          </div>
        )}
      </div>

      {/* Grant dialog */}
      {grantTarget && (
        <AdminGrantCredits
          userId={grantTarget.user_id}
          currentCredits={getCredits(grantTarget)}
          onClose={() => setGrantTarget(null)}
          onSuccess={newBalance => {
            setLocalCredits(prev => ({ ...prev, [grantTarget.user_id]: newBalance }))
          }}
        />
      )}
    </>
  )
}
