import { NextResponse } from 'next/server'
import { z } from 'zod'

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

    // Try to insert into Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!)

      const { error: dbError } = await supabase.from('quotes').insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        event_type: data.event_type,
        preferred_vehicle_id: data.preferred_vehicle || null,
        event_date: data.event_date,
        pickup_time: data.pickup_time || null,
        guest_count: data.guest_count || null,
        duration_hours: data.duration_hours || null,
        pickup_location: data.pickup_location || null,
        dropoff_location: data.dropoff_location || null,
        details: data.details || null,
        status: 'new',
      })

      if (dbError) {
        console.error('Supabase insert error:', dbError)
        // Don't fail the request — still return success so the user isn't blocked
      }
    } else {
      // Dev mode — log the quote
      console.log('[DEV] Quote submission received:', data)
    }

    // Optional: send notification email via Resend (install `resend` package to enable)
    if (process.env.RESEND_API_KEY) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Resend } = require('resend') as { Resend: new (key: string) => { emails: { send: (opts: Record<string, string>) => Promise<unknown> } } }
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.NEXT_PUBLIC_EMAIL || 'info@americanroyaltylv.com',
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
        console.error('Email notification failed (is resend installed?):', emailError)
        // Don't fail the request
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
