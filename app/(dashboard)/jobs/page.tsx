import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Job } from '@/lib/types'
import { PlusCircle } from 'lucide-react'

function StatusBadge({ status }: { status: Job['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold text-white">Jobs</h1>
        <Link href="/create" className="btn-matrix-solid flex items-center gap-2 rounded text-sm px-5 py-2.5">
          <PlusCircle size={16} />
          New Job
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="glass-card rounded-xl p-16 text-center">
          <div className="font-mono text-sm text-[rgba(224,224,224,0.4)]">No jobs yet</div>
          <Link href="/create" className="btn-matrix mt-6 inline-block rounded px-6 py-2 text-sm">
            <span>Create your first job</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[rgba(0,229,200,0.1)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,229,200,0.1)] bg-[rgba(0,229,200,0.03)]">
                {['Job ID', 'Status', 'Accounts', 'Progress', 'Credits', 'Created', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-[rgba(0,229,200,0.5)] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => {
                const pct = job.total_accounts ? (job.completed_accounts / job.total_accounts) * 100 : 0
                return (
                  <tr
                    key={job.id}
                    className={`border-b border-[rgba(0,229,200,0.06)] transition-colors hover:bg-[rgba(0,229,200,0.02)] ${i % 2 !== 0 ? 'bg-[rgba(0,0,0,0.2)]' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.6)]">
                      {job.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.6)]">
                      {job.total_accounts}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-[rgba(0,229,200,0.1)]">
                          <div className="h-full rounded-full bg-[#00e5c8] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-xs text-[rgba(224,224,224,0.4)]">
                          {job.completed_accounts}/{job.total_accounts}
                        </span>
                        {job.failed_accounts > 0 && (
                          <span className="font-mono text-xs text-red-400">({job.failed_accounts} failed)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#00e5c8]">{job.credits_charged}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[rgba(224,224,224,0.4)]">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-mono text-xs text-[#00d4ff] hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
