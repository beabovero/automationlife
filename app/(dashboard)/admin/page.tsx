import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminPanel from './AdminPanel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!adminRow) redirect('/dashboard')

  // Load all users via service role
  const adminSupabase = await createAdminClient()
  const { data: users } = await adminSupabase.from('user_settings').select('*').order('created_at', { ascending: false })

  return <AdminPanel users={users ?? []} />
}
