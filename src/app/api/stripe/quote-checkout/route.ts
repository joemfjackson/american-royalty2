import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { quoteToken } = await request.json()

    if (!quoteToken) {
      return NextResponse.json({ error: 'Missing quoteToken' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing is not configured' }, { status: 503 })
    }

    // Look up quote by token
    const quote = await prisma.quote.findUnique({
      where: { quoteToken },
      include: {
        preferredVehicle: { select: { name: true } },
        invoices: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (!quote.quotedAmount) {
      return NextResponse.json({ error: 'Quote has no amount set' }, { status: 400 })
    }

    if (quote.status === 'BOOKED' || quote.status === 'COMPLETED') {
      return NextResponse.json({ error: 'This quote is already booked' }, { status: 400 })
    }

    if (quote.status === 'CANCELLED') {
      return NextResponse.json({ error: 'This quote has been cancelled' }, { status: 400 })
    }

    const totalAmount = Number(quote.quotedAmount)
    const depositPercent = quote.depositPercent
    const depositAmount = Math.round(totalAmount * depositPercent / 100)

    // Check if there's already a non-cancelled invoice we can reuse
    let invoice = quote.invoices[0]

    if (invoice && invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Payment already received' }, { status: 400 })
    }

    // Create or reuse invoice
    if (!invoice) {
      // Cancel any old invoices first
      await prisma.invoice.updateMany({
        where: { quoteId: quote.id, status: { in: ['DRAFT', 'SENT', 'VIEWED'] } },
        data: { status: 'CANCELLED' },
      })

      invoice = await prisma.invoice.create({
        data: {
          quoteId: quote.id,
          totalAmount,
          depositAmount,
          depositPercent,
          status: 'SENT',
          sentAt: new Date(),
        },
      })

      // Update quote status to INVOICED
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: 'INVOICED' },
      })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'
    const vehicleName = quote.preferredVehicle?.name || 'Luxury Vehicle'
    const description = `Deposit — ${quote.eventType} on ${quote.eventDate} (${vehicleName})`

    // Find or create Stripe Customer to save card on file
    const existingCustomers = await stripe.customers.list({ email: quote.email, limit: 1 })
    const customer = existingCustomers.data[0] || await stripe.customers.create({
      email: quote.email,
      name: quote.name,
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
        quoteId: quote.id,
      },
      success_url: `${siteUrl}/quote/view/${quoteToken}/success`,
      cancel_url: `${siteUrl}/quote/view/${quoteToken}`,
    })

    // Store the session ID on the invoice
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Quote checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
