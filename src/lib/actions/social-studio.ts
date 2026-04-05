'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import Anthropic from '@anthropic-ai/sdk'
import { put, del } from '@vercel/blob'

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

export interface SocialPhoto {
  id: string
  url: string
  filename: string
  tags: string | null
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

export async function getContentIdeas(): Promise<{ ideas: ContentIdea[]; error?: string }> {
  await requireAdmin()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { ideas: [], error: 'ANTHROPIC_API_KEY not configured' }

  try {
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

    let text = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text
      }
    }

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return { ideas: [], error: 'Failed to parse content ideas from AI response' }

    return { ideas: JSON.parse(jsonMatch[0]) as ContentIdea[] }
  } catch (err) {
    console.error('Content ideas error:', err)
    return { ideas: [], error: 'Failed to fetch content ideas — please try again' }
  }
}

// ─── Caption Generation (Claude) ────────────────────────

export async function generateCaption(eventName: string, postType: string, platforms: string[]): Promise<{ caption: string; hashtags: string; error?: string }> {
  await requireAdmin()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { caption: '', hashtags: '', error: 'ANTHROPIC_API_KEY not configured' }

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You write social media captions for American Royalty Las Vegas, a premium party bus and limo service. Brand voice: confident, premium, direct. Always mention no surge pricing, group transportation, luxury experience. Keep captions punchy and under 150 words.',
      messages: [
        {
          role: 'user',
          content: `Write a ${postType} caption for ${platforms.join(', ')} about ${eventName}. Include a call to action to book. Phone: (702) 666-4037, website: americanroyaltylasvegas.com.

Return JSON with exactly two fields:
- caption: The full post caption
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
    if (!jsonMatch) return { caption: '', hashtags: '', error: 'Failed to parse caption from AI response' }

    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error('Caption generation error:', err)
    return { caption: '', hashtags: '', error: 'Failed to generate caption — please try again' }
  }
}

// ─── Image Upload ───────────────────────────────────────

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin()

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }
  if (file.size > 10 * 1024 * 1024) return { error: 'File too large (max 10MB)' }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return { error: 'Invalid file type. Use JPG, PNG, or WebP.' }

  try {
    const blob = await put(`social-studio/images/${Date.now()}-${file.name}`, file, { access: 'public' })
    return { url: blob.url }
  } catch (err) {
    console.error('Image upload error:', err)
    return { error: 'Failed to upload image' }
  }
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

// ─── Photo Library ──────────────────────────────────────

export async function getSocialPhotos(): Promise<SocialPhoto[]> {
  await requireAdmin()
  const photos = await prisma.socialPhoto.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return photos.map((p) => ({
    id: p.id,
    url: p.url,
    filename: p.filename,
    tags: p.tags,
    created_at: p.createdAt.toISOString(),
  }))
}

export async function uploadSocialPhoto(formData: FormData): Promise<{ photo?: SocialPhoto; error?: string }> {
  await requireAdmin()

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }
  if (file.size > 10 * 1024 * 1024) return { error: 'File too large (max 10MB)' }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return { error: 'Invalid file type. Use JPG, PNG, or WebP.' }

  try {
    const blob = await put(`social-studio/photos/${Date.now()}-${file.name}`, file, { access: 'public' })

    const photo = await prisma.socialPhoto.create({
      data: { url: blob.url, filename: file.name },
    })

    revalidatePath('/admin/social-studio')
    return {
      photo: {
        id: photo.id,
        url: photo.url,
        filename: photo.filename,
        tags: photo.tags,
        created_at: photo.createdAt.toISOString(),
      },
    }
  } catch (err) {
    console.error('Photo upload error:', err)
    return { error: 'Failed to upload photo' }
  }
}

export async function deleteSocialPhoto(id: string): Promise<{ error?: string }> {
  await requireAdmin()

  try {
    const photo = await prisma.socialPhoto.findUnique({ where: { id } })
    if (!photo) return { error: 'Photo not found' }
    try { await del(photo.url) } catch { /* blob may already be gone */ }
    await prisma.socialPhoto.delete({ where: { id } })
    revalidatePath('/admin/social-studio')
    return {}
  } catch (err) {
    console.error('Photo delete error:', err)
    return { error: 'Failed to delete photo' }
  }
}

// ─── Buffer Auto-Publishing ─────────────────────────────

export async function getBufferProfiles(): Promise<{ profiles: { id: string; service: string; formatted_username: string }[]; error?: string }> {
  await requireAdmin()

  const token = process.env.BUFFER_ACCESS_TOKEN
  if (!token) return { profiles: [], error: 'BUFFER_ACCESS_TOKEN not configured' }

  try {
    const res = await fetch('https://api.buffer.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query GetChannels {
            account {
              channels {
                id
                name
                service
                serviceId
              }
            }
          }
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Buffer API error:', err)
      return { profiles: [], error: `Buffer API error (${res.status})` }
    }

    const json = await res.json()
    const channels = json?.data?.account?.channels
    if (!channels) return { profiles: [], error: 'No channels found in Buffer response' }

    return {
      profiles: channels.map((c: { id: string; name: string; service: string }) => ({
        id: c.id,
        service: c.service,
        formatted_username: c.name,
      })),
    }
  } catch (err) {
    console.error('Buffer profiles error:', err)
    return { profiles: [], error: 'Failed to fetch Buffer profiles' }
  }
}

export async function publishScheduledPosts(): Promise<{ published: number; errors: number }> {
  const token = process.env.BUFFER_ACCESS_TOKEN
  if (!token) return { published: 0, errors: 0 }

  const profileIds = process.env.BUFFER_PROFILE_IDS
  if (!profileIds) return { published: 0, errors: 0 }

  const profiles = profileIds.split(',').map(id => id.trim())

  // Find all scheduled posts that are due
  const duePosts = await prisma.socialPost.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { lte: new Date() },
    },
  })

  let published = 0
  let errors = 0

  for (const post of duePosts) {
    try {
      const params = new URLSearchParams()
      params.append('access_token', token)
      params.append('text', post.caption)

      if (post.imageUrl) {
        params.append('media[photo]', post.imageUrl)
      }

      if (post.scheduledAt) {
        params.append('scheduled_at', Math.floor(post.scheduledAt.getTime() / 1000).toString())
      }

      for (const pid of profiles) {
        params.append('profile_ids[]', pid)
      }

      const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      if (res.ok) {
        await prisma.socialPost.update({
          where: { id: post.id },
          data: { status: 'POSTED' },
        })
        published++
      } else {
        const err = await res.text()
        console.error(`Buffer publish failed for post ${post.id}:`, err)
        errors++
      }
    } catch (err) {
      console.error(`Buffer publish error for post ${post.id}:`, err)
      errors++
    }
  }

  return { published, errors }
}
