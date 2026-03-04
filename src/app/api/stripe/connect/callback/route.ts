import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'

  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.redirect(`${siteUrl}/admin/login`)
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    const params = new URLSearchParams({
      stripe_error: errorDescription || error || 'Authorization denied',
    })
    return NextResponse.redirect(`${siteUrl}/admin/settings?${params}`)
  }

  if (!code) {
    return NextResponse.redirect(
      `${siteUrl}/admin/settings?stripe_error=No authorization code received`
    )
  }

  // CSRF validation
  const storedState = request.cookies.get('stripe_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${siteUrl}/admin/settings?stripe_error=Invalid state parameter`
    )
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.redirect(
      `${siteUrl}/admin/settings?stripe_error=Stripe is not configured`
    )
  }

  try {
    const tokenResponse = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    if (!tokenResponse.stripe_user_id) {
      return NextResponse.redirect(
        `${siteUrl}/admin/settings?stripe_error=No account ID returned from Stripe`
      )
    }

    // Fetch account details for display
    const account = await stripe.accounts.retrieve(tokenResponse.stripe_user_id)

    const accountName =
      account.business_profile?.name ||
      (account.settings as { dashboard?: { display_name?: string } })?.dashboard?.display_name ||
      ''

    // Store in database atomically
    await prisma.$transaction([
      prisma.setting.upsert({
        where: { key: 'stripe_connected_account_id' },
        update: { value: tokenResponse.stripe_user_id },
        create: { key: 'stripe_connected_account_id', value: tokenResponse.stripe_user_id },
      }),
      prisma.setting.upsert({
        where: { key: 'stripe_connected_account_name' },
        update: { value: accountName },
        create: { key: 'stripe_connected_account_name', value: accountName },
      }),
      prisma.setting.upsert({
        where: { key: 'stripe_connected_account_email' },
        update: { value: account.email || '' },
        create: { key: 'stripe_connected_account_email', value: account.email || '' },
      }),
      prisma.setting.upsert({
        where: { key: 'stripe_connected_livemode' },
        update: { value: String(tokenResponse.livemode ?? false) },
        create: { key: 'stripe_connected_livemode', value: String(tokenResponse.livemode ?? false) },
      }),
    ])

    const response = NextResponse.redirect(`${siteUrl}/admin/settings?stripe_success=true`)
    response.cookies.delete('stripe_oauth_state')
    return response
  } catch (err) {
    console.error('Stripe OAuth token exchange failed:', err)
    const errorMessage = err instanceof Error ? err.message : 'Token exchange failed'
    const params = new URLSearchParams({ stripe_error: errorMessage })
    return NextResponse.redirect(`${siteUrl}/admin/settings?${params}`)
  }
}
