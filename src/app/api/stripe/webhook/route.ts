import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const invoiceId = session.metadata?.invoiceId
    if (!invoiceId) {
      console.error('No invoiceId in session metadata')
      return NextResponse.json({ received: true })
    }

    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      })

      if (!invoice || invoice.status === 'PAID') {
        return NextResponse.json({ received: true })
      }

      // Mark invoice as paid
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paymentMethod: 'STRIPE',
          stripePaymentId: session.payment_intent as string || null,
          paidAt: new Date(),
        },
      })

      // Get the quote to create booking
      const quote = await prisma.quote.findUnique({
        where: { id: invoice.quoteId },
      })

      if (quote) {
        // Create booking
        await prisma.booking.create({
          data: {
            quoteId: quote.id,
            clientName: quote.name,
            clientEmail: quote.email,
            clientPhone: quote.phone,
            eventType: quote.eventType,
            vehicleId: quote.preferredVehicleId,
            bookingDate: quote.eventDate,
            startTime: quote.pickupTime || 'TBD',
            durationHours: quote.durationHours,
            pickupLocation: quote.pickupLocation,
            dropoffLocation: quote.dropoffLocation,
            guestCount: quote.guestCount,
            totalAmount: quote.quotedAmount,
            depositAmount: invoice.depositAmount,
            depositPaid: true,
            status: 'DEPOSIT_PAID',
            notes: quote.adminNotes,
          },
        })

        // Update quote status
        await prisma.quote.update({
          where: { id: quote.id },
          data: { status: 'BOOKED' },
        })
      }

      revalidatePath('/admin/quotes')
      revalidatePath('/admin/bookings')
      revalidatePath('/admin/calendar')
      revalidatePath('/admin')
    } catch (error) {
      console.error('Webhook processing error:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
