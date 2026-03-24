import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { invoiceId, token } = await request.json()

    if (!invoiceId || !token) {
      return NextResponse.json({ error: 'Missing invoiceId or token' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing is not configured' }, { status: 503 })
    }

    // Look up invoice and verify token
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        quote: {
          include: { preferredVehicle: { select: { name: true } } },
        },
      },
    })

    if (!invoice || invoice.token !== token) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Invoice has been cancelled' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'

    const vehicleName = invoice.quote.preferredVehicle?.name || 'Luxury Vehicle'
    const description = `Deposit — ${invoice.quote.eventType} on ${invoice.quote.eventDate} (${vehicleName})`

    // Find or create Stripe Customer to save card on file
    const existingCustomers = await stripe.customers.list({ email: invoice.quote.email, limit: 1 })
    const customer = existingCustomers.data[0] || await stripe.customers.create({
      email: invoice.quote.email,
      name: invoice.quote.name,
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(Number(invoice.depositAmount) * 100),
            product_data: {
              name: 'American Royalty — Deposit',
              description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        quoteId: invoice.quoteId,
      },
      success_url: `${siteUrl}/invoice/${token}/success`,
      cancel_url: `${siteUrl}/invoice/${token}`,
    })

    // Store the session ID on the invoice
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
