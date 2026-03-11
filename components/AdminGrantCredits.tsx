'use client'
import { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

interface Props {
  userId: string
  currentCredits: number
  onClose: () => void
  onSuccess: (newBalance: number) => void
}

export default function AdminGrantCredits({ userId, currentCredits, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const amt = parseFloat(amount)
  const isDeduction = !isNaN(amt) && amt < 0
  const previewBalance = !isNaN(amt) && amt !== 0
    ? Math.max(0, currentCredits + amt)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (isNaN(amt) || amt === 0) { setError('Enter a valid non-zero amount'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/grant-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: amt, currentCredits, description }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Operation failed')

      setSuccess(`${amt > 0 ? '+' : ''}${amt} credits · new balance: ${json.newBalance}`)
      onSuccess(json.newBalance)
      setAmount('')
      setDescription('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
    setLoading(false)
  }

  const accentColor = isDeduction ? '#ef4444' : '#a855f7'
  const accentBorder = isDeduction ? 'rgba(239,68,68,0.2)' : 'rgba(168,85,247,0.2)'
  const accentBg = isDeduction ? 'rgba(239,68,68,0.04)' : 'rgba(168,85,247,0.04)'
  const btnGradient = isDeduction
    ? 'linear-gradient(135deg, #b91c1c, #ef4444)'
    : 'linear-gradient(135deg, #7c3aed, #a855f7)'
  const btnShadow = isDeduction
    ? '0 0 20px rgba(239,68,68,0.3)'
    : '0 0 20px rgba(168,85,247,0.3)'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: 440,
        borderRadius: 16,
        border: `1px solid ${accentBorder}`,
        background: '#070707',
        boxShadow: `0 0 80px ${isDeduction ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.15)'}, 0 40px 80px rgba(0,0,0,0.9)`,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${accentBorder}`,
          background: accentBg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: `${accentColor}80`, letterSpacing: '0.2em', marginBottom: 4 }}>
              ADMIN ACTION
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>
              {isDeduction ? 'Deduct Credits' : 'Grant Credits'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(224,224,224,0.4)', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Balance row */}
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.5)',
            marginBottom: '1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(224,224,224,0.4)', letterSpacing: '0.1em' }}>
              CURRENT BALANCE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {previewBalance !== null && (
                <>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 18, color: 'rgba(224,224,224,0.25)', textDecoration: 'line-through' }}>
                    {currentCredits}
                  </span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(224,224,224,0.3)' }}>→</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, color: accentColor }}>
                    {previewBalance}
                  </span>
                </>
              )}
              {previewBalance === null && (
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, color: '#00e5c8' }}>
                  {currentCredits}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: '1rem', padding: '10px 14px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', borderRadius: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: '1rem', padding: '10px 14px', border: '1px solid rgba(0,229,200,0.3)', background: 'rgba(0,229,200,0.06)', borderRadius: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#00e5c8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={13} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: `${accentColor}99`, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Amount — use negative to deduct
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 20 or -5"
                className="matrix-input"
                required
                autoFocus
                step="any"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Note (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={isDeduction ? 'Correction / refund clawback' : 'Crypto payment received'}
                className="matrix-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(100,100,100,0.3)' : btnGradient,
                color: '#fff',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '13px 28px', borderRadius: 8, border: 'none', fontSize: 11,
                boxShadow: loading ? 'none' : btnShadow,
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {loading ? 'Processing…' : isDeduction ? `Deduct ${Math.abs(amt) || ''} Credits` : `Grant ${amt || ''} Credits`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
