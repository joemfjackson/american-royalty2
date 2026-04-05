import { NextResponse } from 'next/server'
import { publishScheduledPosts } from '@/lib/actions/social-studio'

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await publishScheduledPosts()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Cron publish error:', error)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}
