import { NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Try to insert into Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!)

      const { error: dbError } = await supabase.from('contact_messages').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
      })

      if (dbError) {
        console.error('Supabase insert error:', dbError)
        // Don't fail the request
      }
    } else {
      console.log('[DEV] Contact form submission:', data)
    }

    // Optional: send email via Resend (install `resend` package to enable)
    if (process.env.RESEND_API_KEY) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Resend } = require('resend') as { Resend: new (key: string) => { emails: { send: (opts: Record<string, string>) => Promise<unknown> } } }
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.NEXT_PUBLIC_EMAIL || 'info@americanroyaltylv.com',
          subject: `Contact Form: ${data.name}`,
          html: `
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p>${data.message.replace(/\n/g, '<br />')}</p>
          `,
        })
      } catch (emailError) {
        console.error('Email notification failed (is resend installed?):', emailError)
      }
    }

    return NextResponse.json({ success: true, message: 'Message received' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 },
      )
    }

    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
