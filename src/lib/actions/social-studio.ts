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

    // Extract text from response
    let text = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text
      }
    }

    // Parse JSON from response
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
    if (!jsonMatch) return { caption: '', hashtags: '', error: 'Failed to parse caption from AI response' }

    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error('Caption generation error:', err)
    return { caption: '', hashtags: '', error: 'Failed to generate caption — please try again' }
  }
}

// ─── Flyer Generation (Ideogram V3 + Sharp overlay + Vercel Blob) ─────────

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

async function applyTextOverlay(imageBuffer: Buffer, eventName: string): Promise<Buffer> {
  const img = sharp(imageBuffer)
  const metadata = await img.metadata()
  const w = metadata.width || 1024
  const h = metadata.height || 1024

  // Load logo
  let logoComposite: sharp.OverlayOptions[] = []
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png')
    if (fs.existsSync(logoPath)) {
      const logoSize = Math.round(w * 0.15)
      const logoBuffer = await sharp(logoPath)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .ensureAlpha(0.85)
        .toBuffer()
      logoComposite = [{ input: logoBuffer, gravity: 'southeast' }]
    }
  } catch { /* logo optional */ }

  // Escape XML special characters
  const safeEvent = eventName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  // SVG text overlays
  const topBarHeight = Math.round(h * 0.09)
  const bottomBarHeight = Math.round(h * 0.13)
  const fontSize = Math.round(w * 0.04)
  const eventFontSize = Math.round(w * 0.045)

  const svgOverlay = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <!-- Top bar: event name -->
      <rect x="0" y="0" width="${w}" height="${topBarHeight}" fill="rgba(0,0,0,0.7)" />
      <text x="${w / 2}" y="${topBarHeight * 0.65}" text-anchor="middle"
        font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="${eventFontSize}"
        fill="white">${safeEvent.toUpperCase()}</text>

      <!-- Bottom bar: CTA + contact -->
      <rect x="0" y="${h - bottomBarHeight}" width="${w}" height="${bottomBarHeight}" fill="rgba(0,0,0,0.75)" />
      <text x="${w / 2}" y="${h - bottomBarHeight + bottomBarHeight * 0.35}" text-anchor="middle"
        font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="${fontSize * 1.1}"
        fill="#D6C08A">BOOK YOUR RIDE NOW</text>
      <text x="${w / 2}" y="${h - bottomBarHeight + bottomBarHeight * 0.62}" text-anchor="middle"
        font-family="Arial,Helvetica,sans-serif" font-size="${fontSize * 0.85}"
        fill="white">(702) 666-4037</text>
      <text x="${w / 2}" y="${h - bottomBarHeight + bottomBarHeight * 0.85}" text-anchor="middle"
        font-family="Arial,Helvetica,sans-serif" font-size="${fontSize * 0.75}"
        fill="rgba(255,255,255,0.7)">americanroyaltylasvegas.com</text>
    </svg>
  `)

  return img
    .composite([
      { input: svgOverlay, top: 0, left: 0 },
      ...logoComposite,
    ])
    .png()
    .toBuffer()
}

export async function generateFlyer(eventName: string, referenceImageUrl?: string | null, customPrompt?: string | null): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin()

  const apiKey = process.env.IDEOGRAM_API_KEY
  if (!apiKey) return { urls: [], error: 'IDEOGRAM_API_KEY not configured — add it in Vercel environment variables' }

  try {
    const isRemix = !!referenceImageUrl
    const endpoint = isRemix
      ? 'https://api.ideogram.ai/v1/ideogram-v3/remix'
      : 'https://api.ideogram.ai/v1/ideogram-v3/generate'

    const prompt = customPrompt || (isRemix
      ? `${eventName} party bus promotional flyer. Las Vegas neon nightlife. Bold typography. White luxury party bus. Vibrant colors.`
      : `${eventName} party bus promotional flyer. White luxury party bus. Las Vegas Strip neon nightlife background. Bold promotional typography. Vibrant gold and neon accents.`)

    const formData = new FormData()
    formData.append('prompt', prompt)
    formData.append('num_images', '4')
    formData.append('aspect_ratio', '1x1')
    formData.append('style_type', 'DESIGN')
    formData.append('magic_prompt', 'ON')
    formData.append('rendering_speed', 'DEFAULT')

    if (isRemix) {
      formData.append('negative_prompt', 'gold bus, dark bus, black bus, misspelled text, wrong text')
      formData.append('image_weight', '75')
      // Download reference image and attach as file
      const imgRes = await fetch(referenceImageUrl!)
      if (!imgRes.ok) return { urls: [], error: 'Failed to download reference photo' }
      const imgBlob = await imgRes.blob()
      formData.append('image', imgBlob, 'reference.jpg')
    } else {
      formData.append('negative_prompt', 'dark bus, black bus, misspelled text')
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Api-Key': apiKey },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Ideogram error:', err)
      return { urls: [], error: `Ideogram API error: ${err.substring(0, 200)}` }
    }

    const data = await res.json()
    const imageUrls: string[] = []

    // Download each image, apply text overlay, upload to Vercel Blob
    for (let i = 0; i < data.data.length; i++) {
      const imgUrl = data.data[i].url
      const imgRes = await fetch(imgUrl)
      if (!imgRes.ok) continue

      let buffer: Buffer = Buffer.from(await imgRes.arrayBuffer())

      // Apply text + logo overlay via sharp
      try {
        buffer = Buffer.from(await applyTextOverlay(buffer, eventName))
      } catch (overlayErr) {
        console.error('Overlay failed, using raw image:', overlayErr)
      }

      const blob = await put(
        `social-studio/flyers/${Date.now()}-${i}.png`,
        buffer,
        { access: 'public' }
      )
      imageUrls.push(blob.url)
    }

    return { urls: imageUrls }
  } catch (err) {
    console.error('Flyer generation error:', err)
    return { urls: [], error: 'Failed to generate flyer — please try again' }
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

export interface SocialPhoto {
  id: string
  url: string
  filename: string
  tags: string | null
  created_at: string
}

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
    const blob = await put(
      `social-studio/photos/${Date.now()}-${file.name}`,
      file,
      { access: 'public' }
    )

    const photo = await prisma.socialPhoto.create({
      data: {
        url: blob.url,
        filename: file.name,
      },
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

    // Delete from Vercel Blob
    try { await del(photo.url) } catch { /* blob may already be gone */ }

    await prisma.socialPhoto.delete({ where: { id } })
    revalidatePath('/admin/social-studio')
    return {}
  } catch (err) {
    console.error('Photo delete error:', err)
    return { error: 'Failed to delete photo' }
  }
}

export async function uploadFlyerManually(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin()

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  if (file.size > 10 * 1024 * 1024) return { error: 'File too large (max 10MB)' }

  try {
    const blob = await put(
      `social-studio/flyers/${Date.now()}-${file.name}`,
      file,
      { access: 'public' }
    )
    return { url: blob.url }
  } catch (err) {
    console.error('Flyer upload error:', err)
    return { error: 'Failed to upload flyer' }
  }
}
