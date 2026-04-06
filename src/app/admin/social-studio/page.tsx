'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles, RefreshCw, Copy, Trash2, Check, Calendar, PenTool,
  Upload, X, ExternalLink, Image as ImageIcon, ChevronLeft,
  ChevronRight, Hash, Camera, Search, Filter, ArrowLeft,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  researchEvents, getStoredResearch, generateCaptions, generateHashtags, analyzePhoto,
  uploadImage, getContentLibrary, saveContent, updateContentStatus, deleteContent,
} from '@/lib/actions/social-studio'
import type { ResearchResult, ResearchEvent, SocialContentItem } from '@/lib/actions/social-studio'

type Tab = 'ideas' | 'compose' | 'library'
type ComposeMode = 'event' | 'photo'

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok']
const POST_TYPES = ['Event Promo', 'Vehicle Showcase', 'Behind the Scenes', 'Package Promo', 'General']
const CATEGORIES = ['ALL', 'SPORTS', 'CONCERTS', 'EDM_FESTIVALS', 'CONVENTIONS', 'COMBAT_SPORTS', 'MOTORSPORTS', 'FREMONT_DTLV', 'HOLIDAYS']
const DEMAND_COLORS: Record<string, string> = { RED: 'bg-red-500', YELLOW: 'bg-yellow-500', GREEN: 'bg-emerald-500' }
const DEMAND_TEXT: Record<string, string> = { RED: 'text-red-400', YELLOW: 'text-yellow-400', GREEN: 'text-emerald-400' }

