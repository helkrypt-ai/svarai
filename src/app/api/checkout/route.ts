import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createCheckoutSession, type PlanId } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await request.json() as { planId: PlanId }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) return NextResponse.json({ error: 'No organization found' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
    const session = await createCheckoutSession({
      orgId: membership.org_id,
      userId: user.id,
      planId,
      successUrl: `${baseUrl}/dashboard?upgraded=true`,
      cancelUrl: `${baseUrl}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
