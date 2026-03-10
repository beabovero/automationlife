'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MatrixRain from '@/components/MatrixRain'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#000]">
        <MatrixRain opacity={0.1} />
        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="glass-card rounded-xl p-10">
            <div className="mb-4 text-5xl">✓</div>
            <div className="font-mono text-lg font-bold text-[#00e5c8] text-glow">Account Created</div>
            <p className="mt-3 text-sm text-[rgba(224,224,224,0.6)]">
              Check your email to confirm your account, then sign in.
            </p>
            <Link href="/login" className="btn-matrix-solid mt-6 inline-block px-8 py-3 rounded">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#000]">
      <MatrixRain opacity={0.1} />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="mb-2 font-mono text-2xl font-black tracking-widest text-[#00e5c8] text-glow">
            VA NIGHTMARE
          </div>
          <div className="font-mono text-xs tracking-widest text-[rgba(0,229,200,0.4)] uppercase">
            New Operator
          </div>
        </div>

        <div className="glass-card rounded-xl p-8">
          <h1 className="mb-6 font-mono text-sm font-bold tracking-widest text-white uppercase">
            Create Account
          </h1>

          {error && (
            <div className="mb-4 rounded border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-4 py-3 font-mono text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.6)] uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="agent@agency.com"
                required
                className="matrix-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.6)] uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="matrix-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,229,200,0.6)] uppercase">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="matrix-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-matrix-solid w-full mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center font-mono text-xs text-[rgba(224,224,224,0.4)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#00e5c8] hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.04)] px-4 py-3 text-center font-mono text-xs text-[rgba(251,191,36,0.7)]">
          No free trial. Contact @aidetectionkiller on Telegram for access.
        </div>
      </div>
    </div>
  )
}
