'use server'

export async function isStripeConfigured(): Promise<boolean> {
  return !!process.env.STRIPE_SECRET_KEY
}
