'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MatrixRain from '@/components/MatrixRain'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#000]">
      <MatrixRain opacity={0.1} />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="mb-2 font-mono text-2xl font-black tracking-widest text-[#00ff41] text-glow">
            VA NIGHTMARE
          </div>
          <div className="font-mono text-xs tracking-widest text-[rgba(0,255,65,0.4)] uppercase">
            Access Terminal
          </div>
        </div>

        <div className="glass-card rounded-xl p-8">
          <h1 className="mb-6 font-mono text-sm font-bold tracking-widest text-white uppercase">
            Sign In
          </h1>

          {error && (
            <div className="mb-4 rounded border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-4 py-3 font-mono text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,255,65,0.6)] uppercase">
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
              <label className="mb-1.5 block font-mono text-xs tracking-widest text-[rgba(0,255,65,0.6)] uppercase">
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

            <button
              type="submit"
              disabled={loading}
              className="btn-matrix-solid w-full mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center font-mono text-xs text-[rgba(224,224,224,0.4)]">
            No account?{' '}
            <Link href="/signup" className="text-[#00ff41] hover:underline">
              Create one
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center font-mono text-[10px] text-[rgba(0,255,65,0.3)]">
          Pay via crypto · @aidetectionkiller on Telegram
        </div>
      </div>
    </div>
  )
}
