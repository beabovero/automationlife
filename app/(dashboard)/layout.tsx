import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import MatrixRain from '@/components/MatrixRain'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Admins get their own dedicated console
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminRow) redirect('/admin/dashboard')

  const { data: settings } = await supabase
    .from('user_settings')
    .select('credits')
    .eq('user_id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#e0e0e0', position: 'relative' }}>
      <MatrixRain opacity={0.045} />
      <div className="scanlines" />
      <Sidebar credits={settings?.credits ?? 0} isAdmin={false} />
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  )
}
