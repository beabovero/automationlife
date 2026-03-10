import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('user_settings')
    .select('credits')
    .eq('user_id', user.id)
    .single()

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="flex h-screen bg-[#000] text-[#e0e0e0]">
      <Sidebar credits={settings?.credits ?? 0} isAdmin={!!adminRow} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
