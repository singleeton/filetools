'use client'

import { Button } from '@/components/ui/button'
import { Check, Crown } from 'lucide-react'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import Link from 'next/link'

const plans = [
  {
    id: 'free',
    price: '$0',
    period: '/month',
    features: ['5 conversions/day (guest)', '20 conversions/day (registered)', '50 MB file size', 'All tools access', 'Ads shown'],
  },
  {
    id: 'premium',
    price: '$9',
    period: '/month',
    popular: true,
    features: ['Unlimited conversions', '100 MB file size', 'All tools access', 'No ads', 'Priority processing', 'Email support'],
  },
]

export default function PricingPage() {
  const { lang } = useDictionary()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-3 text-muted-foreground">Choose the plan that works for you</p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-8 ${plan.popular ? 'border-primary ring-1 ring-primary' : ''}`}
          >
            {plan.popular && (
              <div className="mb-4 flex items-center gap-1 text-sm font-medium text-primary">
                <Crown className="h-4 w-4" /> Most Popular
              </div>
            )}

            <h2 className="text-xl font-bold capitalize">{plan.id}</h2>
            <div className="mt-2">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {plan.id === 'free' ? (
                <Link href={`/${lang}/register`}>
                  <Button variant="outline" className="w-full">Get Started Free</Button>
                </Link>
              ) : (
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Premium payments will be available soon via Stripe. Contact us for early access.
      </p>
    </div>
  )
}
