'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles,
  RefreshCw,
  Send,
  Copy,
  Trash2,
  Check,
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
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  getContentIdeas,
  generateCaption,
  uploadImage,
  getSocialPosts,
  createSocialPost,
  updateSocialPost,
  deleteSocialPost,
} from '@/lib/actions/social-studio'
import type { ContentIdea, SocialPost } from '@/lib/actions/social-studio'

type Tab = 'ideas' | 'compose' | 'queue'

const PLATFORM_ICONS: Record<string, typeof Instagram> = { Instagram, Facebook, Youtube, TikTok: Sparkles, All: Send }
const POST_TYPES = ['Event Promo', 'Vehicle Showcase', 'Package Promo', 'General']
const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube']
const IDEAS_KEY = 'ar-social-studio-ideas'

function getStoredIdeas(): { ideas: ContentIdea[]; fetchedAt: string } | null {
  if (typeof window === 'undefined') return null
  try { const r = localStorage.getItem(IDEAS_KEY); return r ? JSON.parse(r) : null } catch { return null }
}
function storeIdeas(ideas: ContentIdea[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(IDEAS_KEY, JSON.stringify({ ideas, fetchedAt: new Date().toISOString() }))
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
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [copiedHashtags, setCopiedHashtags] = useState(false)
  const [composeMessage, setComposeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [ideogramOpened, setIdeogramOpened] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Queue
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    const stored = getStoredIdeas()
    if (stored?.ideas.length) { setIdeas(stored.ideas); setIdeasFetchedAt(stored.fetchedAt) }
    getSocialPosts().then(setPosts).catch(() => {}).finally(() => setLoadingPosts(false))
  }, [])

  // ─── Ideas ────────────────────────────────────────────

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
    setIdeas([]); setIdeasFetchedAt(null); localStorage.removeItem(IDEAS_KEY); await handleRefreshIdeas()
  }, [handleRefreshIdeas])

  const handleCreatePost = (idea: ContentIdea) => {
    setEventName(idea.event)
    setCaption(idea.caption)
    setHashtags(idea.hashtags)
    setSelectedPlatforms(idea.platform === 'All' ? ['Instagram', 'Facebook', 'TikTok'] : [idea.platform])
    setTab('compose')
  }

  // ─── Compose ──────────────────────────────────────────

  const handleGenerateCaption = async () => {
    if (!eventName) return; setGeneratingCaption(true); setComposeMessage(null)
    try {
      const r = await generateCaption(eventName, postType, selectedPlatforms)
      if (r.error) setComposeMessage({ type: 'error', text: r.error })
      else { setCaption(r.caption); setHashtags(r.hashtags) }
    } catch (e) { setComposeMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setGeneratingCaption(false) }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true); setComposeMessage(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await uploadImage(fd)
      if (r.error) setComposeMessage({ type: 'error', text: r.error })
      else if (r.url) { setImageUrl(r.url); setIdeogramOpened(false) }
    } catch { setComposeMessage({ type: 'error', text: 'Upload failed' }) }
    finally { setUploading(false); if (e.target) e.target.value = '' }
  }

  const handleOpenIdeogram = () => {
    window.open('https://ideogram.ai', '_blank')
    setIdeogramOpened(true)
  }

  const handleCopy = async (text: string, type: 'caption' | 'hashtags') => {
    await navigator.clipboard.writeText(text)
    if (type === 'caption') { setCopiedCaption(true); setTimeout(() => setCopiedCaption(false), 2000) }
    else { setCopiedHashtags(true); setTimeout(() => setCopiedHashtags(false), 2000) }
  }

  const togglePlatform = (p: string) => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const handleSave = async (status: 'DRAFT' | 'SCHEDULED') => {
    if (!eventName || !caption) return; setSaving(true); setComposeMessage(null)
    try {
      const post = await createSocialPost({
        title: eventName, caption: caption + (hashtags ? '\n\n' + hashtags : ''),
        platform: selectedPlatforms.join(', '), image_url: imageUrl,
        scheduled_at: status === 'SCHEDULED' && scheduledAt ? scheduledAt : null, status,
      })
      setPosts(prev => [post, ...prev])
      setComposeMessage({ type: 'success', text: status === 'SCHEDULED' ? 'Post scheduled!' : 'Draft saved!' })
      setEventName(''); setCaption(''); setHashtags(''); setImageUrl(null); setScheduledAt(''); setIdeogramOpened(false)
    } catch (e) { setComposeMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  // ─── Queue ────────────────────────────────────────────

  const handleMarkPosted = async (id: string) => { try { const u = await updateSocialPost(id, { status: 'POSTED' }); setPosts(prev => prev.map(p => p.id === id ? u : p)) } catch {} }
  const handleDeletePost = async (id: string) => { try { await deleteSocialPost(id); setPosts(prev => prev.filter(p => p.id !== id)) } catch {} }

  // ─── Render ───────────────────────────────────────────

  const priorityV: Record<string, 'green' | 'gold' | 'purple'> = { High: 'green', Medium: 'gold', Evergreen: 'purple' }
  const statusV: Record<string, 'gold' | 'green' | 'outline'> = { DRAFT: 'outline', SCHEDULED: 'gold', POSTED: 'green' }

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />

      <div>
        <h1 className="text-2xl font-bold text-white">Social Studio</h1>
        <p className="mt-1 text-sm text-gray-400">Research, compose, and schedule social media posts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
        {([
          { key: 'ideas' as Tab, label: 'Ideas', icon: Sparkles },
          { key: 'compose' as Tab, label: 'Compose', icon: PenTool },
          { key: 'queue' as Tab, label: 'Queue', icon: Calendar },
        ]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${tab === key ? 'bg-gold/15 text-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Icon className="h-4 w-4" />{label}
            {key === 'queue' && posts.filter(p => p.status === 'SCHEDULED').length > 0 && (
              <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">{posts.filter(p => p.status === 'SCHEDULED').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ IDEAS ═══ */}
      {tab === 'ideas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-400">AI-researched ideas based on upcoming Vegas events</p>
              {ideasFetchedAt && ideas.length > 0 && <p className="text-xs text-gray-600 mt-0.5">Last researched: {timeAgo(ideasFetchedAt)}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ideas.length > 0 && <button onClick={handleClearAndRefresh} disabled={loadingIdeas} className="text-xs text-gray-500 hover:text-gold transition-colors">Clear &amp; Refresh</button>}
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
                  <button onClick={() => handleCreatePost(idea)} className="w-full rounded-lg border border-gold/30 px-3 py-2 text-xs font-semibold text-gold transition-all hover:bg-gold/10">
                    Create Post &rarr;
                  </button>
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

          {/* Ideogram banner */}
          {ideogramOpened && !imageUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3">
              <p className="text-xs text-gold flex-1">Made your flyer? Download it from Ideogram then upload it here 👆</p>
              <button onClick={() => setIdeogramOpened(false)} className="text-gray-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* LEFT */}
            <div className="space-y-4">
              {/* Details */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Details</p>
                <input type="text" placeholder="Event or topic name" value={eventName} onChange={e => setEventName(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                <select value={postType} onChange={e => setPostType(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none">
                  {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Platforms</p>
                  <div className="flex gap-2 flex-wrap">
                    {PLATFORMS.map(p => <button key={p} onClick={() => togglePlatform(p)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${selectedPlatforms.includes(p) ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500 hover:border-gray-600'}`}>{p}</button>)}
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Image</p>

                {imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-dark-border">
                    <img src={imageUrl} alt="Post image" className="w-full object-cover" />
                    <button onClick={() => setImageUrl(null)}
                      className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className={`flex flex-col items-center gap-2 rounded-lg border border-dark-border p-4 text-center transition-all hover:border-gold/30 hover:bg-gold/5 ${ideogramOpened ? 'animate-pulse border-gold/40' : ''}`}>
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-400">{uploading ? 'Uploading...' : 'Upload Photo/Flyer'}</span>
                    </button>
                    <button onClick={handleOpenIdeogram}
                      className="flex flex-col items-center gap-2 rounded-lg border border-dark-border p-4 text-center transition-all hover:border-gold/30 hover:bg-gold/5">
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-400">Create in Ideogram</span>
                    </button>
                  </div>
                )}
                {!imageUrl && <p className="text-[10px] text-gray-600 text-center">Create your flyer in Ideogram, download it, then upload it here</p>}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {/* Caption */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Caption</p>
                <button onClick={handleGenerateCaption} disabled={!eventName || generatingCaption}
                  className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed">
                  {generatingCaption ? 'Generating...' : '✦ Generate Caption'}
                </button>
                <div className="relative">
                  <textarea rows={5} placeholder="Caption will appear here..." value={caption} onChange={e => setCaption(e.target.value)}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none" />
                  {caption && (
                    <button onClick={() => handleCopy(caption, 'caption')} className="absolute top-2 right-2 text-gray-500 hover:text-gold transition-colors" title="Copy caption">
                      {copiedCaption ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input type="text" placeholder="Hashtags" value={hashtags} onChange={e => setHashtags(e.target.value)}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 pr-8 text-xs text-gold/70 placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                  {hashtags && (
                    <button onClick={() => handleCopy(hashtags, 'hashtags')} className="absolute top-1/2 -translate-y-1/2 right-2 text-gray-500 hover:text-gold transition-colors" title="Copy hashtags">
                      {copiedHashtags ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Preview */}
              {imageUrl && caption && (
                <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full object-cover" />
                  <div className="p-3 border-t border-dark-border">
                    <p className="text-xs text-gray-400 line-clamp-3">{caption}</p>
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Schedule</p>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleSave('DRAFT')} disabled={!eventName || !caption || saving}
                    className="rounded-lg border border-dark-border px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:border-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Saving...' : '💾 Save Draft'}
                  </button>
                  <button onClick={() => handleSave('SCHEDULED')} disabled={!eventName || !caption || !scheduledAt || saving}
                    className="rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Saving...' : '📅 Schedule'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ QUEUE ═══ */}
      {tab === 'queue' && (
        <div className="space-y-3">
          {loadingPosts ? <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
          : posts.length === 0 ? <div className="rounded-xl border border-dark-border bg-dark-card p-12 text-center"><Calendar className="mx-auto h-10 w-10 text-gray-600" /><p className="mt-3 text-sm text-gray-500">No posts yet. Create one in the Compose tab.</p></div>
          : posts.map(post => (
            <div key={post.id} className="rounded-xl border border-dark-border bg-dark-card p-4">
              <div className="flex items-start gap-3">
                {post.image_url ? <img src={post.image_url} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
                : <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/5 shrink-0"><FileText className="h-5 w-5 text-gray-600" /></div>}
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
    </div>
  )
}
