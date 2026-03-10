import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Activity, CheckCircle2, XCircle } from 'lucide-react'
import type { Job } from '@/lib/types'

function StatusBadge({ status }: { status: Job['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: settings }, { data: jobs }, { data: accounts }] = await Promise.all([
    supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
    supabase.from('jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('accounts').select('status').eq('user_id', user.id),
  ])

  const totalAccounts = accounts?.length ?? 0
  const liveAccounts = accounts?.filter(a => a.status === 'active').length ?? 0
  const failedAccounts = accounts?.filter(a => a.status === 'failed').length ?? 0
  const activeJobs = jobs?.filter(j => j.status === 'processing' || j.status === 'queued').length ?? 0

  const stats = [
    { label: 'Credits',         value: (settings?.credits ?? 0).toFixed(0), icon: '⚡', color: '#00ff41' },
    { label: 'Total Accounts',  value: totalAccounts,                         icon: '👤', color: '#00d4ff' },
    { label: 'Live Accounts',   value: liveAccounts,                          icon: '✅', color: '#00ff41' },
    { label: 'Active Jobs',     value: activeJobs,                            icon: '⚙',  color: '#a855f7' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 font-mono text-xs text-[rgba(0,255,65,0.4)]">{user.email}</p>
        </div>
        <Link href="/create" className="btn-matrix-solid flex items-center gap-2 rounded text-sm px-5 py-2.5">
          <PlusCircle size={16} />
          New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="glass-card rounded-xl p-5">
            <div className="mb-3 text-2xl">{s.icon}</div>
            <div className="font-mono text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="mt-1 font-mono text-xs tracking-widest text-[rgba(224,224,224,0.4)] uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* No credits prompt */}
      {(settings?.credits ?? 0) === 0 && (
        <div className="mb-8 rounded-xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.04)] p-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-mono text-sm font-bold text-[#fbbf24]">No Credits</div>
              <p className="mt-0.5 text-sm text-[rgba(224,224,224,0.6)]">
                Contact <span className="text-[#fbbf24]">@aidetectionkiller</span> on Telegram to add credits via crypto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div>
        <h2 className="mb-4 font-mono text-sm font-bold tracking-widest text-[rgba(0,255,65,0.6)] uppercase">
          Recent Jobs
        </h2>
        {!jobs || jobs.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Activity size={32} className="mx-auto mb-4 text-[rgba(0,255,65,0.3)]" />
            <div className="font-mono text-sm text-[rgba(224,224,224,0.4)]">No jobs yet</div>
            <Link href="/create" className="btn-matrix mt-6 inline-block rounded px-6 py-2 text-sm">
              <span>Create your first job</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[rgba(0,255,65,0.1)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,255,65,0.1)] bg-[rgba(0,255,65,0.03)]">
                  {['Job ID', 'Status', 'Progress', 'Credits', 'Created'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-[rgba(0,255,65,0.5)] uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => (
                  <tr
                    key={job.id}
                    className={`border-b border-[rgba(0,255,65,0.06)] transition-colors hover:bg-[rgba(0,255,65,0.02)] ${
                      i % 2 === 0 ? '' : 'bg-[rgba(0,0,0,0.2)]'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${job.id}`} className="font-mono text-xs text-[#00d4ff] hover:underline">
                        {job.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-[rgba(0,255,65,0.1)]">
                          <div
                            className="h-full rounded-full bg-[#00ff41]"
                            style={{ width: `${job.total_accounts ? (job.completed_accounts / job.total_accounts) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[rgba(224,224,224,0.4)]">
                          {job.completed_accounts}/{job.total_accounts}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#00ff41]">{job.credits_charged}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.4)]">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
