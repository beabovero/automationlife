import { createClient } from '@/lib/supabase/server'
import type { CreditTransaction } from '@/lib/types'
import { Zap } from 'lucide-react'

function TxBadge({ type }: { type: CreditTransaction['type'] }) {
  const styles: Record<string, { color: string; border: string; bg: string }> = {
    purchase:    { color: '#00e5c8', border: 'rgba(0,229,200,0.3)',  bg: 'rgba(0,229,200,0.06)' },
    deduction:   { color: '#ef4444', border: 'rgba(239,68,68,0.3)',  bg: 'rgba(239,68,68,0.06)' },
    refund:      { color: '#00d4ff', border: 'rgba(0,212,255,0.3)',  bg: 'rgba(0,212,255,0.06)' },
    admin_grant: { color: '#a855f7', border: 'rgba(168,85,247,0.3)', bg: 'rgba(168,85,247,0.06)' },
  }
  const s = styles[type] ?? { color: '#e0e0e0', border: 'rgba(255,255,255,0.1)', bg: 'rgba(255,255,255,0.03)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 3,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.7rem', fontWeight: 600,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      border: `1px solid ${s.border}`,
      color: s.color, background: s.bg,
    }}>
      {type.replace('_', ' ')}
    </span>
  )
}

export default async function CreditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: settings }, { data: txs }] = await Promise.all([
    supabase.from('user_settings').select('credits, total_accounts_created, plan').eq('user_id', user.id).single(),
    supabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
  ])

  const credits = settings?.credits ?? 0

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
          CREDIT SYSTEM
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Credits &amp; Billing
        </h1>
      </div>

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {/* Main balance */}
        <div style={{
          borderRadius: 14, padding: '1.75rem',
          border: '1px solid rgba(0,229,200,0.15)',
          background: 'rgba(0,229,200,0.02)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
            <Zap size={14} style={{ color: 'rgba(0,229,200,0.3)' }} />
          </div>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Available Balance
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '3.5rem',
            letterSpacing: '-0.04em', lineHeight: 1,
            background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {credits.toFixed(0)}
          </div>
          <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', marginTop: 8 }}>
            credits · 1 credit = $1
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #00b8d9, #00e5c8)' }} />
        </div>

        {/* Total accounts */}
        <div style={{
          borderRadius: 14, padding: '1.75rem',
          border: '1px solid rgba(255,255,255,0.05)',
          background: '#000',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Accounts Created
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '3.5rem', letterSpacing: '-0.04em', lineHeight: 1, color: '#00d4ff' }}>
            {settings?.total_accounts_created ?? 0}
          </div>
          <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', marginTop: 8 }}>
            total lifetime
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, rgba(0,212,255,0.6), rgba(0,212,255,0.2))' }} />
        </div>

        {/* Plan */}
        <div style={{
          borderRadius: 14, padding: '1.75rem',
          border: '1px solid rgba(255,255,255,0.05)',
          background: '#000',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Current Plan
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em', lineHeight: 1, color: '#a855f7' }}>
            {settings?.plan ?? 'Trial'}
          </div>
          <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.3)', marginTop: 8 }}>
            active subscription
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, rgba(168,85,247,0.6), rgba(168,85,247,0.2))' }} />
        </div>
      </div>

      {/* Top-up card */}
      <div style={{
        borderRadius: 14, padding: '1.75rem 2rem',
        border: '1px solid rgba(251,191,36,0.2)',
        background: 'rgba(251,191,36,0.03)',
        marginBottom: '2rem',
        display: 'flex', gap: '2rem', alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.1em', marginBottom: 8 }}>
            ADD CREDITS
          </div>
          <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'rgba(224,224,224,0.6)', marginBottom: 12 }}>
            Contact{' '}
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>@aidetectionkiller</span>
            {' '}on Telegram to purchase credits via crypto. Credits are added manually by our team within minutes.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Trial', price: '2 credits/acct', note: 'Until Mar 15 · max 10' },
              { label: 'Monthly', price: 'As low as 0.5', note: 'Volume-based pricing' },
            ].map(t => (
              <div key={t.label} style={{
                padding: '10px 16px', borderRadius: 8,
                border: '1px solid rgba(251,191,36,0.15)',
                background: 'rgba(0,0,0,0.4)',
              }}>
                <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.08em' }}>{t.label}</div>
                <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#fff', marginTop: 2 }}>{t.price}</div>
                <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(224,224,224,0.4)', marginTop: 2 }}>{t.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Transaction History
        </div>

        {!txs || txs.length === 0 ? (
          <div style={{
            padding: '4rem',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14,
            textAlign: 'center',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: 'rgba(224,224,224,0.25)',
          }}>
            No transactions yet
          </div>
        ) : (
          <div style={{ border: '1px solid rgba(0,229,200,0.08)', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,229,200,0.03)' }}>
                  {['Date', 'Type', 'Amount', 'Balance After', 'Description'].map(h => (
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
                {txs.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(0,229,200,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.35)' }}>
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <TxBadge type={tx.type} />
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700 }}>
                      <span style={{ color: tx.amount > 0 ? '#00e5c8' : '#ef4444' }}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#fff' }}>
                      {tx.balance_after}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(224,224,224,0.45)' }}>
                      {tx.description ?? '—'}
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
