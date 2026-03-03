import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      typescript: true,
    })
  }

  return stripeClient
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

export function getConnectedAccountId(): string | null {
  return process.env.STRIPE_CONNECTED_ACCOUNT_ID || null
}
