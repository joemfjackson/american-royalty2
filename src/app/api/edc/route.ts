import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'
import { buildEdcConfirmationEmailHtml } from '@/lib/emails/edc-confirmation-email'

const edcSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  guestCount: z.string().min(1),
  pickupLocation: z.string().optional(),
  nights: z.array(z.string()).min(1, 'Select at least one night'),
  notes: z.string().optional(),
})

const NIGHT_DATES: Record<string, string> = {
  'Night 1 — Friday May 15': '2026-05-15',
  'Night 2 — Saturday May 16': '2026-05-16',
  'Night 3 — Sunday May 17': '2026-05-17',
  'All 3 Nights (best value)': '2026-05-15',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = edcSchema.parse(body)

    // Use first selected night's date as the event date
    const firstNight = data.nights[0]
    const eventDate = NIGHT_DATES[firstNight] || '2026-05-15'

    const nightsText = data.nights.join(', ')
    const details = `Selected nights: ${nightsText}${data.notes ? `. Additional notes: ${data.notes}` : ''}`

    // Parse guest count to number
    const guestMatch = data.guestCount.match(/\d+/)
    const guestCount = guestMatch ? parseInt(guestMatch[0], 10) : null

    await prisma.quote.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventType: 'EDC 2026',
        eventDate,
        guestCount,
        pickupLocation: data.pickupLocation || null,
        details,
        status: 'NEW',
      },
    })

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Admin notification
        await resend.emails.send({
          from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
          to: ['joemfjackson@gmail.com'],
          subject: `New EDC Availability Request — ${data.name}`,
          html: `
            <h2>New EDC 2026 Transportation Request</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Group Size:</strong> ${data.guestCount}</p>
            <p><strong>Pickup Location:</strong> ${data.pickupLocation || 'Not specified'}</p>
            <p><strong>Selected Nights:</strong> ${nightsText}</p>
            <p><strong>Additional Notes:</strong> ${data.notes || 'None'}</p>
          `,
        })

        // Customer confirmation
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.americanroyaltylasvegas.com'
        await resend.emails.send({
          from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
          to: [data.email],
          subject: 'EDC 2026 Transportation — Request Received',
          html: buildEdcConfirmationEmailHtml({
            clientName: data.name.split(' ')[0],
            selectedNights: data.nights,
            guestCount: data.guestCount,
            siteUrl,
          }),
        })
      } catch (emailError) {
        console.error('EDC email notification failed:', emailError)
      }
    }

    return NextResponse.json({ success: true, message: 'EDC availability request received' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 },
      )
    }

    console.error('EDC API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
