'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import Anthropic from '@anthropic-ai/sdk'
import { put, del } from '@vercel/blob'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
  return session
}

// ─── Types ──────────────────────────────────────────────

export interface ResearchEvent {
  id: string
  name: string
  venue: string
  date_start: string
  date_end: string | null
  category: string
  estimated_attendance: number
  demand_level: 'RED' | 'YELLOW' | 'GREEN'
  tourism_impact: string
  posting_urgency: string
  days_until: number
  ideogram_prompt_suggestion: string
}

export interface ResearchResult {
  researched_at: string
  month_summary: Record<string, { rating: string; note: string }>
  tourism_insights: { period: string; note: string; impact: string }[]
  events: ResearchEvent[]
  industry_post_ideas: { id: string; title: string; angle: string; best_platform: string; category: string; hook: string }[]
  trending_topics: { topic: string; relevance: string; suggested_angle: string }[]
}

export interface SocialContentItem {
  id: string
  type: string
  event_name: string | null
  venue: string | null
  event_date: string | null
  image_url: string | null
  context: string | null
  captions: string | null
  hashtags: string | null
  platform: string | null
  status: string
  created_at: string
}

// ─── AI Research ────────────────────────────────────────

const EVENT_JSON_FORMAT = `[{ "id": "slug", "name": "Event", "venue": "Venue", "date_start": "YYYY-MM-DD", "date_end": null, "category": "CONCERTS|SPORTS|EDM_FESTIVALS|CONVENTIONS|COMBAT_SPORTS|MOTORSPORTS|FREMONT_DTLV|HOLIDAYS", "estimated_attendance": 65000, "demand_level": "RED|YELLOW|GREEN", "tourism_impact": "Brief note", "posting_urgency": "POST NOW|THIS WEEK|NEXT WEEK|PLAN AHEAD", "days_until": 5, "ideogram_prompt_suggestion": "Brief flyer prompt" }]`

async function searchVenues(client: Anthropic, prompt: string): Promise<ResearchEvent[]> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      messages: [{ role: 'user', content: prompt }],
    })
    let text = ''
    for (const block of response.content) { if (block.type === 'text') text += block.text }
    const match = text.match(/\[[\s\S]*\]/)
    return match ? JSON.parse(match[0]) : []
  } catch (err) {
    console.error('Search batch error:', err)
    return []
  }
}

export async function researchEvents(): Promise<{ data?: ResearchResult; error?: string }> {
  await requireAdmin()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: 'ANTHROPIC_API_KEY not configured' }

  try {
    const client = new Anthropic({ apiKey })
    const today = new Date().toISOString().split('T')[0]

    // Run 3 searches in parallel
    const [stadiums, entertainment, conventions] = await Promise.all([
      // Call 1: Stadiums & Arenas
      searchVenues(client, `Search for upcoming events at these Las Vegas venues in the next 90 days from ${today}:
1. Allegiant Stadium Las Vegas
2. T-Mobile Arena Las Vegas
3. MGM Grand Garden Arena Las Vegas
Return a JSON array of events. Format: ${EVENT_JSON_FORMAT}
Return 5-10 events. Return ONLY the JSON array.`),

      // Call 2: Sphere & Entertainment
      searchVenues(client, `Search for upcoming events at these Las Vegas venues in the next 90 days from ${today}:
1. Sphere Las Vegas shows and residencies
2. Major casino entertainment (Colosseum at Caesars Palace, Dolby Live at Park MGM, Michelob Ultra Arena)
3. Las Vegas Motor Speedway
Return a JSON array of events. Format: ${EVENT_JSON_FORMAT}
Return 5-10 events. Return ONLY the JSON array.`),

      // Call 3: Conventions & Downtown
      searchVenues(client, `Search for upcoming events in Las Vegas in the next 90 days from ${today}:
1. Las Vegas Convention Center upcoming conventions and trade shows
2. Fremont Street Experience and downtown Las Vegas events
3. Any major Las Vegas festivals, holidays, or tourism events
Return a JSON array of events. Format: ${EVENT_JSON_FORMAT}
Return 5-10 events. Return ONLY the JSON array.`),
    ])

    const allEvents = [...stadiums, ...entertainment, ...conventions]

    // Build month summaries from events
    const monthSummary: Record<string, { rating: string; note: string }> = {}
    const months = new Set(allEvents.map(e => {
      const d = new Date(e.date_start + 'T00:00:00')
      return `${d.toLocaleString('en-US', { month: 'long' }).toLowerCase()}_${d.getFullYear()}`
    }))
    for (const m of months) {
      const count = allEvents.filter(e => {
        const d = new Date(e.date_start + 'T00:00:00')
        return `${d.toLocaleString('en-US', { month: 'long' }).toLowerCase()}_${d.getFullYear()}` === m
      }).length
      const hasRed = allEvents.some(e => {
        const d = new Date(e.date_start + 'T00:00:00')
        return `${d.toLocaleString('en-US', { month: 'long' }).toLowerCase()}_${d.getFullYear()}` === m && e.demand_level === 'RED'
      })
      monthSummary[m] = {
        rating: hasRed ? 'PEAK' : count > 5 ? 'HIGH' : count > 2 ? 'MODERATE' : 'LOW',
        note: `${count} events found`,
      }
    }

    const result: ResearchResult = {
      researched_at: new Date().toISOString(),
      month_summary: monthSummary,
      tourism_insights: [],
      events: allEvents,
      industry_post_ideas: [],
      trending_topics: [],
    }

    return { data: result }
  } catch (err) {
    console.error('Research error:', err)
    return { error: 'Research failed — please try again' }
  }
}

