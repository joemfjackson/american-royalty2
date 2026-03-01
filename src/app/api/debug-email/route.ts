import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  const hasKey = !!process.env.RESEND_API_KEY
  const keyPrefix = process.env.RESEND_API_KEY?.substring(0, 5) || 'NOT SET'

  if (!hasKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set', keyPrefix })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'admin@americanroyaltylasvegas.com',
      subject: 'Debug Test from Vercel',
      html: '<p>If you see this, Resend is working from Vercel serverless.</p>',
    })
    return NextResponse.json({ success: true, keyPrefix, result })
  } catch (error) {
    return NextResponse.json({
      error: 'Email send failed',
      keyPrefix,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
