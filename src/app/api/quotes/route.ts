import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const quoteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  event_type: z.string().min(1),
  preferred_vehicle: z.string().optional(),
  event_date: z.string().min(1),
  pickup_time: z.string().optional(),
  guest_count: z.number().optional(),
  duration_hours: z.number().optional(),
  pickup_location: z.string().optional(),
  dropoff_location: z.string().optional(),
  details: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = quoteSchema.parse(body)

    // Resolve vehicle slug to ID
    let vehicleId: string | null = null
    if (data.preferred_vehicle) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { slug: data.preferred_vehicle },
        select: { id: true },
      })
      vehicleId = vehicle?.id || null
    }

    await prisma.quote.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventType: data.event_type,
        preferredVehicleId: vehicleId,
        eventDate: data.event_date,
        pickupTime: data.pickup_time || null,
        guestCount: data.guest_count || null,
        durationHours: data.duration_hours || null,
        pickupLocation: data.pickup_location || null,
        dropoffLocation: data.dropoff_location || null,
        details: data.details || null,
        status: 'NEW',
      },
    })

    // Optional: send notification email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Resend } = require('resend') as { Resend: new (key: string) => { emails: { send: (opts: Record<string, string>) => Promise<unknown> } } }
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: [
            process.env.NEXT_PUBLIC_EMAIL || 'admin@americanroyaltylasvegas.com',
            'americanroyalty@americanroyaltylasvegas.com',
          ],
          subject: `New Quote Request: ${data.event_type} — ${data.name}`,
          html: `
            <h2>New Quote Request</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Event Type:</strong> ${data.event_type}</p>
            <p><strong>Preferred Vehicle:</strong> ${data.preferred_vehicle || 'Not specified'}</p>
            <p><strong>Event Date:</strong> ${data.event_date}</p>
            <p><strong>Pickup Time:</strong> ${data.pickup_time || 'Not specified'}</p>
            <p><strong>Guests:</strong> ${data.guest_count || 'Not specified'}</p>
            <p><strong>Duration:</strong> ${data.duration_hours ? `${data.duration_hours} hours` : 'Not specified'}</p>
            <p><strong>Pickup:</strong> ${data.pickup_location || 'Not specified'}</p>
            <p><strong>Drop-off:</strong> ${data.dropoff_location || 'Not specified'}</p>
            <p><strong>Details:</strong> ${data.details || 'None'}</p>
          `,
        })
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
      }
    }

    return NextResponse.json({ success: true, message: 'Quote request received' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 },
      )
    }

    console.error('Quote API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
