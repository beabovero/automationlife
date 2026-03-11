'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, Activity, BarChart2, Shield, LogOut, Zap } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Users',        icon: Users },
  { href: '/admin/jobs',      label: 'Job Monitor',  icon: Activity },
  { href: '/admin/analytics', label: 'Analytics',    icon: BarChart2 },
]

interface Props {
  email: string
}

export default function AdminSidebar({ email }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 256,
      flexShrink: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(3,3,3,0.92)',
      borderRight: '1px solid rgba(168,85,247,0.1)',
      fontFamily: '"JetBrains Mono", monospace',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 18px',
        borderBottom: '1px solid rgba(168,85,247,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 36, height: 36,
          border: '1px solid rgba(168,85,247,0.45)',
          borderRadius: 8,
          background: 'rgba(168,85,247,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(168,85,247,0.2)',
          flexShrink: 0,
        }}>
          <Shield size={16} style={{ color: '#a855f7' }} />
        </div>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 800,
            background: 'linear-gradient(135deg, #a855f7, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.06em',
          }}>
            VA NIGHTMARE
          </div>
          <div style={{
            fontSize: 9, color: 'rgba(168,85,247,0.5)',
            letterSpacing: '0.2em', marginTop: 2,
          }}>
            ADMIN CONSOLE
          </div>
        </div>
      </div>

      {/* Admin badge */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{
          padding: '10px 14px',
          background: 'rgba(168,85,247,0.05)',
          border: '1px solid rgba(168,85,247,0.15)',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Zap size={9} style={{ color: 'rgba(168,85,247,0.5)' }} />
            <span style={{ fontSize: 9, color: 'rgba(168,85,247,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              ACCESS LEVEL
            </span>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            background: 'linear-gradient(135deg, #a855f7, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            ROOT ADMIN
          </div>
          <div style={{ fontSize: 9, color: 'rgba(224,224,224,0.25)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: 8, overflowY: 'auto' }}>
        <div style={{ fontSize: 9, color: 'rgba(168,85,247,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '6px 14px 8px' }}>
          Navigation
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: active ? '10px 14px 10px 12px' : '10px 14px',
                fontSize: 12, letterSpacing: '0.06em',
                textDecoration: 'none', borderRadius: active ? '0 6px 6px 0' : 6,
                marginBottom: 2,
                background: active ? 'rgba(168,85,247,0.1)' : 'transparent',
                borderLeft: active ? '2px solid #a855f7' : '2px solid transparent',
                color: active ? '#a855f7' : 'rgba(224,224,224,0.4)',
                transition: 'all 0.15s',
                fontFamily: '"JetBrains Mono", monospace',
              }}
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(168,85,247,0.04)'
                  el.style.color = 'rgba(168,85,247,0.7)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'transparent'
                  el.style.color = 'rgba(224,224,224,0.4)'
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
      <div style={{ borderTop: '1px solid rgba(168,85,247,0.08)', padding: 12 }}>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
            color: 'rgba(224,224,224,0.3)', background: 'transparent',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            transition: 'all 0.2s', letterSpacing: '0.06em',
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
