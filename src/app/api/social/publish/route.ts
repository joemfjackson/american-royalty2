import { NextResponse } from 'next/server'
import { publishScheduledPosts } from '@/lib/actions/social-studio'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  // If CRON_SECRET is configured, validate the request
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Cron auth failed — invalid or missing authorization header')
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const result = await publishScheduledPosts()
    console.log('Cron publish result:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Cron publish error:', error)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}
