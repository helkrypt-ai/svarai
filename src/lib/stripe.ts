import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return _stripe
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 199,
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    features: ['100 AI-svar/mnd', '1 e-postkonto', 'E-post support'],
  },
  pro: {
    name: 'Pro',
    price: 399,
    priceId: process.env.STRIPE_PRICE_PRO || '',
    features: ['500 AI-svar/mnd', '3 e-postkontoer', 'Prioritert support', 'Analytics'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 799,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    features: ['Ubegrenset AI-svar', 'Ubegrenset e-postkontoer', 'Dedikert support', 'API-tilgang'],
  },
} as const

export type PlanId = keyof typeof PLANS

export async function createCheckoutSession({
  orgId,
  userId,
  planId,
  successUrl,
  cancelUrl,
}: {
  orgId: string
  userId: string
  planId: PlanId
  successUrl: string
  cancelUrl: string
}) {
  const stripe = getStripe()
  const plan = PLANS[planId]

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    currency: 'nok',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    metadata: { orgId, userId, planId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

export function constructWebhookEvent(rawBody: Buffer, signature: string) {
  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
