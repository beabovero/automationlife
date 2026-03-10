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
    <aside className="flex h-screen w-60 flex-col border-r border-[rgba(0,255,65,0.12)] bg-[#030303]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[rgba(0,255,65,0.12)] px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.4)]">
          <Zap size={18} className="text-[#00ff41]" />
        </div>
        <div>
          <div className="font-mono text-sm font-bold tracking-widest text-[#00ff41]">VA NIGHTMARE</div>
          <div className="font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.5)]">AUTOMATION</div>
        </div>
      </div>

      {/* Credits */}
      <div className="mx-4 my-4 rounded border border-[rgba(0,255,65,0.15)] bg-[rgba(0,255,65,0.03)] px-4 py-3">
        <div className="font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.5)] uppercase">Credits</div>
        <div className="mt-1 font-mono text-2xl font-bold text-[#00ff41]">{credits.toFixed(0)}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded px-3 py-2.5 font-mono text-sm tracking-wide transition-all
                ${active
                  ? 'bg-[rgba(0,255,65,0.08)] text-[#00ff41] border border-[rgba(0,255,65,0.2)]'
                  : 'text-[rgba(224,224,224,0.6)] hover:bg-[rgba(0,255,65,0.04)] hover:text-[#00ff41] border border-transparent'
                }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-[rgba(0,255,65,0.12)] p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded px-3 py-2.5 font-mono text-sm text-[rgba(224,224,224,0.4)] transition-all hover:text-red-400 hover:bg-[rgba(239,68,68,0.05)]"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
