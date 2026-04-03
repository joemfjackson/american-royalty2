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
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  getContentIdeas,
  generateCaption,
  generateFlyer,
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

const PLATFORM_ICONS: Record<string, typeof Instagram> = {
  Instagram,
  Facebook,
  Youtube,
  TikTok: Sparkles,
  All: Send,
}

const POST_TYPES = ['Event Promo', 'Vehicle Showcase', 'Package Promo', 'General']
const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube']

const IDEAS_STORAGE_KEY = 'ar-social-studio-ideas'

function getStoredIdeas(): { ideas: ContentIdea[]; fetchedAt: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(IDEAS_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function storeIdeas(ideas: ContentIdea[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify({ ideas, fetchedAt: new Date().toISOString() }))
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function SocialStudioPage() {
  const [tab, setTab] = useState<Tab>('ideas')

  // Ideas state
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [ideasFetchedAt, setIdeasFetchedAt] = useState<string | null>(null)
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const [ideasError, setIdeasError] = useState<string | null>(null)

  // Compose state
  const [eventName, setEventName] = useState('')
  const [postType, setPostType] = useState('Event Promo')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram'])
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [flyerUrls, setFlyerUrls] = useState<string[]>([])
  const [selectedFlyer, setSelectedFlyer] = useState<string | null>(null)
  const [generatingFlyer, setGeneratingFlyer] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [composeMessage, setComposeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Photo library state
  const [photos, setPhotos] = useState<SocialPhoto[]>([])
  const [selectedRefPhoto, setSelectedRefPhoto] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingFlyer, setUploadingFlyer] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const flyerInputRef = useRef<HTMLInputElement>(null)
  const libraryPhotoInputRef = useRef<HTMLInputElement>(null)

  // Queue state
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  // Load on mount
  useEffect(() => {
    const stored = getStoredIdeas()
    if (stored && stored.ideas.length > 0) {
      setIdeas(stored.ideas)
      setIdeasFetchedAt(stored.fetchedAt)
    }
    getSocialPosts().then(setPosts).catch(() => {}).finally(() => setLoadingPosts(false))
    getSocialPhotos().then(setPhotos).catch(() => {})
  }, [])

  // ─── Ideas handlers ───────────────────────────────────

  const handleRefreshIdeas = useCallback(async () => {
    setLoadingIdeas(true)
    setIdeasError(null)
    try {
      const result = await getContentIdeas()
      if (result.error) {
        setIdeasError(result.error)
      } else {
        setIdeas(result.ideas)
        const now = new Date().toISOString()
        setIdeasFetchedAt(now)
        storeIdeas(result.ideas)
      }
    } catch (err) {
      setIdeasError(err instanceof Error ? err.message : 'Failed to fetch ideas')
    } finally {
      setLoadingIdeas(false)
    }
  }, [])

  const handleClearAndRefresh = useCallback(async () => {
    setIdeas([])
    setIdeasFetchedAt(null)
    localStorage.removeItem(IDEAS_STORAGE_KEY)
    await handleRefreshIdeas()
  }, [handleRefreshIdeas])

  const handleUseIdea = (idea: ContentIdea) => {
    setEventName(idea.event)
    setCaption(idea.caption)
    setHashtags(idea.hashtags)
    setSelectedPlatforms(idea.platform === 'All' ? ['Instagram', 'Facebook', 'TikTok'] : [idea.platform])
    setTab('compose')
  }

  // ─── Compose handlers ────────────────────────────────

  const handleGenerateCaption = async () => {
    if (!eventName) return
    setGeneratingCaption(true)
    setComposeMessage(null)
    try {
      const result = await generateCaption(eventName, postType, selectedPlatforms)
      if (result.error) {
        setComposeMessage({ type: 'error', text: result.error })
      } else {
        setCaption(result.caption)
        setHashtags(result.hashtags)
      }
    } catch (err) {
      setComposeMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to generate caption' })
    } finally {
      setGeneratingCaption(false)
    }
  }

  const handleGenerateFlyer = async () => {
    if (!eventName) return
    setGeneratingFlyer(true)
    setComposeMessage(null)
    setFlyerUrls([])
    setSelectedFlyer(null)
    try {
      const result = await generateFlyer(eventName, selectedRefPhoto)
      if (result.error) {
        setComposeMessage({ type: 'error', text: result.error })
      } else {
        setFlyerUrls(result.urls)
        if (result.urls.length > 0) setSelectedFlyer(result.urls[0])
      }
    } catch (err) {
      setComposeMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to generate flyer' })
    } finally {
      setGeneratingFlyer(false)
    }
  }

  const handleCopyCaption = async () => {
    const full = caption + (hashtags ? '\n\n' + hashtags : '')
    await navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleSchedulePost = async () => {
    if (!eventName || !caption) return
    setSaving(true)
    setComposeMessage(null)
    try {
      const post = await createSocialPost({
        title: eventName,
        caption: caption + (hashtags ? '\n\n' + hashtags : ''),
        platform: selectedPlatforms.join(', '),
        image_url: selectedFlyer,
        scheduled_at: scheduledAt || null,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      })
      setPosts((prev) => [post, ...prev])
      setComposeMessage({ type: 'success', text: scheduledAt ? 'Post scheduled!' : 'Draft saved!' })
      setEventName('')
      setCaption('')
      setHashtags('')
      setFlyerUrls([])
      setSelectedFlyer(null)
      setScheduledAt('')
    } catch (err) {
      setComposeMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save post' })
    } finally {
      setSaving(false)
    }
  }

  // ─── Photo handlers ──────────────────────────────────

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadSocialPhoto(fd)
      if (result.error) {
        setComposeMessage({ type: 'error', text: result.error })
      } else if (result.photo) {
        setPhotos((prev) => [result.photo!, ...prev])
      }
    } catch {
      setComposeMessage({ type: 'error', text: 'Failed to upload photo' })
    } finally {
      setUploadingPhoto(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleDeletePhoto = async (id: string) => {
    const result = await deleteSocialPhoto(id)
    if (!result.error) {
      setPhotos((prev) => prev.filter((p) => p.id !== id))
      if (photos.find((p) => p.id === id)?.url === selectedRefPhoto) {
        setSelectedRefPhoto(null)
      }
    }
  }

  const handleManualFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFlyer(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadFlyerManually(fd)
      if (result.error) {
        setComposeMessage({ type: 'error', text: result.error })
      } else if (result.url) {
        setFlyerUrls((prev) => [result.url!, ...prev])
        setSelectedFlyer(result.url)
      }
    } catch {
      setComposeMessage({ type: 'error', text: 'Failed to upload flyer' })
    } finally {
      setUploadingFlyer(false)
      if (e.target) e.target.value = ''
    }
  }

  // ─── Queue handlers ──────────────────────────────────

  const handleMarkPosted = async (id: string) => {
    try {
      const updated = await updateSocialPost(id, { status: 'POSTED' })
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch { /* ignore */ }
  }

  const handleDeletePost = async (id: string) => {
    try {
      await deleteSocialPost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch { /* ignore */ }
  }

  // ─── Render helpers ──────────────────────────────────

  const priorityVariant: Record<string, 'green' | 'gold' | 'purple'> = {
    High: 'green',
    Medium: 'gold',
    Evergreen: 'purple',
  }

  const statusVariant: Record<string, 'gold' | 'green' | 'outline'> = {
    DRAFT: 'outline',
    SCHEDULED: 'gold',
    POSTED: 'green',
  }

  // Hidden file inputs
  const hiddenInputs = (
    <>
      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
      <input ref={flyerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleManualFlyerUpload} />
      <input ref={libraryPhotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
    </>
  )

  return (
    <div className="space-y-6">
      {hiddenInputs}

      {/* Header */}
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
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              tab === key
                ? 'bg-gold/15 text-gold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {label}
            {key === 'queue' && posts.filter((p) => p.status === 'SCHEDULED').length > 0 && (
              <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                {posts.filter((p) => p.status === 'SCHEDULED').length}
              </span>
            )}
            {key === 'photos' && photos.length > 0 && (
              <span className="text-[10px] text-gray-600">{photos.length}</span>
            )}
          </button>
        ))}
        </div>
      </div>

      {/* ═══ IDEAS TAB ═══ */}
      {tab === 'ideas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-400">AI-researched content ideas based on upcoming Vegas events</p>
              {ideasFetchedAt && ideas.length > 0 && (
                <p className="text-xs text-gray-600 mt-0.5">Last researched: {timeAgo(ideasFetchedAt)}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ideas.length > 0 && (
                <button onClick={handleClearAndRefresh} disabled={loadingIdeas} className="text-xs text-gray-500 hover:text-gold transition-colors whitespace-nowrap">
                  Clear &amp; Refresh
                </button>
              )}
              <button onClick={handleRefreshIdeas} disabled={loadingIdeas}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loadingIdeas ? 'animate-spin' : ''}`} />
                {loadingIdeas ? 'Researching...' : 'Refresh Ideas'}
              </button>
            </div>
          </div>

          {ideasError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{ideasError}</div>
          )}

          {ideas.length === 0 && !loadingIdeas && !ideasError && (
            <div className="rounded-xl border border-dark-border bg-dark-card p-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">Click &quot;Refresh Ideas&quot; to research trending Vegas events and generate post ideas</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {ideas.map((idea, i) => {
              const PlatIcon = PLATFORM_ICONS[idea.platform] || Send
              return (
                <div key={i} className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityVariant[idea.priority] || 'outline'}>{idea.priority}</Badge>
                      <PlatIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">{idea.timing}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{idea.event}</p>
                    <p className="mt-1 text-xs text-gold/80 italic">&ldquo;{idea.hook}&rdquo;</p>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{idea.caption}</p>
                  <button onClick={() => handleUseIdea(idea)}
                    className="w-full rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-semibold text-gold transition-all hover:bg-gold/10">
                    Use This &rarr;
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ COMPOSE TAB ═══ */}
      {tab === 'compose' && (
        <div className="space-y-4">
          {ideas.length > 0 && (
            <button onClick={() => setTab('ideas')} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gold transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back to Ideas
            </button>
          )}

          {composeMessage && (
            <div className={`rounded-lg px-3 py-2 text-sm font-medium ${
              composeMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>{composeMessage.text}</div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-4">
              {/* Details */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Details</p>
                <input type="text" placeholder="Event or topic name" value={eventName} onChange={(e) => setEventName(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                <select value={postType} onChange={(e) => setPostType(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none">
                  {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Platforms</p>
                  <div className="flex gap-2">
                    {PLATFORMS.map((p) => (
                      <button key={p} onClick={() => togglePlatform(p)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedPlatforms.includes(p) ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500 hover:border-gray-600'
                        }`}>{p}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleGenerateCaption} disabled={!eventName || generatingCaption}
                  className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed">
                  {generatingCaption ? 'Generating...' : '✨ Generate Caption'}
                </button>
              </div>

              {/* Photo Library (inline) */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Reference Photo</p>
                  <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gold transition-colors">
                    <Upload className="h-3 w-3" />
                    {uploadingPhoto ? 'Uploading...' : 'Upload'}
                  </button>
                </div>

                {selectedRefPhoto && (
                  <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2">
                    <img src={selectedRefPhoto} alt="" className="h-8 w-8 rounded object-cover" />
                    <p className="text-xs text-gold flex-1">Reference photo selected — will influence flyer generation</p>
                    <button onClick={() => setSelectedRefPhoto(null)} className="text-gray-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                  </div>
                )}

                {photos.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.slice(0, 12).map((photo) => (
                      <button key={photo.id} onClick={() => setSelectedRefPhoto(photo.url)}
                        className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          selectedRefPhoto === photo.url ? 'border-gold shadow-[0_0_12px_rgba(214,192,138,0.3)]' : 'border-dark-border hover:border-gray-600'
                        }`}>
                        <img src={photo.url} alt={photo.filename} className="h-16 w-16 object-cover" />
                        {selectedRefPhoto === photo.url && (
                          <div className="absolute top-0.5 right-0.5 rounded-full bg-gold p-0.5"><Check className="h-2.5 w-2.5 text-black" /></div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">No photos yet. Upload one or go to the Photos tab.</p>
                )}
              </div>

              {/* Flyer generation */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Flyer</p>
                <button onClick={handleGenerateFlyer} disabled={!eventName || generatingFlyer}
                  className="w-full rounded-lg border border-gold/30 px-4 py-2.5 text-sm font-semibold text-gold transition-all hover:bg-gold/10 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="inline-flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {generatingFlyer ? 'Generating flyers (30-60s)...' : selectedRefPhoto ? 'Generate Flyer (with reference)' : 'Generate Flyer'}
                  </span>
                </button>

                {/* Manual flyer upload */}
                <button onClick={() => flyerInputRef.current?.click()} disabled={uploadingFlyer}
                  className="w-full rounded-lg border border-dark-border px-4 py-2 text-xs text-gray-500 transition-all hover:border-gray-600 hover:text-gray-400">
                  {uploadingFlyer ? 'Uploading...' : 'Or upload your own flyer'}
                </button>

                {flyerUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {flyerUrls.map((url, i) => (
                      <button key={i} onClick={() => setSelectedFlyer(url)}
                        className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                          selectedFlyer === url ? 'border-gold shadow-[0_0_12px_rgba(214,192,138,0.3)]' : 'border-dark-border hover:border-gray-600'
                        }`}>
                        <img src={url} alt={`Flyer ${i + 1}`} className="aspect-square w-full object-cover" />
                        {selectedFlyer === url && (
                          <div className="absolute top-1 right-1 rounded-full bg-gold p-0.5"><Check className="h-3 w-3 text-black" /></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Caption */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Caption</p>
                  {caption && (
                    <button onClick={handleCopyCaption} className="text-xs text-gray-500 hover:text-gold transition-colors">
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
                <textarea rows={6} placeholder="Caption will appear here after generation..." value={caption} onChange={(e) => setCaption(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none" />
                <input type="text" placeholder="Hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-xs text-gold/70 placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
              </div>

              {/* Preview */}
              {selectedFlyer && (
                <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
                  <img src={selectedFlyer} alt="Selected flyer" className="w-full aspect-square object-cover" />
                  {caption && (
                    <div className="p-3 border-t border-dark-border">
                      <p className="text-xs text-gray-400 line-clamp-3">{caption}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Schedule */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Schedule</p>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none" />
                <button onClick={handleSchedulePost} disabled={!eventName || !caption || saving}
                  className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Saving...' : scheduledAt ? '📅 Schedule Post' : '💾 Save as Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ QUEUE TAB ═══ */}
      {tab === 'queue' && (
        <div className="space-y-3">
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dark-border bg-dark-card p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">No posts yet. Create one in the Compose tab.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="rounded-xl border border-dark-border bg-dark-card p-4">
                <div className="flex items-start gap-3">
                  {post.image_url ? (
                    <img src={post.image_url} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/5 shrink-0">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-snug">{post.title}</p>
                      <Badge variant={statusVariant[post.status] || 'outline'}>{post.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{post.platform}</p>
                    {post.scheduled_at && (
                      <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(post.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400 line-clamp-1">{post.caption}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {post.status !== 'POSTED' && (
                      <button onClick={() => handleMarkPosted(post.id)} className="rounded-lg p-2 text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Mark as Posted">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleDeletePost(post.id)} className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══ PHOTOS TAB ═══ */}
      {tab === 'photos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{photos.length} photo{photos.length !== 1 ? 's' : ''} in library</p>
            <button onClick={() => libraryPhotoInputRef.current?.click()} disabled={uploadingPhoto}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50">
              <Upload className="h-4 w-4" />
              {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-xl border border-dark-border bg-dark-card p-12 text-center">
              <Camera className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">No photos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative rounded-xl border border-dark-border bg-dark-card overflow-hidden">
                  <img src={photo.url} alt={photo.filename} className="aspect-square w-full object-cover" />
                  <div className="p-2">
                    <p className="text-xs text-gray-400 truncate">{photo.filename}</p>
                    <p className="text-[10px] text-gray-600">{timeAgo(photo.created_at)}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setSelectedRefPhoto(photo.url); setTab('compose') }}
                      className="rounded-lg bg-black/70 p-1.5 text-gold hover:bg-black/90 transition-colors" title="Use in Compose">
                      <PenTool className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDeletePhoto(photo.id)}
                      className="rounded-lg bg-black/70 p-1.5 text-red-400 hover:bg-black/90 transition-colors" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
