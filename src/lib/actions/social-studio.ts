'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import Anthropic from '@anthropic-ai/sdk'
import { put } from '@vercel/blob'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return session
}

// ─── Types ──────────────────────────────────────────────

export interface ContentIdea {
  priority: 'High' | 'Medium' | 'Evergreen'
  event: string
  timing: string
  platform: string
  hook: string
  caption: string
  hashtags: string
}

export interface SocialPost {
  id: string
  title: string
  caption: string
  platform: string
  image_url: string | null
  scheduled_at: string | null
  status: 'DRAFT' | 'SCHEDULED' | 'POSTED'
  created_at: string
}

function mapPost(p: {
  id: string
  title: string
  caption: string
  platform: string
  imageUrl: string | null
  scheduledAt: Date | null
  status: string
  createdAt: Date
}): SocialPost {
  return {
    id: p.id,
    title: p.title,
    caption: p.caption,
    platform: p.platform,
    image_url: p.imageUrl,
    scheduled_at: p.scheduledAt?.toISOString() || null,
    status: p.status as SocialPost['status'],
    created_at: p.createdAt.toISOString(),
  }
}

// ─── Content Ideas (Claude + Web Search) ────────────────

export async function getContentIdeas(): Promise<ContentIdea[]> {
  await requireAdmin()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
    messages: [
      {
        role: 'user',
        content: `You are a social media strategist for American Royalty Las Vegas, a luxury party bus and limo company. Search the web for:
1. Las Vegas events happening this week and next 2 weeks
2. Upcoming concerts at Allegiant Stadium 2026
3. Upcoming shows at the Sphere Las Vegas 2026
4. Las Vegas party bus trending topics

Based on your research, return exactly 6-8 ranked social media post ideas as a JSON array. Each item must have:
- priority: "High" | "Medium" | "Evergreen"
- event: the event name or topic
- timing: when to post (e.g. "Post 3 days before event", "Post this week")
- platform: best platform ("Instagram", "TikTok", "Facebook", or "All")
- hook: a short attention-grabbing first line (under 15 words)
- caption: a full social media caption (2-3 sentences, mention luxury party bus, no surge pricing, group transportation)
- hashtags: 5-8 relevant hashtags as a string

Return ONLY the JSON array, no other text. Format: [{"priority":"High","event":"...","timing":"...","platform":"...","hook":"...","caption":"...","hashtags":"..."},...]`,
      },
    ],
  })

  // Extract text from response
  let text = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      text += block.text
    }
  }

  // Parse JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Failed to parse content ideas')

  return JSON.parse(jsonMatch[0]) as ContentIdea[]
}

// ─── Caption Generation (Claude) ────────────────────────

export async function generateCaption(eventName: string, postType: string, platforms: string[]): Promise<{ caption: string; hashtags: string }> {
  await requireAdmin()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `You are the social media copywriter for American Royalty Las Vegas — a premium party bus and limo rental company.

Brand voice: Premium, confident, direct, Las Vegas VIP energy. Never cheesy or desperate.
Key selling points: No surge pricing, luxury group transportation, professional chauffeurs, party bus experience, VIP arrival.
Phone: (702) 666-4037
Website: americanroyaltylasvegas.com

Write a ${postType} social media caption for: "${eventName}"
Target platforms: ${platforms.join(', ')}

Return JSON with exactly two fields:
- caption: The full post caption (3-5 sentences, include a call to action with the phone number or website)
- hashtags: 8-12 relevant hashtags as a single string

Return ONLY the JSON object, no other text.`,
      },
    ],
  })

  let text = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      text += block.text
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse caption')

  return JSON.parse(jsonMatch[0])
}

// ─── Flyer Generation (Ideogram + Vercel Blob) ─────────

export async function generateFlyer(eventName: string): Promise<string[]> {
  await requireAdmin()

  const apiKey = process.env.IDEOGRAM_API_KEY
  if (!apiKey) throw new Error('IDEOGRAM_API_KEY not configured')

  const prompt = `Las Vegas party bus promotional flyer for ${eventName}, luxury black and gold design, neon Vegas nightlife aesthetic, white party bus vehicle, bold typography, ${eventName} text prominent, 'Book Your Ride' call to action, phone number (702) 666-4037, website americanroyaltylasvegas.com, professional marketing graphic`

  const res = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_request: {
        prompt,
        model: 'V_3',
        aspect_ratio: 'ASPECT_1_1',
        num_images: 4,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Ideogram error:', err)
    throw new Error('Failed to generate flyer')
  }

  const data = await res.json()
  const imageUrls: string[] = []

  // Download each image and upload to Vercel Blob (Ideogram URLs expire)
  for (let i = 0; i < data.data.length; i++) {
    const imgUrl = data.data[i].url
    const imgRes = await fetch(imgUrl)
    if (!imgRes.ok) continue

    const buffer = Buffer.from(await imgRes.arrayBuffer())

    // Upload to Vercel Blob
    const blob = await put(
      `social-studio/flyers/${Date.now()}-${i}.png`,
      buffer,
      { access: 'public' }
    )
    imageUrls.push(blob.url)
  }

  return imageUrls
}

// ─── CRUD for Social Posts ──────────────────────────────

export async function getSocialPosts(): Promise<SocialPost[]> {
  await requireAdmin()
  const posts = await prisma.socialPost.findMany({
    orderBy: { scheduledAt: 'asc' },
    take: 100,
  })
  return posts.map(mapPost)
}

export async function createSocialPost(data: {
  title: string
  caption: string
  platform: string
  image_url?: string | null
  scheduled_at?: string | null
  status?: 'DRAFT' | 'SCHEDULED' | 'POSTED'
}): Promise<SocialPost> {
  await requireAdmin()

  const post = await prisma.socialPost.create({
    data: {
      title: data.title,
      caption: data.caption,
      platform: data.platform,
      imageUrl: data.image_url || null,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : null,
      status: data.status || 'DRAFT',
    },
  })

  revalidatePath('/admin/social-studio')
  return mapPost(post)
}

export async function updateSocialPost(
  id: string,
  data: {
    title?: string
    caption?: string
    platform?: string
    image_url?: string | null
    scheduled_at?: string | null
    status?: 'DRAFT' | 'SCHEDULED' | 'POSTED'
  }
): Promise<SocialPost> {
  await requireAdmin()

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.caption !== undefined) updateData.caption = data.caption
  if (data.platform !== undefined) updateData.platform = data.platform
  if (data.image_url !== undefined) updateData.imageUrl = data.image_url
  if (data.scheduled_at !== undefined) updateData.scheduledAt = data.scheduled_at ? new Date(data.scheduled_at) : null
  if (data.status !== undefined) updateData.status = data.status

  const post = await prisma.socialPost.update({
    where: { id },
    data: updateData,
  })

  revalidatePath('/admin/social-studio')
  return mapPost(post)
}

export async function deleteSocialPost(id: string): Promise<void> {
  await requireAdmin()
  await prisma.socialPost.delete({ where: { id } })
  revalidatePath('/admin/social-studio')
}
