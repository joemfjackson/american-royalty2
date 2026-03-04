'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return session
}

export interface StripeConnectionInfo {
  connected: boolean
  accountId: string | null
  accountName: string | null
  accountEmail: string | null
  livemode: boolean | null
}

const STRIPE_SETTING_KEYS = [
  'stripe_connected_account_id',
  'stripe_connected_account_name',
  'stripe_connected_account_email',
  'stripe_connected_livemode',
] as const

export async function getStripeConnectionStatus(): Promise<StripeConnectionInfo> {
  await requireAdmin()

  const settings = await prisma.setting.findMany({
    where: { key: { in: [...STRIPE_SETTING_KEYS] } },
  })

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  const accountId = map['stripe_connected_account_id'] || null

  return {
    connected: !!accountId,
    accountId,
    accountName: map['stripe_connected_account_name'] || null,
    accountEmail: map['stripe_connected_account_email'] || null,
    livemode: accountId ? map['stripe_connected_livemode'] === 'true' : null,
  }
}

export async function disconnectStripeAccount(): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()

  const accountIdSetting = await prisma.setting.findUnique({
    where: { key: 'stripe_connected_account_id' },
  })

  if (!accountIdSetting) {
    return { success: false, error: 'No Stripe account is connected' }
  }

  const stripe = getStripe()
  const clientId = process.env.STRIPE_CLIENT_ID

  // Attempt to deauthorize on Stripe's side
  if (stripe && clientId) {
    try {
      await stripe.oauth.deauthorize({
        client_id: clientId,
        stripe_user_id: accountIdSetting.value,
      })
    } catch (err) {
      console.error('Stripe deauthorization failed (continuing with local disconnect):', err)
    }
  }

  // Remove all stripe connection settings from DB
  await prisma.setting.deleteMany({
    where: { key: { in: [...STRIPE_SETTING_KEYS] } },
  })

  revalidatePath('/admin/settings')
  return { success: true }
}
