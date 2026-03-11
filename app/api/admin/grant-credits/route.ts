import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // 1. Verify authenticated session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Verify admin role
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
  const newBalance = Math.max(0, currentCredits + amount)
  const action = amount < 0 ? 'Deduction' : 'Grant'

  // 4. Update credits
  const { error: e1 } = await admin
    .from('user_settings')
    .update({ credits: newBalance })
    .eq('user_id', userId)
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  // 5. Log transaction — only real columns: user_id, amount, reason, notes, account_id
  const { error: e2 } = await admin.from('credit_transactions').insert({
    user_id: userId,
    amount,
    reason: `Admin ${action.toLowerCase()} by ${user.email}`,
    notes: description || null,
  })
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  return NextResponse.json({ newBalance })
}
