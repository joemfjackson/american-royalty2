'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles,
  RefreshCw,
  Send,
  Copy,
  Trash2,
  Check,
  Image as ImageIcon,
  Calendar,
  Instagram,
  Facebook,
  Youtube,
  PenTool,
  CheckCircle,
  Clock,
  FileText,
  ArrowLeft,
  Upload,
  X,
  Camera,
  ChevronDown,
  Download,
  ArrowUpCircle,
  Palette,
  Minus,
  Plus,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  getContentIdeas,
  generateCaption,
  generateImages,
  upscaleImage,
  getSocialPosts,
  createSocialPost,
  updateSocialPost,
  deleteSocialPost,
  getSocialPhotos,
  uploadSocialPhoto,
  deleteSocialPhoto,
  uploadFlyerManually,
} from '@/lib/actions/social-studio'
import type { ContentIdea, SocialPost, SocialPhoto } from '@/lib/actions/social-studio'

type Tab = 'ideas' | 'compose' | 'queue' | 'photos'

const PLATFORM_ICONS: Record<string, typeof Instagram> = { Instagram, Facebook, Youtube, TikTok: Sparkles, All: Send }
const POST_TYPES = ['Event Promo', 'Vehicle Showcase', 'Package Promo', 'General']
const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube']
const IDEAS_STORAGE_KEY = 'ar-social-studio-ideas'
const PROMPT_HISTORY_KEY = 'ar-social-studio-prompt-history'

const STYLE_TYPES = ['AUTO', 'GENERAL', 'REALISTIC', 'DESIGN', 'FICTION']
const STYLE_PRESETS = [
  { group: 'Neon/Vegas', presets: ['NEON_NOIR', 'SPOTLIGHT_80S', 'MIAMI_NEON', 'CHROMATIC_HAZE'] },
  { group: 'Design', presets: ['GRAPHIC_NOVEL', 'BOLD_FANTASY', 'PIXEL_ART', 'STREET_ART'] },
  { group: 'Photo', presets: ['CINEMATIC', 'FASHION', 'EDITORIAL', 'ARCHITECTURE'] },
  { group: 'Artistic', presets: ['WATERCOLOR', 'OIL_PAINTING', 'SKETCH', 'COLLAGE'] },
  { group: 'Other', presets: ['MINIMALIST', 'MAXIMALIST', 'RETRO_FUTURISM', 'ANIME'] },
]
const ASPECT_RATIOS = [
  { label: '1:1', value: '1x1', desc: 'Instagram' },
  { label: '4:5', value: '4x5', desc: 'Portrait' },
  { label: '9:16', value: '9x16', desc: 'Stories' },
  { label: '16:9', value: '16x9', desc: 'YouTube' },
  { label: '4:3', value: '4x3', desc: 'Landscape' },
]
const SPEEDS = ['TURBO', 'DEFAULT', 'QUALITY']
const NUM_OPTIONS = [1, 2, 4]
const COLOR_PALETTES = [
  { name: 'Gold & Black', colors: ['#D6C08A', '#000000', '#1A1A1A', '#D4AF37', '#111111'] },
  { name: 'Neon Purple', colors: ['#6F2DBD', '#8B4FD4', '#D6C08A', '#0A0A0A', '#FF00FF'] },
  { name: 'Fire Red', colors: ['#FF4500', '#FF6347', '#D6C08A', '#0A0A0A', '#FFD700'] },
  { name: 'Ocean Blue', colors: ['#0077B6', '#00B4D8', '#D6C08A', '#0A0A0A', '#CAF0F8'] },
]