// ─── Caption Generation (3 angles) ─────────────────────

export async function generateCaptions(
  eventName: string, venue: string | null, platform: string[], postType: string, angle?: string
): Promise<{ captions?: { hype: string; value: string; premium: string }; error?: string }> {
  await requireAdmin()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: 'ANTHROPIC_API_KEY not configured' }

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `You write social media captions for American Royalty Las Vegas, a premium party bus and limousine service. Brand voice: confident, premium, aspirational, direct. Never use the word 'luxury' more than once. Always hint at the group experience. Key differentiators: no surge pricing, private group transportation, professional drivers, available 24/7, vehicles fit 8-40 passengers. Phone: (702) 666-4037. Website: americanroyaltylasvegas.com`,
      messages: [{
        role: 'user',
        content: `Write 3 distinct social media captions for a ${postType} post about "${eventName}"${venue ? ` at ${venue}` : ''} for ${platform.join(', ')}.${angle ? ` Angle: ${angle}` : ''}

Each caption must have a different angle:
1. HYPE — Excitement, energy, FOMO
2. VALUE — Practical, why it makes sense, no surge pricing
3. PREMIUM — Aspirational, VIP treatment, elevated experience

Include a call to action in each. Keep each under 150 words.

Return JSON: { "hype": "caption1", "value": "caption2", "premium": "caption3" }
Return ONLY the JSON.`
      }],
    })

    let text = ''
    for (const block of response.content) { if (block.type === 'text') text += block.text }
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return { error: 'Failed to parse captions' }
    return { captions: JSON.parse(match[0]) }
  } catch (err) {
    console.error('Caption error:', err)
    return { error: 'Failed to generate captions' }
  }
}

// ─── Hashtag Generation (3 groups) ──────────────────────

export async function generateHashtags(
  eventName: string, venue: string | null, platform: string[]
): Promise<{ hashtags?: { event: string[]; industry: string[]; trending: string[] }; error?: string }> {
  await requireAdmin()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: 'ANTHROPIC_API_KEY not configured' }

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Generate 20 hashtags for a social media post about "${eventName}"${venue ? ` at ${venue}` : ''} for a Las Vegas party bus company (American Royalty). Target: ${platform.join(', ')}.

Group them:
- event: 5 event-specific hashtags
- industry: 8 industry/service hashtags
- trending: 7 trending Las Vegas hashtags

