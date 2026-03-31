import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { buildBookingConfirmationEmailHtml } from '@/lib/emails/booking-confirmation-email'
import { buildPackageBookingEmailHtml } from '@/lib/emails/package-booking-email'
import type Stripe from 'stripe'

async function processQuoteDepositPayment(
  invoiceId: string,
  stripePaymentId: string,
  stripeCustomerId: string | null,
  stripePaymentMethodId: string | null,
  stripe: Stripe
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })

  // Skip if already paid, cancelled, or missing
  if (!invoice || invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
    return
  }

  const quote = await prisma.quote.findUnique({
    where: { id: invoice.quoteId },
  })

  if (!quote) return

  // Prevent duplicate bookings
  const existingBooking = await prisma.booking.findFirst({ where: { quoteId: quote.id } })
  if (existingBooking) return

  const paidInFull = Number(invoice.depositAmount) >= Number(quote.quotedAmount || 0)

  // Wrap in transaction for atomicity
  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paymentMethod: 'STRIPE',
        stripePaymentId,
        paidAt: new Date(),
      },
    })

    await tx.booking.create({
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
        status: paidInFull ? 'CONFIRMED' : 'DEPOSIT_PAID',
        notes: quote.adminNotes,
        stripeCustomerId,
        stripePaymentMethod: stripePaymentMethodId,
      },
    })

    await tx.quote.update({
      where: { id: quote.id },
      data: { status: 'BOOKED' },
    })
  })

  // Send confirmation email (outside transaction — non-critical)
  if (process.env.RESEND_API_KEY) {
    try {
      const vehicle = quote.preferredVehicleId
        ? await prisma.vehicle.findUnique({ where: { id: quote.preferredVehicleId }, select: { name: true } })
        : null
      const totalAmount = Number(quote.quotedAmount || 0)
      const depositAmt = Number(invoice.depositAmount)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.americanroyaltylasvegas.com'
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
        to: [quote.email],
        subject: `Booking Confirmed — ${quote.eventType}, ${new Date(quote.eventDate + 'T00:00:00').toLocaleDateString('en-US')}`,
        html: buildBookingConfirmationEmailHtml({
          clientName: quote.name.split(' ')[0],
          eventType: quote.eventType,
          eventDate: quote.eventDate,
          pickupTime: quote.pickupTime,
          durationHours: quote.durationHours,
          vehicleName: vehicle?.name || null,
          guestCount: quote.guestCount,
          pickupLocation: quote.pickupLocation,
          dropoffLocation: quote.dropoffLocation,
          totalAmount,
          depositAmount: depositAmt,
          balanceDue: totalAmount - depositAmt,
          siteUrl,
        }),
      })
    } catch (emailError) {
      console.error('Booking confirmation email failed:', emailError)
    }
  }

  revalidatePath('/admin/quotes')
  revalidatePath('/admin/bookings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')
}

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

  // Handle legacy Checkout Session flow (backward compat for in-flight sessions)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const invoiceId = session.metadata?.invoiceId
    if (!invoiceId) {
      console.error('No invoiceId in session metadata')
      return NextResponse.json({ received: true })
    }

    try {
      const stripeCustomerId = session.customer as string | null
      let stripePaymentMethodId: string | null = null
      if (session.payment_intent && typeof session.payment_intent === 'string') {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent)
        stripePaymentMethodId = pi.payment_method as string | null
      }

      await processQuoteDepositPayment(
        invoiceId,
        session.payment_intent as string || '',
        stripeCustomerId,
        stripePaymentMethodId,
        stripe
      )
    } catch (error) {
      console.error('Webhook processing error:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  // Handle PaymentIntent events (quote deposits + package bookings)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const meta = paymentIntent.metadata

    // Quote deposit via Stripe Elements
    if (meta?.type === 'quote_deposit') {
      const invoiceId = meta.invoiceId
      if (!invoiceId) {
        console.error('No invoiceId in payment_intent metadata')
        return NextResponse.json({ received: true })
      }

      try {
        await processQuoteDepositPayment(
          invoiceId,
          paymentIntent.id,
          paymentIntent.customer as string | null,
          paymentIntent.payment_method as string | null,
          stripe
        )
      } catch (error) {
        console.error('Quote deposit webhook error:', error)
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
      }
    }

    if (meta?.type === 'package_booking') {
      try {
        // Check if already processed
        const existing = await prisma.packageBooking.findFirst({
          where: { stripePaymentId: paymentIntent.id },
        })
        if (existing) {
          return NextResponse.json({ received: true })
        }

        // Create package booking
        await prisma.packageBooking.create({
          data: {
            packageSlug: meta.packageSlug,
            packageName: meta.packageName,
            tierLabel: meta.tierLabel,
            price: parseFloat(meta.tierPrice),
            eventDate: meta.eventDate,
            eventTime: meta.eventTime,
            pickupLocation: meta.pickupLocation,
            dropoffLocation: meta.dropoffLocation || null,
            clientName: meta.clientName,
            clientEmail: meta.clientEmail,
            clientPhone: meta.clientPhone,
            specialRequests: meta.specialRequests || null,
            stripePaymentId: paymentIntent.id,
            stripeCustomerId: paymentIntent.customer as string | null,
            paymentStatus: 'paid',
          },
        })

        // Send confirmation email to customer
        if (process.env.RESEND_API_KEY) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY)
            await resend.emails.send({
              from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
              to: [meta.clientEmail],
              subject: `Booking Confirmed — ${meta.packageName}`,
              html: buildPackageBookingEmailHtml({
                clientName: meta.clientName.split(' ')[0],
                packageName: meta.packageName,
                eventDate: meta.eventDate,
                eventTime: meta.eventTime,
                tierLabel: meta.tierLabel,
                pickupLocation: meta.pickupLocation,
                price: parseFloat(meta.tierPrice),
              }),
            })

            // Admin notification
            await resend.emails.send({
              from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
              to: ['admin@americanroyaltylasvegas.com', 'dispatch@americanroyaltylasvegas.com'],
              subject: `New Package Booking — ${meta.packageName} (${meta.tierLabel})`,
              html: `<p>New package booking received:</p>
                <ul>
                  <li><strong>Package:</strong> ${meta.packageName}</li>
                  <li><strong>Party Size:</strong> ${meta.tierLabel}</li>
                  <li><strong>Date:</strong> ${meta.eventDate}</li>
                  <li><strong>Time:</strong> ${meta.eventTime}</li>
                  <li><strong>Pickup:</strong> ${meta.pickupLocation}</li>
                  <li><strong>Client:</strong> ${meta.clientName}</li>
                  <li><strong>Email:</strong> ${meta.clientEmail}</li>
                  <li><strong>Phone:</strong> ${meta.clientPhone}</li>
                  <li><strong>Amount:</strong> $${meta.tierPrice}</li>
                  ${meta.specialRequests ? `<li><strong>Requests:</strong> ${meta.specialRequests}</li>` : ''}
                </ul>`,
            })
          } catch (emailError) {
            console.error('Package booking email failed:', emailError)
          }
        }

        revalidatePath('/admin/packages')
        revalidatePath('/admin')
      } catch (error) {
        console.error('Package booking webhook error:', error)
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
