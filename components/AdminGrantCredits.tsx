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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const amt = parseFloat(amount)
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
        border: '1px solid rgba(168,85,247,0.2)',
        background: '#070707',
        boxShadow: '0 0 80px rgba(168,85,247,0.15), 0 40px 80px rgba(0,0,0,0.9)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(168,85,247,0.1)',
          background: 'rgba(168,85,247,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.5)', letterSpacing: '0.2em', marginBottom: 4 }}>
              ADMIN ACTION
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>
              Grant / Deduct Credits
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(224,224,224,0.4)', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Current balance */}
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
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, color: '#00e5c8' }}>
              {currentCredits}
            </span>
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
              <label style={{ display: 'block', marginBottom: 8, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(168,85,247,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Amount (negative to deduct)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 50 or -10"
                className="matrix-input"
                required
                autoFocus
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
                placeholder="Crypto payment received"
                className="matrix-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(168,85,247,0.3)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '13px 28px', borderRadius: 8, border: 'none', fontSize: 11,
                boxShadow: loading ? 'none' : '0 0 20px rgba(168,85,247,0.3)',
              }}
            >
              {loading ? 'Processing…' : 'Apply Credits'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
