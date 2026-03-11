import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'
import MatrixRain from '@/components/MatrixRain'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) redirect('/dashboard')

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#e0e0e0', position: 'relative' }}>
      <MatrixRain opacity={0.045} />
      <div className="scanlines" />
      <AdminSidebar email={user.email ?? ''} />
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  )
}
