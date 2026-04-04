import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { getAdminClient } from '@/lib/supabase-admin'
import { logAudit } from '@/lib/audit'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const rawBody = Buffer.from(await request.arrayBuffer())
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(rawBody, signature)
  } catch (err) {
    console.error('Stripe webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = getAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { orgId, planId } = session.metadata ?? {}
        if (!orgId || !session.subscription) break

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id

        // Fetch subscription details
        const { getStripe } = await import('@/lib/stripe')
        const stripe = getStripe()
        const sub = await stripe.subscriptions.retrieve(subscriptionId)

        await admin.from('subscriptions').upsert({
          org_id: orgId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : '',
          plan_id: planId ?? 'starter',
          status: sub.status as 'active' | 'trialing' | 'past_due' | 'cancelled',
          current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        }, { onConflict: 'stripe_subscription_id' })

        await admin.from('organizations').update({ plan_id: planId }).eq('id', orgId)

        await logAudit({
          orgId,
          action: 'subscription_created',
          entityType: 'subscription',
          entityId: subscriptionId,
          metadata: { planId },
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription & { current_period_end: number }
        const { data: existing } = await admin
          .from('subscriptions')
          .select('org_id')
          .eq('stripe_subscription_id', sub.id)
          .single()

        if (existing) {
          await admin.from('subscriptions').update({
            status: sub.status as 'active' | 'trialing' | 'past_due' | 'cancelled',
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          }).eq('stripe_subscription_id', sub.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { data: existing } = await admin
          .from('subscriptions')
          .select('org_id')
          .eq('stripe_subscription_id', sub.id)
          .single()

        if (existing) {
          await admin.from('subscriptions').update({ status: 'cancelled' }).eq('stripe_subscription_id', sub.id)
          await admin.from('organizations').update({ plan_id: null }).eq('id', existing.org_id)

          await logAudit({
            orgId: existing.org_id,
            action: 'subscription_cancelled',
            entityType: 'subscription',
            entityId: sub.id,
          })
        }
        break
      }
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
