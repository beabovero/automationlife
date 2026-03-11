import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - 7)

  const [
    { data: settings },
    { data: jobs },
    { data: events },
    { count: todayCount },
    { count: weekCount },
  ] = await Promise.all([
    supabase.from('user_settings').select('credits, total_accounts_created, plan').eq('user_id', user.id).single(),
    supabase.from('jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('account_status_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(40),
    supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active').gte('completed_at', today.toISOString()),
    supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active').gte('completed_at', weekStart.toISOString()),
  ])

  // Fetch accounts for any active jobs
  const activeJobIds = (jobs ?? []).filter(j => j.status === 'processing' || j.status === 'queued').map(j => j.id)
  let activeAccounts: { id: string; job_id: string; status: string; stage_reached: number | null; current_checkpoint: string | null }[] = []
  if (activeJobIds.length > 0) {
    const { data } = await supabase
      .from('accounts')
      .select('id, job_id, status, stage_reached, current_checkpoint')
      .in('job_id', activeJobIds)
    activeAccounts = data ?? []
  }

  return (
    <DashboardClient
      userId={user.id}
      userEmail={user.email ?? ''}
      initialCredits={settings?.credits ?? 0}
      initialTotalAccounts={settings?.total_accounts_created ?? 0}
      initialPlan={settings?.plan ?? null}
      initialJobs={jobs ?? []}
      initialEvents={events ?? []}
      initialActiveAccounts={activeAccounts}
      todayCount={todayCount ?? 0}
      weekCount={weekCount ?? 0}
    />
  )
}