function timeAgo(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`
}
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfWeek(y: number, m: number) { return new Date(y, m, 1).getDay() }

export default function SocialStudioPage() {
  const [tab, setTab] = useState<Tab>('ideas')

  // Research
  const [research, setResearch] = useState<ResearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calView, setCalView] = useState(true)
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Compose
  const [composeMode, setComposeMode] = useState<ComposeMode>('event')
  const [eventName, setEventName] = useState('')
  const [venue, setVenue] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['Instagram'])
  const [postType, setPostType] = useState('Event Promo')
  const [promptSuggestion, setPromptSuggestion] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [captions, setCaptions] = useState<{ hype: string; value: string; premium: string } | null>(null)
  const [genCaptions, setGenCaptions] = useState(false)
  const [hashtags, setHashtags] = useState<{ event: string[]; industry: string[]; trending: string[] } | null>(null)
  const [genHashtags, setGenHashtags] = useState(false)
  const [photoContext, setPhotoContext] = useState('')
  const [photoAngles, setPhotoAngles] = useState<{ title: string; description: string; platform: string }[] | null>(null)
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false)
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [composeMsg, setComposeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [ideogramOpened, setIdeogramOpened] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Library
  const [library, setLibrary] = useState<SocialContentItem[]>([])
  const [libLoading, setLibLoading] = useState(true)
  const [libFilter, setLibFilter] = useState('ALL')
  const [libSearch, setLibSearch] = useState('')

  useEffect(() => {
    getStoredResearch().then(r => { if (r.data) setResearch(r.data) }).catch(() => {})
    getContentLibrary().then(setLibrary).catch(() => {}).finally(() => setLibLoading(false))
  }, [])

  // ─── Research ─────────────────────────────────────────

  const handleResearch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const r = await researchEvents()
      if (r.error) setError(r.error)
      else if (r.data) { setResearch(r.data) }
    } catch (e) { setError(e instanceof Error ? e.message : String(e || 'Research failed — please try again')) }
    finally { setLoading(false) }
  }, [])

  const getEventsForDay = (day: number): ResearchEvent[] => {
    if (!research?.events) return []
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return research.events.filter(e => e.date_start <= dateStr && (e.date_end ? e.date_end >= dateStr : e.date_start === dateStr))
  }

  const handleUseEvent = (event: ResearchEvent) => {
    setEventName(event.name); setVenue(event.venue); setEventDate(event.date_start)
    setPromptSuggestion(event.ideogram_prompt_suggestion); setComposeMode('event')
    setCaptions(null); setHashtags(null); setImageUrl(null); setTab('compose')
  }

  // ─── Compose ──────────────────────────────────────────

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setUploading(true)
    try { const fd = new FormData(); fd.append('file', f); const r = await uploadImage(fd); if (r.url) { setImageUrl(r.url); setIdeogramOpened(false) } else if (r.error) setComposeMsg({ type: 'error', text: r.error }) }
    catch { setComposeMsg({ type: 'error', text: 'Upload failed' }) }
    finally { setUploading(false); if (e.target) e.target.value = '' }
  }

  const handleGenCaptions = async () => {
    if (!eventName) return; setGenCaptions(true); setComposeMsg(null)
    try {
      const r = await generateCaptions(eventName, venue || null, platforms, postType, selectedAngle || undefined)
      if (r.error) setComposeMsg({ type: 'error', text: r.error })
      else if (r.captions) setCaptions(r.captions)
    } catch { setComposeMsg({ type: 'error', text: 'Failed' }) }
    finally { setGenCaptions(false) }
  }

  const handleGenHashtags = async () => {
    if (!eventName) return; setGenHashtags(true)
    try {
      const r = await generateHashtags(eventName, venue || null, platforms)
      if (r.error) setComposeMsg({ type: 'error', text: r.error })
      else if (r.hashtags) setHashtags(r.hashtags)
    } catch { setComposeMsg({ type: 'error', text: 'Failed' }) }
    finally { setGenHashtags(false) }
  }

  const handleAnalyzePhoto = async () => {
    if (!imageUrl) return; setAnalyzingPhoto(true)
    try {
      const r = await analyzePhoto(imageUrl, photoContext || null)
      if (r.error) setComposeMsg({ type: 'error', text: r.error })
      else if (r.angles) setPhotoAngles(r.angles)
    } catch { setComposeMsg({ type: 'error', text: 'Failed' }) }
    finally { setAnalyzingPhoto(false) }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  const togglePlatform = (p: string) => setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const handleSaveToLibrary = async () => {
    setSaving(true); setComposeMsg(null)
    try {
      const allCaptions = captions ? `HYPE:\n${captions.hype}\n\nVALUE:\n${captions.value}\n\nPREMIUM:\n${captions.premium}` : null
      const allHashtags = hashtags ? [...hashtags.event, ...hashtags.industry, ...hashtags.trending].join(' ') : null
      const item = await saveContent({
        type: composeMode === 'photo' ? 'photo' : 'flyer', event_name: eventName || null,
        venue: venue || null, event_date: eventDate || null, image_url: imageUrl,
        context: photoContext || null, captions: allCaptions, hashtags: allHashtags,
        platform: platforms.join(', '), status: 'DRAFT',
      })
      setLibrary(prev => [item, ...prev])
      setComposeMsg({ type: 'success', text: 'Saved to library!' })
      setEventName(''); setVenue(''); setEventDate(''); setImageUrl(null); setCaptions(null); setHashtags(null); setPhotoAngles(null); setSelectedAngle(null); setPhotoContext('')
    } catch { setComposeMsg({ type: 'error', text: 'Save failed' }) }
    finally { setSaving(false) }
  }

  // ─── Library ──────────────────────────────────────────

  const handleToggleStatus = async (id: string, current: string) => {
    const next = current === 'DRAFT' ? 'POSTED' : 'DRAFT'
    await updateContentStatus(id, next)
    setLibrary(prev => prev.map(i => i.id === id ? { ...i, status: next } : i))
  }

  const handleDelete = async (id: string) => {
    await deleteContent(id); setLibrary(prev => prev.filter(i => i.id !== id))
  }

  const filteredLib = library.filter(i => {
    if (libFilter !== 'ALL' && i.status !== libFilter) return false
    if (libSearch && !i.event_name?.toLowerCase().includes(libSearch.toLowerCase())) return false
    return true
  })

  // ─── Calendar render ─────────────────────────────────

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfWeek(calYear, calMonth)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthKey = `${monthNames[calMonth].toLowerCase()}_${calYear}`
  const monthSummary = research?.month_summary?.[monthKey]

  const filteredEvents = (research?.events || []).filter(e => categoryFilter === 'ALL' || e.category === categoryFilter)

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />

      <div>
        <h1 className="text-2xl font-bold text-white">Social Studio</h1>
        <p className="mt-1 text-sm text-gray-400">Research events, create content, build your library</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
        {([
          { key: 'ideas' as Tab, label: 'Ideas & Calendar', icon: Calendar },
          { key: 'compose' as Tab, label: 'Compose', icon: PenTool },
          { key: 'library' as Tab, label: 'Library', icon: ImageIcon },
        ]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${tab === key ? 'bg-gold/15 text-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{label}
          </button>
        ))}
      </div>

      {/* ═══ IDEAS & CALENDAR ═══ */}
      {tab === 'ideas' && (
        <div className="space-y-4">
          {/* Research header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              {research?.researched_at && <p className="text-xs text-gray-600">Last researched: {timeAgo(research.researched_at)}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCalView(!calView)} className="rounded-lg border border-dark-border px-3 py-1.5 text-xs text-gray-400 hover:text-gold transition-colors">
                {calView ? '📋 List' : '📅 Calendar'}
              </button>
              <button onClick={handleResearch} disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />{loading ? 'Researching...' : '🔄 Refresh Research'}
              </button>
            </div>
          </div>

          {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

          {/* Month summary */}
          {monthSummary && (
            <div className={`rounded-lg border px-3 py-2 text-xs font-medium ${
              monthSummary.rating === 'PEAK' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
              monthSummary.rating === 'HIGH' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' :
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}>
              {monthNames[calMonth]} {calYear} — {monthSummary.rating} DEMAND · {monthSummary.note}
            </div>
          )}

          {calView ? (
            /* CALENDAR VIEW */
            <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-dark-border px-4 py-3">
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }} className="text-gray-400 hover:text-gold"><ChevronLeft className="h-5 w-5" /></button>
                <h3 className="text-sm font-semibold text-white">{monthNames[calMonth]} {calYear}</h3>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }} className="text-gray-400 hover:text-gold"><ChevronRight className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-7 border-b border-dark-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-medium text-gray-600">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="min-h-[52px] border-b border-r border-dark-border/50" />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const events = getEventsForDay(day)
                  const today = new Date()
                  const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  return (
                    <button key={day} onClick={() => events.length > 0 && setSelectedDay(dateStr)}
                      className={`min-h-[52px] border-b border-r border-dark-border/50 p-1 text-left transition-colors hover:bg-white/5 ${isToday ? 'bg-gold/5' : ''}`}>
                      <span className={`text-[11px] ${isToday ? 'font-bold text-gold' : 'text-gray-500'}`}>{day}</span>
                      {events.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap">
                          {events.slice(0, 3).map((e, j) => <div key={j} className={`h-1.5 w-1.5 rounded-full ${DEMAND_COLORS[e.demand_level] || 'bg-gray-500'}`} />)}
                          {events.length > 3 && <span className="text-[8px] text-gray-600">+{events.length - 3}</span>}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-3">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategoryFilter(c)}
                    className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all ${categoryFilter === c ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500 hover:border-gray-600'}`}>
                    {c.replace('_', '/')}
                  </button>
                ))}
              </div>
              {filteredEvents.length === 0 && !loading && (
                <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-gray-600" />
                  <p className="mt-2 text-sm text-gray-500">{research ? 'No events in this category' : 'Click "Refresh Research" to load events'}</p>
                </div>
              )}
              {filteredEvents.map(event => (
                <div key={event.id} className="rounded-xl border border-dark-border bg-dark-card p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${DEMAND_COLORS[event.demand_level]}`} />
                      <p className="text-sm font-medium text-white">{event.name}</p>
                    </div>
                    <span className={`text-[10px] font-semibold shrink-0 ${DEMAND_TEXT[event.demand_level]}`}>{event.posting_urgency}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{event.venue}</span>
                    <span>{event.date_start}</span>
                    <span>{event.estimated_attendance.toLocaleString()} est.</span>
                  </div>
                  <p className="text-xs text-gray-400">{event.tourism_impact}</p>
                  <button onClick={() => handleUseEvent(event)} className="w-full rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-semibold text-gold transition-all hover:bg-gold/10">
                    Create Post &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Day detail modal */}
          {selectedDay && (
            <>
              <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setSelectedDay(null)} />
              <div className="fixed left-1/2 bottom-0 z-50 w-full max-w-lg -translate-x-1/2 rounded-t-2xl border border-dark-border bg-dark-card p-4 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                {getEventsForDay(parseInt(selectedDay.split('-')[2])).map(event => (
                  <div key={event.id} className="rounded-lg border border-dark-border bg-black/50 p-3 mb-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${DEMAND_COLORS[event.demand_level]}`} />
                      <p className="text-sm font-medium text-white">{event.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">{event.venue} · {event.estimated_attendance.toLocaleString()} est.</p>
                    <p className="text-xs text-gray-400">{event.tourism_impact}</p>
                    <button onClick={() => { handleUseEvent(event); setSelectedDay(null) }} className="text-xs text-gold hover:text-gold-light transition-colors">Create Post &rarr;</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ COMPOSE ═══ */}
      {tab === 'compose' && (
        <div className="space-y-4">
          {research && <button onClick={() => setTab('ideas')} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gold transition-colors"><ArrowLeft className="h-3 w-3" /> Back to Ideas</button>}
          {composeMsg && <div className={`rounded-lg px-3 py-2 text-sm font-medium ${composeMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{composeMsg.text}</div>}
          {ideogramOpened && !imageUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3">
              <p className="text-xs text-gold flex-1">Made your flyer? Download it from Ideogram then upload it here 👆</p>
              <button onClick={() => setIdeogramOpened(false)} className="text-gray-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}

          {/* Mode toggle */}
          <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
            <button onClick={() => setComposeMode('event')} className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${composeMode === 'event' ? 'bg-gold/15 text-gold' : 'text-gray-400 hover:text-white'}`}>📅 From Event/Idea</button>
            <button onClick={() => setComposeMode('photo')} className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${composeMode === 'photo' ? 'bg-gold/15 text-gold' : 'text-gray-400 hover:text-white'}`}>📷 From Photo</button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* LEFT */}
            <div className="space-y-4">
              {composeMode === 'event' ? (
                <>
                  {/* Event details */}
                  <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Event Details</p>
                    <input type="text" placeholder="Event name" value={eventName} onChange={e => setEventName(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Venue" value={venue} onChange={e => setVenue(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                      <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none" />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {PLATFORMS.map(p => <button key={p} onClick={() => togglePlatform(p)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${platforms.includes(p) ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500'}`}>{p}</button>)}
                    </div>
                    <select value={postType} onChange={e => setPostType(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none">
                      {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Ideogram section */}
                  <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Flyer</p>
                    {promptSuggestion && (
                      <div>
                        <p className="text-[10px] text-gray-600 mb-1">💡 Suggested prompt</p>
                        <div className="flex gap-2">
                          <p className="flex-1 rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-xs text-gray-300">{promptSuggestion}</p>
                          <button onClick={() => handleCopy(promptSuggestion, 'prompt')} className="shrink-0 rounded-lg border border-dark-border p-2 text-gray-500 hover:text-gold transition-colors">
                            {copied === 'prompt' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {imageUrl ? (
                      <div className="relative rounded-lg overflow-hidden border border-dark-border">
                        <img src={imageUrl} alt="Flyer" className="w-full object-cover" />
                        <button onClick={() => setImageUrl(null)} className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => fileRef.current?.click()} disabled={uploading} className={`flex flex-col items-center gap-2 rounded-lg border border-dark-border p-4 transition-all hover:border-gold/30 ${ideogramOpened ? 'animate-pulse border-gold/40' : ''}`}>
                          <Upload className="h-5 w-5 text-gray-400" /><span className="text-xs text-gray-400">{uploading ? 'Uploading...' : 'Upload Flyer'}</span>
                        </button>
                        <button onClick={() => { window.open('https://ideogram.ai', '_blank'); setIdeogramOpened(true) }} className="flex flex-col items-center gap-2 rounded-lg border border-dark-border p-4 transition-all hover:border-gold/30">
                          <ExternalLink className="h-5 w-5 text-gray-400" /><span className="text-xs text-gray-400">Open Ideogram</span>
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-600">Copy prompt → open Ideogram → upload bus photo as reference → generate → download → upload here</p>
                  </div>
                </>
              ) : (
                /* FROM PHOTO MODE */
                <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Photo</p>
                  {imageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-dark-border">
                      <img src={imageUrl} alt="Photo" className="w-full object-cover" />
                      <button onClick={() => { setImageUrl(null); setPhotoAngles(null) }} className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full flex flex-col items-center gap-2 rounded-lg border border-dashed border-dark-border p-8 transition-all hover:border-gold/30">
                      <Camera className="h-8 w-8 text-gray-500" /><span className="text-sm text-gray-400">{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                    </button>
                  )}
                  <textarea rows={3} placeholder="Add context (optional) — e.g. This is our bus arriving at Allegiant Stadium" value={photoContext} onChange={e => setPhotoContext(e.target.value)} className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none" />
                  <div className="flex gap-1.5 flex-wrap">
                    {PLATFORMS.map(p => <button key={p} onClick={() => togglePlatform(p)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${platforms.includes(p) ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500'}`}>{p}</button>)}
                  </div>
                  {imageUrl && !photoAngles && (
                    <button onClick={handleAnalyzePhoto} disabled={analyzingPhoto} className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50">
                      {analyzingPhoto ? 'Analyzing...' : '✦ Analyze & Generate Post Ideas'}
                    </button>
                  )}
                  {photoAngles && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Post Angles</p>
                      {photoAngles.map((a, i) => (
                        <button key={i} onClick={() => { setSelectedAngle(a.title); setEventName(a.title) }}
                          className={`w-full text-left rounded-lg border p-3 transition-all ${selectedAngle === a.title ? 'border-gold bg-gold/10' : 'border-dark-border hover:border-gray-600'}`}>
                          <p className="text-sm font-medium text-white">{a.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
                          <span className="text-[10px] text-gray-600">Best for {a.platform}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {/* Captions */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Captions</p>
                <button onClick={handleGenCaptions} disabled={!eventName || genCaptions} className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50">
                  {genCaptions ? 'Generating...' : '✦ Generate 3 Captions'}
                </button>
                {captions && (
                  <div className="space-y-2">
                    {([
                      { key: 'hype', label: '🔥 Hype', text: captions.hype },
                      { key: 'value', label: '💰 Value', text: captions.value },
                      { key: 'premium', label: '👑 Premium', text: captions.premium },
                    ] as const).map(c => (
                      <div key={c.key} className="rounded-lg border border-dark-border bg-black/50 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-gray-500">{c.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-600">{c.text.length} chars</span>
                            <button onClick={() => handleCopy(c.text, c.key)} className="text-gray-500 hover:text-gold transition-colors">
                              {copied === c.key ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 whitespace-pre-wrap">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hashtags */}
              <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Hashtags</p>
                  {hashtags && <button onClick={() => handleCopy([...hashtags.event, ...hashtags.industry, ...hashtags.trending].join(' '), 'allhash')} className="text-xs text-gray-500 hover:text-gold transition-colors">
                    {copied === 'allhash' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <span className="flex items-center gap-1"><Copy className="h-3 w-3" /> Copy All</span>}
                  </button>}
                </div>
                <button onClick={handleGenHashtags} disabled={!eventName || genHashtags} className="w-full rounded-lg border border-gold/30 px-4 py-2 text-xs font-semibold text-gold transition-all hover:bg-gold/10 disabled:opacity-50">
                  {genHashtags ? 'Generating...' : '# Generate Hashtags'}
                </button>
                {hashtags && (
                  <div className="space-y-2">
                    {([
                      { label: 'Event', tags: hashtags.event },
                      { label: 'Industry', tags: hashtags.industry },
                      { label: 'Trending', tags: hashtags.trending },
                    ]).map(g => (
                      <div key={g.label}>
                        <p className="text-[9px] uppercase tracking-wider text-gray-600 mb-1">{g.label}</p>
                        <div className="flex flex-wrap gap-1">
                          {g.tags.map((t, i) => (
                            <button key={i} onClick={() => handleCopy(t, `h${g.label}${i}`)}
                              className="rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-gold/70 hover:border-gold/30 transition-colors">
                              {copied === `h${g.label}${i}` ? '✓' : t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save */}
              <button onClick={handleSaveToLibrary} disabled={saving || (!eventName && !imageUrl)} className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50">
                {saving ? 'Saving...' : '💾 Save to Library'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LIBRARY ═══ */}
      {tab === 'library' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input type="text" placeholder="Search by event name..." value={libSearch} onChange={e => setLibSearch(e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-card pl-10 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
            </div>
            <div className="flex gap-1">
              {['ALL', 'DRAFT', 'POSTED'].map(f => (
                <button key={f} onClick={() => setLibFilter(f)} className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${libFilter === f ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-gray-500'}`}>{f}</button>
              ))}
            </div>
          </div>

          {libLoading ? <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
          : filteredLib.length === 0 ? <div className="rounded-xl border border-dark-border bg-dark-card p-12 text-center"><ImageIcon className="mx-auto h-10 w-10 text-gray-600" /><p className="mt-3 text-sm text-gray-500">No content yet</p></div>
          : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLib.map(item => (
              <div key={item.id} className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
                {item.image_url && <img src={item.image_url} alt="" className="w-full aspect-square object-cover" />}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">{item.event_name || 'Untitled'}</p>
                    <button onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${item.status === 'POSTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-500 hover:text-gold'}`}>
                      {item.status}
                    </button>
                  </div>
                  {item.platform && <p className="text-xs text-gray-500">{item.platform}</p>}
                  <p className="text-[10px] text-gray-600">{timeAgo(item.created_at)}</p>
                  {item.captions && <p className="text-xs text-gray-400 line-clamp-2">{item.captions.split('\n')[1] || item.captions.substring(0, 80)}</p>}
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  )
}
