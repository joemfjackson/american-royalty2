import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getPackageBySlug } from '@/lib/packages'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { packageSlug, tierIndex, name, email, phone, date, time, pickup, requests } = body

    // Validate package and tier
    const pkg = getPackageBySlug(packageSlug)
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 400 })
    }

    if (tierIndex < 0 || tierIndex >= pkg.pricing.length) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const tier = pkg.pricing[tierIndex]
    const amount = Math.round(tier.price * 100) // cents

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Find or create Stripe Customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 })
    const customer =
      existingCustomers.data[0] ||
      (await stripe.customers.create({ email, name }))

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: 'package_booking',
        packageSlug,
        packageName: pkg.name,
        tierLabel: tier.tier,
        tierPrice: tier.price.toString(),
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        eventDate: date,
        eventTime: time,
        pickupLocation: pickup,
        specialRequests: requests || '',
      },
      description: `${pkg.name} — ${tier.tier}`,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Package payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
