import Stripe from 'stripe'
import { prisma } from '@/lib/db'

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

export async function getConnectedAccountId(): Promise<string | null> {
  // Env var override for testing/explicit config
  if (process.env.STRIPE_CONNECTED_ACCOUNT_ID) {
    return process.env.STRIPE_CONNECTED_ACCOUNT_ID
  }

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'stripe_connected_account_id' },
    })
    return setting?.value || null
  } catch {
    return null
  }
}
