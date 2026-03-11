'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, PlusCircle, List, Settings, CreditCard,
  Shield, LogOut, Zap,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/create',     label: 'New Job',      icon: PlusCircle },
  { href: '/jobs',       label: 'Jobs',         icon: List },
  { href: '/settings',   label: 'Settings',     icon: Settings },
  { href: '/credits',    label: 'Credits',      icon: CreditCard },
]

interface Props {
  credits: number
  isAdmin: boolean
}

export default function Sidebar({ credits, isAdmin }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const nav = isAdmin ? [...NAV, { href: '/admin', label: 'Admin', icon: Shield }] : NAV

  return (
    <aside
      style={{
        width: 256,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#030303',
        borderRight: '1px solid rgba(0,229,200,0.08)',
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 20px 18px',
          borderBottom: '1px solid rgba(0,229,200,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '1px solid rgba(0,229,200,0.4)',
            borderRadius: 8,
            background: 'rgba(0,229,200,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,229,200,0.25)',
            flexShrink: 0,
          }}
        >
          <Zap size={16} style={{ color: '#00e5c8' }} />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.06em',
            }}
          >
            VA NIGHTMARE
          </div>
          <div
            style={{
              fontSize: 9,
              color: 'rgba(0,229,200,0.4)',
              letterSpacing: '0.2em',
              marginTop: 2,
            }}
          >
            AUTOMATION
          </div>
        </div>
      </div>

      {/* Credits card */}
      <div
        style={{
          margin: '12px 12px',
          padding: '14px 16px',
          background: 'rgba(0,229,200,0.04)',
          border: '1px solid rgba(0,229,200,0.15)',
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: 'rgba(0,229,200,0.45)',
              letterSpacing: '0.2em',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            CREDITS
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="rgba(0,229,200,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div
          style={{
            fontSize: '2.25rem',
            fontWeight: 900,
            fontFamily: 'Inter, sans-serif',
            background: 'linear-gradient(135deg, #00b8d9, #00e5c8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}
        >
          {credits.toFixed(0)}
        </div>
        <div
          style={{
            fontSize: 9,
            color: 'rgba(224,224,224,0.25)',
            marginTop: 4,
            marginBottom: 10,
          }}
        >
          available balance
        </div>
        <div
          style={{
            height: 2,
            background: 'rgba(0,229,200,0.1)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '60%',
              height: '100%',
              background: 'linear-gradient(90deg, #00b8d9, #00e5c8)',
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: 8, overflowY: 'auto' }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: active ? '10px 14px 10px 12px' : '10px 14px',
                fontSize: 12,
                letterSpacing: '0.06em',
                textDecoration: 'none',
                borderRadius: active ? '0 6px 6px 0' : 6,
                marginBottom: 2,
                background: active ? 'rgba(0,229,200,0.08)' : 'transparent',
                borderLeft: active ? '2px solid #00e5c8' : '2px solid transparent',
                color: active ? '#00e5c8' : 'rgba(224,224,224,0.45)',
                transition: 'all 0.15s',
                fontFamily: '"JetBrains Mono", monospace',
              }}
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(0,229,200,0.03)'
                  el.style.color = 'rgba(0,229,200,0.7)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'transparent'
                  el.style.color = 'rgba(224,224,224,0.45)'
                }
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div style={{ borderTop: '1px solid rgba(0,229,200,0.08)', padding: 12 }}>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
            color: 'rgba(224,224,224,0.3)',
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.06em',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = 'rgba(239,68,68,0.7)'
            el.style.background = 'rgba(239,68,68,0.05)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = 'rgba(224,224,224,0.3)'
            el.style.background = 'transparent'
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
