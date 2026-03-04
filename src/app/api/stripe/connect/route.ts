import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import crypto from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const clientId = process.env.STRIPE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'STRIPE_CLIENT_ID is not configured' }, { status: 503 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'
  const state = crypto.randomBytes(32).toString('hex')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'read_write',
    redirect_uri: `${siteUrl}/api/stripe/connect/callback`,
    state,
    'stripe_user[business_name]': 'American Royalty',
    'stripe_user[country]': 'US',
  })

  const url = `https://connect.stripe.com/oauth/authorize?${params.toString()}`

  const response = NextResponse.redirect(url)
  response.cookies.set('stripe_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
