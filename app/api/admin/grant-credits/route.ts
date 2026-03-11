import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // 1. Verify caller is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Verify caller is admin
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!adminRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // 3. Validate payload
  const body = await req.json()
  const { userId, amount, currentCredits, description } = body

  if (!userId || typeof amount !== 'number' || amount === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  if (typeof currentCredits !== 'number') {
    return NextResponse.json({ error: 'currentCredits missing' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // 4. Compute new balance — never go below 0
  const newBalance = Math.max(0, currentCredits + amount)
  const txType = amount < 0 ? 'deduction' : 'admin_grant'

  // 5. Update user credits
  const { error: e1 } = await admin
    .from('user_settings')
    .update({ credits: newBalance })
    .eq('user_id', userId)
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  // 6. Log transaction
  const { error: e2 } = await admin.from('credit_transactions').insert({
    user_id: userId,
    type: txType,
    amount,
    description: description || (amount < 0
      ? `Deduction by admin ${user.email}`
      : `Grant by admin ${user.email}`),
  })
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  return NextResponse.json({ newBalance })
}
