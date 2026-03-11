import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verify caller is authenticated admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!adminRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, amount, currentCredits, description } = await req.json()
  if (!userId || typeof amount !== 'number' || amount === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const newBalance = currentCredits + amount

  const { error: e1 } = await admin
    .from('user_settings')
    .update({ credits: newBalance })
    .eq('user_id', userId)
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  const { error: e2 } = await admin.from('credit_transactions').insert({
    user_id: userId,
    type: 'admin_grant',
    amount,
    balance_after: newBalance,
    description: description || `Admin grant by ${user.email}`,
    admin_user_id: user.id,
    job_id: null,
    account_id: null,
  })
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  return NextResponse.json({ newBalance })
}