Return JSON: { "event": ["#Tag1",...], "industry": ["#Tag1",...], "trending": ["#Tag1",...] }
Return ONLY the JSON.`
      }],
    })

    let text = ''
    for (const block of response.content) { if (block.type === 'text') text += block.text }
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return { error: 'Failed to parse hashtags' }
    return { hashtags: JSON.parse(match[0]) }
  } catch (err) {
    console.error('Hashtag error:', err)
    return { error: 'Failed to generate hashtags' }
  }
}

// ─── Photo Analysis ─────────────────────────────────────

export async function analyzePhoto(
  imageUrl: string, context: string | null
): Promise<{ angles?: { title: string; description: string; platform: string }[]; error?: string }> {
  await requireAdmin()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: 'ANTHROPIC_API_KEY not configured' }

  try {
    // Download image for Claude vision
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return { error: 'Failed to download image' }
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
    const base64 = imgBuffer.toString('base64')
    const mediaType = imageUrl.includes('.png') ? 'image/png' : 'image/jpeg'

    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: `You are the social media strategist for American Royalty Las Vegas, a premium party bus company.

Analyze this photo and suggest 3 distinct post angles for social media.${context ? ` Context: ${context}` : ''}

For each angle provide:
- title: Short catchy title
- description: 1-2 sentence description of the post angle
- platform: Best platform (INSTAGRAM, TIKTOK, or FACEBOOK)

Return JSON array: [{ "title": "...", "description": "...", "platform": "..." }, ...]
Return ONLY the JSON array.` },
        ],
      }],
    })

    let text = ''
    for (const block of response.content) { if (block.type === 'text') text += block.text }
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return { error: 'Failed to analyze photo' }
    return { angles: JSON.parse(match[0]) }
  } catch (err) {
    console.error('Photo analysis error:', err)
    return { error: 'Failed to analyze photo' }
  }
}

// ─── Image Upload ───────────────────────────────────────

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin()
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }
  if (file.size > 10 * 1024 * 1024) return { error: 'File too large (max 10MB)' }
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return { error: 'Invalid file type' }

  try {
    const blob = await put(`social-studio/v3/${Date.now()}-${file.name}`, file, { access: 'public' })
    return { url: blob.url }
  } catch { return { error: 'Upload failed' } }
}

// ─── Content Library CRUD ───────────────────────────────

export async function getContentLibrary(): Promise<SocialContentItem[]> {
  await requireAdmin()
  const items = await prisma.socialContent.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  return items.map(i => ({
    id: i.id, type: i.type, event_name: i.eventName, venue: i.venue,
    event_date: i.eventDate, image_url: i.imageUrl, context: i.context,
    captions: i.captions, hashtags: i.hashtags, platform: i.platform,
    status: i.status, created_at: i.createdAt.toISOString(),
  }))
}

export async function saveContent(data: {
  type?: string; event_name?: string | null; venue?: string | null; event_date?: string | null;
  image_url?: string | null; context?: string | null; captions?: string | null; hashtags?: string | null;
  platform?: string | null; status?: string;
}): Promise<SocialContentItem> {
  await requireAdmin()
  const item = await prisma.socialContent.create({
    data: {
      type: data.type || 'flyer', eventName: data.event_name || null,
      venue: data.venue || null, eventDate: data.event_date || null,
      imageUrl: data.image_url || null, context: data.context || null,
      captions: data.captions || null, hashtags: data.hashtags || null,
      platform: data.platform || null, status: data.status || 'DRAFT',
    },
  })
  revalidatePath('/admin/social-studio')
  return {
    id: item.id, type: item.type, event_name: item.eventName, venue: item.venue,
    event_date: item.eventDate, image_url: item.imageUrl, context: item.context,
    captions: item.captions, hashtags: item.hashtags, platform: item.platform,
    status: item.status, created_at: item.createdAt.toISOString(),
  }
}

export async function updateContentStatus(id: string, status: string): Promise<void> {
  await requireAdmin()
  await prisma.socialContent.update({ where: { id }, data: { status } })
  revalidatePath('/admin/social-studio')
}

export async function deleteContent(id: string): Promise<void> {
  await requireAdmin()
  const item = await prisma.socialContent.findUnique({ where: { id } })
  if (item?.imageUrl) { try { await del(item.imageUrl) } catch {} }
  await prisma.socialContent.delete({ where: { id } })
  revalidatePath('/admin/social-studio')
}
