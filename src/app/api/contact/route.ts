import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

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

    // Send notification emails via Resend (separate calls so one failure doesn't block the other)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const emailPayload = {
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
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
      }

      const recipients = [
        process.env.NEXT_PUBLIC_EMAIL || 'admin@americanroyaltylasvegas.com',
        'americanroyalty@americanroyaltylasvegas.com',
      ]

      await Promise.allSettled(
        recipients.map((to) =>
          resend.emails.send({ ...emailPayload, to }).catch((err) => {
            console.error(`Email to ${to} failed:`, err)
          })
        )
      )
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
