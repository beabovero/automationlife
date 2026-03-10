import { createClient } from '@/lib/supabase/server'
import type { CreditTransaction } from '@/lib/types'

function TxBadge({ type }: { type: CreditTransaction['type'] }) {
  const map: Record<string, string> = {
    purchase:    'text-[#00ff41] border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)]',
    deduction:   'text-red-400 border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)]',
    refund:      'text-[#00d4ff] border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.06)]',
    admin_grant: 'text-[#a855f7] border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.06)]',
  }
  return (
    <span className={`badge ${map[type] ?? ''}`}>{type.replace('_', ' ')}</span>
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

  return (
    <div className="p-8">
      <h1 className="mb-8 font-mono text-2xl font-bold text-white">Credits</h1>

      {/* Balance */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-6 sm:col-span-1">
          <div className="font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.5)] uppercase">Balance</div>
          <div className="mt-2 font-mono text-5xl font-black text-[#00ff41] text-glow">
            {(settings?.credits ?? 0).toFixed(0)}
          </div>
          <div className="mt-1 font-mono text-xs text-[rgba(224,224,224,0.4)]">credits · 1 credit = $1</div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.5)] uppercase">Total Accounts Created</div>
          <div className="mt-2 font-mono text-3xl font-black text-white">{settings?.total_accounts_created ?? 0}</div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.5)] uppercase">Plan</div>
          <div className="mt-2 font-mono text-xl font-bold text-[#a855f7]">{settings?.plan ?? 'None'}</div>
          <div className="mt-1 text-xs text-[rgba(224,224,224,0.4)]">Monthly flat fee + per-account credits</div>
        </div>
      </div>

      {/* Top up */}
      <div className="mb-8 rounded-xl border border-[rgba(0,255,65,0.15)] bg-[rgba(0,255,65,0.03)] p-6">
        <h2 className="mb-2 font-mono text-sm font-bold text-[#00ff41]">Add Credits</h2>
        <p className="mb-4 text-sm text-[rgba(224,224,224,0.6)]">
          Contact <span className="font-bold text-[#00ff41]">@aidetectionkiller</span> on Telegram to purchase credits via crypto.
          Credits are added manually by our team.
        </p>
        <div className="grid gap-3 sm:grid-cols-4 font-mono text-xs">
          {[
            ['Trial',   '≤10 accounts', '$2/account', 'One-time'],
            ['No Plan', 'Any amount',   '$5/account', 'Pay as you go'],
            ['Growth',  '100+ accts/mo','$2.50/acct', '$250/month flat'],
            ['Agency',  '500+ accts/mo','$0.50/acct', '$250/month flat'],
          ].map(([name, qty, price, note]) => (
            <div key={name} className="rounded border border-[rgba(0,255,65,0.1)] bg-[rgba(0,0,0,0.3)] p-3">
              <div className="font-bold text-white">{name}</div>
              <div className="mt-1 text-[#00ff41]">{price}</div>
              <div className="text-[rgba(224,224,224,0.4)]">{qty}</div>
              <div className="text-[rgba(0,255,65,0.4)]">{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <h2 className="mb-4 font-mono text-xs font-bold tracking-widest text-[rgba(0,255,65,0.6)] uppercase">
        Transaction History
      </h2>
      {!txs || txs.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center font-mono text-xs text-[rgba(224,224,224,0.3)]">
          No transactions yet
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[rgba(0,255,65,0.1)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,65,0.1)] bg-[rgba(0,255,65,0.03)]">
                {['Date', 'Type', 'Amount', 'Balance After', 'Description'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.5)] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txs.map((tx, i) => (
                <tr
                  key={tx.id}
                  className={`border-b border-[rgba(0,255,65,0.06)] ${i % 2 !== 0 ? 'bg-[rgba(0,0,0,0.2)]' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.4)]">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3"><TxBadge type={tx.type} /></td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className={tx.amount > 0 ? 'text-[#00ff41]' : 'text-red-400'}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white">{tx.balance_after}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.5)]">{tx.description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