function getStoredIdeas(): { ideas: ContentIdea[]; fetchedAt: string } | null {
  if (typeof window === 'undefined') return null
  try { const r = localStorage.getItem(IDEAS_STORAGE_KEY); return r ? JSON.parse(r) : null } catch { return null }
}
function storeIdeas(ideas: ContentIdea[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify({ ideas, fetchedAt: new Date().toISOString() }))
}
function getPromptHistory(): string[] {
  if (typeof window === 'undefined') return []
  try { const r = localStorage.getItem(PROMPT_HISTORY_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function addToPromptHistory(prompt: string) {
  if (typeof window === 'undefined') return
  const h = getPromptHistory().filter(p => p !== prompt)
  h.unshift(prompt)
  localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(h.slice(0, 5)))
}
function timeAgo(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`
}

export default function SocialStudioPage() {
  const [tab, setTab] = useState<Tab>('ideas')

  // Ideas
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [ideasFetchedAt, setIdeasFetchedAt] = useState<string | null>(null)
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const [ideasError, setIdeasError] = useState<string | null>(null)

  // Compose
  const [eventName, setEventName] = useState('')
  const [postType, setPostType] = useState('Event Promo')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram'])
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [composeMessage, setComposeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Generation Studio
  const [genPrompt, setGenPrompt] = useState('')
  const [negPrompt, setNegPrompt] = useState('garage, indoor, plain background, realistic photo')
  const [showNegPrompt, setShowNegPrompt] = useState(false)
  const [magicPrompt, setMagicPrompt] = useState(true)
  const [styleType, setStyleType] = useState('DESIGN')
  const [stylePreset, setStylePreset] = useState<string | null>(null)
  const [showPresets, setShowPresets] = useState(false)
  const [aspectRatio, setAspectRatio] = useState('1x1')
  const [speed, setSpeed] = useState('DEFAULT')
  const [numImages, setNumImages] = useState(4)
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([])
  const [selectedFlyer, setSelectedFlyer] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [upscaling, setUpscaling] = useState<string | null>(null)
  const [promptHistory, setPromptHistory] = useState<string[]>([])

  // Photos
  const [photos, setPhotos] = useState<SocialPhoto[]>([])
  const [selectedRefPhoto, setSelectedRefPhoto] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingFlyer, setUploadingFlyer] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const flyerInputRef = useRef<HTMLInputElement>(null)
  const libraryPhotoInputRef = useRef<HTMLInputElement>(null)

  // Queue
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    const stored = getStoredIdeas()
    if (stored?.ideas.length) { setIdeas(stored.ideas); setIdeasFetchedAt(stored.fetchedAt) }
    setPromptHistory(getPromptHistory())
    getSocialPosts().then(setPosts).catch(() => {}).finally(() => setLoadingPosts(false))
    getSocialPhotos().then(setPhotos).catch(() => {})
  }, [])

  // Auto-update gen prompt from event name
  useEffect(() => {
    if (eventName && !genPrompt) {
      setGenPrompt(`Luxury promotional event flyer. Las Vegas neon nightlife. White party bus arriving at venue. ${eventName}. Bold graphic design. Vibrant gold and purple accents. Dark background.`)
    }
  }, [eventName]) // eslint-disable-line react-hooks/exhaustive-deps

  // Ideas handlers
  const handleRefreshIdeas = useCallback(async () => {
    setLoadingIdeas(true); setIdeasError(null)
    try {
      const r = await getContentIdeas()
      if (r.error) setIdeasError(r.error)
      else { setIdeas(r.ideas); setIdeasFetchedAt(new Date().toISOString()); storeIdeas(r.ideas) }
    } catch (e) { setIdeasError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoadingIdeas(false) }
  }, [])
  const handleClearAndRefresh = useCallback(async () => {
    setIdeas([]); setIdeasFetchedAt(null); localStorage.removeItem(IDEAS_STORAGE_KEY); await handleRefreshIdeas()
  }, [handleRefreshIdeas])
  const handleUseIdea = (idea: ContentIdea) => {
    setEventName(idea.event); setCaption(idea.caption); setHashtags(idea.hashtags)
    setSelectedPlatforms(idea.platform === 'All' ? ['Instagram', 'Facebook', 'TikTok'] : [idea.platform])
    setGenPrompt(`Luxury promotional event flyer. Las Vegas neon nightlife. White party bus arriving at venue. ${idea.event}. Bold graphic design. Vibrant gold and purple accents. Dark background.`)
    setTab('compose')
  }

  // Caption
  const handleGenerateCaption = async () => {
    if (!eventName) return; setGeneratingCaption(true); setComposeMessage(null)
    try {
      const r = await generateCaption(eventName, postType, selectedPlatforms)
      if (r.error) setComposeMessage({ type: 'error', text: r.error })
      else { setCaption(r.caption); setHashtags(r.hashtags) }
    } catch (e) { setComposeMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setGeneratingCaption(false) }
  }
  const handleCopyCaption = async () => {
    await navigator.clipboard.writeText(caption + (hashtags ? '\n\n' + hashtags : ''))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const togglePlatform = (p: string) => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  // Generation
  const handleGenerate = async () => {
    if (!genPrompt) return; setGenerating(true); setComposeMessage(null); setGeneratedUrls([]); setSelectedFlyer(null)
    addToPromptHistory(genPrompt); setPromptHistory(getPromptHistory())
    try {
      const r = await generateImages({
        prompt: genPrompt, negativePrompt: negPrompt || undefined, styleType, stylePreset: stylePreset || undefined,
        aspectRatio, numImages, magicPrompt, renderingSpeed: speed, referenceImageUrl: selectedRefPhoto,
        eventName: eventName || undefined, colorPalette: selectedColors.length ? selectedColors : undefined,
      })
      if (r.error) setComposeMessage({ type: 'error', text: r.error })
      else { setGeneratedUrls(r.urls); if (r.urls.length) setSelectedFlyer(r.urls[0]) }
    } catch (e) { setComposeMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setGenerating(false) }
  }

  const handleUpscale = async (url: string) => {
    setUpscaling(url)
    try {
      const r = await upscaleImage(url)
      if (r.error) setComposeMessage({ type: 'error', text: r.error })
      else if (r.url) {
        setGeneratedUrls(prev => prev.map(u => u === url ? r.url! : u))
        if (selectedFlyer === url) setSelectedFlyer(r.url)
      }
    } catch { setComposeMessage({ type: 'error', text: 'Upscale failed' }) }
    finally { setUpscaling(null) }
  }

  const handleDownload = (url: string) => { const a = document.createElement('a'); a.href = url; a.download = 'flyer.png'; a.click() }

  // Schedule
  const handleSchedulePost = async () => {
    if (!eventName || !caption) return; setSaving(true); setComposeMessage(null)
    try {
      const post = await createSocialPost({
        title: eventName, caption: caption + (hashtags ? '\n\n' + hashtags : ''),
        platform: selectedPlatforms.join(', '), image_url: selectedFlyer,
        scheduled_at: scheduledAt || null, status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      })
      setPosts(prev => [post, ...prev])
      setComposeMessage({ type: 'success', text: scheduledAt ? 'Post scheduled!' : 'Draft saved!' })
      setEventName(''); setCaption(''); setHashtags(''); setGeneratedUrls([]); setSelectedFlyer(null); setScheduledAt(''); setGenPrompt('')
    } catch (e) { setComposeMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  // Photos
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setUploadingPhoto(true)
    try { const fd = new FormData(); fd.append('file', f); const r = await uploadSocialPhoto(fd); if (r.photo) setPhotos(prev => [r.photo!, ...prev]) }
    catch {} finally { setUploadingPhoto(false); if (e.target) e.target.value = '' }
  }
  const handleDeletePhoto = async (id: string) => {
    const r = await deleteSocialPhoto(id); if (!r.error) { setPhotos(prev => prev.filter(p => p.id !== id)); if (photos.find(p => p.id === id)?.url === selectedRefPhoto) setSelectedRefPhoto(null) }
  }
  const handleManualFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setUploadingFlyer(true)
    try { const fd = new FormData(); fd.append('file', f); const r = await uploadFlyerManually(fd); if (r.url) { setGeneratedUrls(prev => [r.url!, ...prev]); setSelectedFlyer(r.url) } }
    catch {} finally { setUploadingFlyer(false); if (e.target) e.target.value = '' }
  }
  // Queue
  const handleMarkPosted = async (id: string) => { try { const u = await updateSocialPost(id, { status: 'POSTED' }); setPosts(prev => prev.map(p => p.id === id ? u : p)) } catch {} }
  const handleDeletePost = async (id: string) => { try { await deleteSocialPost(id); setPosts(prev => prev.filter(p => p.id !== id)) } catch {} }

  const priorityV: Record<string, 'green' | 'gold' | 'purple'> = { High: 'green', Medium: 'gold', Evergreen: 'purple' }
  const statusV: Record<string, 'gold' | 'green' | 'outline'> = { DRAFT: 'outline', SCHEDULED: 'gold', POSTED: 'green' }

  return (
    <div className="space-y-6">
      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
      <input ref={flyerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleManualFlyerUpload} />
      <input ref={libraryPhotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />

      <div>
        <h1 className="text-2xl font-bold text-white">Social Studio</h1>
        <p className="mt-1 text-sm text-gray-400">AI-powered content creation and scheduling</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="inline-flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1 min-w-full lg:flex">
          {([
            { key: 'ideas' as Tab, label: 'Ideas', icon: Sparkles },
            { key: 'compose' as Tab, label: 'Compose', icon: PenTool },
            { key: 'queue' as Tab, label: 'Queue', icon: Calendar },
            { key: 'photos' as Tab, label: 'Photos', icon: Camera },
          ]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${tab === key ? 'bg-gold/15 text-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{label}
              {key === 'queue' && posts.filter(p => p.status === 'SCHEDULED').length > 0 && <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">{posts.filter(p => p.status === 'SCHEDULED').length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ IDEAS ═══ */}
      {tab === 'ideas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-400">AI-researched content ideas based on upcoming Vegas events</p>
              {ideasFetchedAt && ideas.length > 0 && <p className="text-xs text-gray-600 mt-0.5">Last researched: {timeAgo(ideasFetchedAt)}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ideas.length > 0 && <button onClick={handleClearAndRefresh} disabled={loadingIdeas} className="text-xs text-gray-500 hover:text-gold transition-colors whitespace-nowrap">Clear &amp; Refresh</button>}
              <button onClick={handleRefreshIdeas} disabled={loadingIdeas} className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loadingIdeas ? 'animate-spin' : ''}`} />{loadingIdeas ? 'Researching...' : 'Refresh Ideas'}
              </button>
            </div>
          </div>
          {ideasError && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{ideasError}</div>}
          {ideas.length === 0 && !loadingIdeas && !ideasError && (
            <div className="rounded-xl border border-dark-border bg-dark-card p-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">Click &quot;Refresh Ideas&quot; to research trending Vegas events</p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {ideas.map((idea, i) => {
              const PI = PLATFORM_ICONS[idea.platform] || Send
              return (
                <div key={i} className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2"><Badge variant={priorityV[idea.priority] || 'outline'}>{idea.priority}</Badge><PI className="h-4 w-4 text-gray-500" /></div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">{idea.timing}</span>
                  </div>
                  <div><p className="text-sm font-semibold text-white">{idea.event}</p><p className="mt-1 text-xs text-gold/80 italic">&ldquo;{idea.hook}&rdquo;</p></div>
                  <p className="text-xs text-gray-400 line-clamp-2">{idea.caption}</p>
                  <button onClick={() => handleUseIdea(idea)} className="w-full rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-semibold text-gold transition-all hover:bg-gold/10">Use This &rarr;</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ COMPOSE ═══ */}
      {tab === 'compose' && (
        <div className="space-y-4">
          {ideas.length > 0 && <button onClick={() => setTab('ideas')} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gold transition-colors"><ArrowLeft className="h-3 w-3" /> Back to Ideas</button>}
          {composeMessage && <div className={`rounded-lg px-3 py-2 text-sm font-medium ${composeMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{composeMessage.text}</div>}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Details + Caption */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Details</p>
                <input type="text" placeholder="Event or topic name" value={eventName} onChange={e => setEventName(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                <select value={postType} onChange={e => setPostType(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none">
                  {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Platforms</p>
                  <div className="flex gap-2 flex-wrap">
                    {PLATFORMS.map(p => <button key={p} onClick={() => togglePlatform(p)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${selectedPlatforms.includes(p) ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500 hover:border-gray-600'}`}>{p}</button>)}
                  </div>
                </div>
                <button onClick={handleGenerateCaption} disabled={!eventName || generatingCaption} className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed">
                  {generatingCaption ? 'Generating...' : '✨ Generate Caption'}
                </button>
              </div>

              {/* ── GENERATION STUDIO ── */}
              <div className="rounded-xl border border-gold/20 bg-dark-card overflow-hidden shadow-[0_0_30px_rgba(111,45,189,0.08)]">
                <div className="bg-gradient-to-r from-royal/15 via-royal/5 to-gold/10 border-b border-dark-border px-3 sm:px-4 py-2.5">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold/80">Generation Studio</p>
                </div>
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {/* Prompt */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Prompt</p>
                    <textarea rows={3} value={genPrompt} onChange={e => setGenPrompt(e.target.value)} placeholder="Describe the image you want to generate..."
                      className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-xs sm:text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none" />
                  </div>

                  {/* Negative prompt */}
                  <div>
                    <button onClick={() => setShowNegPrompt(!showNegPrompt)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gold transition-colors">
                      <ChevronDown className={`h-3 w-3 transition-transform ${showNegPrompt ? 'rotate-180' : ''}`} />Negative prompt
                    </button>
                    {showNegPrompt && <textarea rows={2} value={negPrompt} onChange={e => setNegPrompt(e.target.value)} className="mt-2 w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none" />}
                  </div>

                  {/* Magic Prompt toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Magic Prompt</p>
                      <p className="text-[10px] text-gray-600">{magicPrompt ? 'AI will enhance your prompt' : 'Using exact prompt'}</p>
                    </div>
                    <button onClick={() => setMagicPrompt(!magicPrompt)} className={`relative h-6 w-11 rounded-full transition-colors ${magicPrompt ? 'bg-gold' : 'bg-gray-700'}`}>
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${magicPrompt ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Style Type */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Style Type</p>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {STYLE_TYPES.map(s => <button key={s} onClick={() => setStyleType(s)} className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${styleType === s ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500 hover:border-gray-600'}`}>{s}</button>)}
                    </div>
                  </div>

                  {/* Style Preset */}
                  <div>
                    <button onClick={() => setShowPresets(!showPresets)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gold transition-colors">
                      <ChevronDown className={`h-3 w-3 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                      Style Preset {stylePreset && <span className="text-gold/60">({stylePreset})</span>}
                    </button>
                    {showPresets && (
                      <div className="mt-2 space-y-2">
                        <button onClick={() => setStylePreset(null)} className={`w-full rounded-lg border px-3 py-2 text-xs text-left transition-all ${!stylePreset ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500 hover:border-gray-600'}`}>
                          {!stylePreset && <Check className="inline h-3 w-3 mr-1" />}No preset
                        </button>
                        {STYLE_PRESETS.map(g => (
                          <div key={g.group}>
                            <p className="text-[9px] uppercase tracking-wider text-gray-600 mb-1">{g.group}</p>
                            <div className="grid grid-cols-2 gap-1">
                              {g.presets.map(p => (
                                <button key={p} onClick={() => setStylePreset(p)} className={`rounded-lg border px-2 py-1.5 text-[10px] sm:text-[11px] text-left transition-all ${stylePreset === p ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500 hover:border-gray-600'}`}>
                                  {stylePreset === p && <Check className="inline h-3 w-3 mr-0.5" />}{p.replace(/_/g, ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Settings row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {/* Aspect Ratio */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Ratio</p>
                      <div className="flex flex-wrap gap-1">
                        {ASPECT_RATIOS.map(r => <button key={r.value} onClick={() => setAspectRatio(r.value)} title={r.desc}
                          className={`rounded border px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-medium transition-all ${aspectRatio === r.value ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-600 hover:border-gray-600'}`}>{r.label}</button>)}
                      </div>
                    </div>
                    {/* Speed */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Speed</p>
                      <div className="flex gap-1">
                        {SPEEDS.map(s => <button key={s} onClick={() => setSpeed(s)}
                          className={`rounded border px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-medium transition-all ${speed === s ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-600 hover:border-gray-600'}`}>{s[0]}{s.slice(1).toLowerCase()}</button>)}
                      </div>
                    </div>
                    {/* Num images */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Images</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setNumImages(NUM_OPTIONS[Math.max(0, NUM_OPTIONS.indexOf(numImages) - 1)])} className="rounded border border-dark-border p-1 text-gray-500 hover:border-gray-600"><Minus className="h-3 w-3" /></button>
                        <span className="text-sm font-medium text-white w-4 text-center">{numImages}</span>
                        <button onClick={() => setNumImages(NUM_OPTIONS[Math.min(NUM_OPTIONS.length - 1, NUM_OPTIONS.indexOf(numImages) + 1)])} className="rounded border border-dark-border p-1 text-gray-500 hover:border-gray-600"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <button onClick={() => setShowColorPalette(!showColorPalette)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gold transition-colors">
                      <Palette className="h-3 w-3" />Color Palette
                    </button>
                    {showColorPalette && (
                      <div className="mt-2 space-y-2">
                        {COLOR_PALETTES.map(p => (
                          <button key={p.name} onClick={() => setSelectedColors(selectedColors.join() === p.colors.join() ? [] : p.colors)}
                            className={`flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-xs transition-all ${selectedColors.join() === p.colors.join() ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500 hover:border-gray-600'}`}>
                            <div className="flex gap-0.5">{p.colors.map((c, i) => <div key={i} className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />)}</div>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reference Photo */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Style Reference (optional)</p>
                      <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gold transition-colors">
                        <Upload className="h-3 w-3" />{uploadingPhoto ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    {selectedRefPhoto && (
                      <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 mb-2">
                        <img src={selectedRefPhoto} alt="" className="h-8 w-8 rounded object-cover" />
                        <p className="text-xs text-gold flex-1">Reference selected</p>
                        <button onClick={() => setSelectedRefPhoto(null)} className="text-gray-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                    {photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {photos.slice(0, 12).map(p => (
                          <button key={p.id} onClick={() => setSelectedRefPhoto(p.url)}
                            className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedRefPhoto === p.url ? 'border-gold' : 'border-dark-border hover:border-gray-600'}`}>
                            <img src={p.url} alt={p.filename} className="h-12 w-12 sm:h-14 sm:w-14 object-cover" />
                            {selectedRefPhoto === p.url && <div className="absolute top-0.5 right-0.5 rounded-full bg-gold p-0.5"><Check className="h-2.5 w-2.5 text-black" /></div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Generate button */}
                  <button onClick={handleGenerate} disabled={!genPrompt || generating}
                    className="w-full rounded-lg bg-gold px-4 py-3.5 text-sm font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow">
                    {generating ? <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Generating... ~15s</span> : `✦ Generate ${numImages} Image${numImages > 1 ? 's' : ''}`}
                  </button>

                  {/* Upload own flyer */}
                  <button onClick={() => flyerInputRef.current?.click()} disabled={uploadingFlyer}
                    className="w-full rounded-lg border border-dark-border px-4 py-2 text-xs text-gray-500 transition-all hover:border-gray-600 hover:text-gray-400">
                    {uploadingFlyer ? 'Uploading...' : 'Or upload your own flyer'}
                  </button>

                  {/* Results grid */}
                  {generatedUrls.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Results</p>
                      <div className={`grid gap-2 ${generatedUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {generatedUrls.map((url, i) => (
                          <div key={i} className={`relative rounded-lg overflow-hidden border-2 transition-all ${selectedFlyer === url ? 'border-gold shadow-[0_0_12px_rgba(214,192,138,0.3)]' : 'border-dark-border'}`}>
                            <button onClick={() => setSelectedFlyer(url)} className="w-full">
                              <img src={url} alt={`Generated ${i + 1}`} className="w-full aspect-square object-cover" />
                            </button>
                            {selectedFlyer === url && <div className="absolute top-1.5 left-1.5 rounded-full bg-gold p-0.5"><Check className="h-3 w-3 text-black" /></div>}
                            <div className="absolute bottom-0 left-0 right-0 flex bg-black/80 p-0.5 sm:p-1">
                              <button onClick={() => handleUpscale(url)} disabled={upscaling === url} className="flex-1 rounded px-0.5 py-1 text-[8px] sm:text-[9px] text-gray-400 hover:text-gold hover:bg-white/5 transition-colors" title="Upscale">
                                {upscaling === url ? '...' : <><ArrowUpCircle className="inline h-3 w-3" /> HD</>}
                              </button>
                              <button onClick={() => handleDownload(url)} className="flex-1 rounded px-0.5 py-1 text-[8px] sm:text-[9px] text-gray-400 hover:text-gold hover:bg-white/5 transition-colors" title="Download">
                                <Download className="inline h-3 w-3" />
                              </button>
                              <button onClick={() => setSelectedFlyer(url)} className="flex-1 rounded px-0.5 py-1 text-[8px] sm:text-[9px] text-gray-400 hover:text-gold hover:bg-white/5 transition-colors" title="Use this">
                                📅 Use
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt history */}
                  {promptHistory.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-600 mb-1">Recent prompts</p>
                      <div className="flex flex-wrap gap-1">
                        {promptHistory.map((p, i) => (
                          <button key={i} onClick={() => setGenPrompt(p)} className="rounded-full border border-dark-border px-2.5 py-1 text-[10px] text-gray-500 hover:border-gold/30 hover:text-gold transition-colors truncate max-w-[200px]">{p}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Caption</p>
                  {caption && <button onClick={handleCopyCaption} className="text-xs text-gray-500 hover:text-gold transition-colors">{copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}</button>}
                </div>
                <textarea rows={6} placeholder="Caption will appear here..." value={caption} onChange={e => setCaption(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none" />
                <input type="text" placeholder="Hashtags" value={hashtags} onChange={e => setHashtags(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-xs text-gold/70 placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
              </div>

              {selectedFlyer && (
                <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
                  <img src={selectedFlyer} alt="Selected" className="w-full object-cover" />
                  {caption && <div className="p-3 border-t border-dark-border"><p className="text-xs text-gray-400 line-clamp-3">{caption}</p></div>}
                </div>
              )}

              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Schedule</p>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none" />
                <button onClick={handleSchedulePost} disabled={!eventName || !caption || saving} className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Saving...' : scheduledAt ? '📅 Schedule Post' : '💾 Save as Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ QUEUE ═══ */}
      {tab === 'queue' && (
        <div className="space-y-3">
          {loadingPosts ? <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
          : posts.length === 0 ? <div className="rounded-xl border border-dark-border bg-dark-card p-12 text-center"><Calendar className="mx-auto h-10 w-10 text-gray-600" /><p className="mt-3 text-sm text-gray-500">No posts yet.</p></div>
          : posts.map(post => (
            <div key={post.id} className="rounded-xl border border-dark-border bg-dark-card p-4">
              <div className="flex items-start gap-3">
                {post.image_url ? <img src={post.image_url} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" /> : <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/5 shrink-0"><FileText className="h-5 w-5 text-gray-600" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2"><p className="text-sm font-medium text-white line-clamp-2 leading-snug">{post.title}</p><Badge variant={statusV[post.status] || 'outline'}>{post.status}</Badge></div>
                  <p className="mt-0.5 text-xs text-gray-500">{post.platform}</p>
                  {post.scheduled_at && <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(post.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>}
                  <p className="mt-1 text-xs text-gray-400 line-clamp-1">{post.caption}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {post.status !== 'POSTED' && <button onClick={() => handleMarkPosted(post.id)} className="rounded-lg p-2 text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Mark as Posted"><CheckCircle className="h-4 w-4" /></button>}
                  <button onClick={() => handleDeletePost(post.id)} className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ PHOTOS ═══ */}
      {tab === 'photos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{photos.length} photo{photos.length !== 1 ? 's' : ''} in library</p>
            <button onClick={() => libraryPhotoInputRef.current?.click()} disabled={uploadingPhoto} className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50">
              <Upload className="h-4 w-4" />{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
          {photos.length === 0 ? <div className="rounded-xl border border-dark-border bg-dark-card p-12 text-center"><Camera className="mx-auto h-10 w-10 text-gray-600" /><p className="mt-3 text-sm text-gray-500">No photos uploaded yet</p></div>
          : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map(photo => (
              <div key={photo.id} className="group relative rounded-xl border border-dark-border bg-dark-card overflow-hidden">
                <img src={photo.url} alt={photo.filename} className="aspect-square w-full object-cover" />
                <div className="p-2"><p className="text-xs text-gray-400 truncate">{photo.filename}</p><p className="text-[10px] text-gray-600">{timeAgo(photo.created_at)}</p></div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelectedRefPhoto(photo.url); setTab('compose') }} className="rounded-lg bg-black/70 p-1.5 text-gold hover:bg-black/90 transition-colors" title="Use in Compose"><PenTool className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDeletePhoto(photo.id)} className="rounded-lg bg-black/70 p-1.5 text-red-400 hover:bg-black/90 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  )
}
