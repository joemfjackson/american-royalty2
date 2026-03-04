import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStripe, getConnectedAccountId } from '@/lib/stripe'

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
    const connectedAccountId = await getConnectedAccountId()

    const vehicleName = invoice.quote.preferredVehicle?.name || 'Luxury Vehicle'
    const description = `Deposit — ${invoice.quote.eventType} on ${invoice.quote.eventDate} (${vehicleName})`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
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
        ...(connectedAccountId ? [{
          price_data: {
            currency: 'usd' as const,
            unit_amount: 500,
            product_data: {
              name: 'Booking Fee',
              description: 'Non-refundable processing fee',
            },
          },
          quantity: 1,
        }] : []),
      ],
      ...(connectedAccountId ? {
        payment_intent_data: {
          application_fee_amount: 500,
          transfer_data: {
            destination: connectedAccountId,
          },
        },
      } : {}),
      metadata: {
        invoiceId: invoice.id,
        quoteId: invoice.quoteId,
      },
      customer_email: invoice.quote.email,
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
