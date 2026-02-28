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

    // Log the contact message
    console.log('[Contact Form]', {
      name: data.name,
      email: data.email,
      phone: data.phone || 'N/A',
      message: data.message.substring(0, 100),
    })

    // Send email notification via Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Resend } = require('resend') as { Resend: new (key: string) => { emails: { send: (opts: Record<string, string>) => Promise<unknown> } } }
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.NEXT_PUBLIC_EMAIL || 'admin@americanroyaltylasvegas.com',
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
        console.error('Email notification failed:', emailError)
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
