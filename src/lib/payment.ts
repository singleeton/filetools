// Stripe-ready payment service
// When ready, install stripe: npm install stripe
// Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID to env

import { db } from './db'

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    dailyLimit: 20,
    maxFileSize: 50 * 1024 * 1024,
    features: ['20 conversions/day', '50 MB file size', 'All tools', 'Ads shown'],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9,
    dailyLimit: -1,
    maxFileSize: 100 * 1024 * 1024,
    features: ['Unlimited conversions', '100 MB file size', 'All tools', 'No ads', 'Priority processing'],
    // stripePriceId: process.env.STRIPE_PRICE_ID,
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPlan(planId: string) {
  return PLANS[planId as PlanId] || PLANS.free
}

export async function upgradeToPremium(userId: string): Promise<boolean> {
  // Future: verify Stripe payment here
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  // const session = await stripe.checkout.sessions.retrieve(sessionId)
  // if (session.payment_status !== 'paid') return false

  await db.user.update({
    where: { id: userId },
    data: { plan: 'premium' },
  })

  return true
}

export async function downgradeToFree(userId: string): Promise<boolean> {
  // Future: cancel Stripe subscription here

  await db.user.update({
    where: { id: userId },
    data: { plan: 'free' },
  })

  return true
}

// Future Stripe checkout endpoint:
// export async function createCheckoutSession(userId: string, priceId: string) {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
//   const session = await stripe.checkout.sessions.create({
//     mode: 'subscription',
//     payment_method_types: ['card'],
//     line_items: [{ price: priceId, quantity: 1 }],
//     success_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/profile?upgraded=true`,
//     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/pricing`,
//     metadata: { userId },
//   })
//   return session.url
// }
