'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bus, Zap, Tent, Crown, RefreshCw, ChevronDown, Check } from 'lucide-react'
import { BRAND } from '@/lib/constants'

interface FaqItem {
  question: string
  answer: string
}

// ─── Particle Background ────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number }[] = []

    function resize() {
      canvas!.width = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? '#9333EA' : '#06B6D4',
        alpha: Math.random() * 0.5 + 0.2,
      })
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas!.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas!.height) p.vy *= -1
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = p.alpha
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  )
}

// ─── Benefits Row ───────────────────────────────────────
const benefits = [
  { icon: Bus, label: 'Private Group Transportation' },
  { icon: Zap, label: 'Fixed Group Pricing' },
  { icon: Tent, label: 'Direct to LVMS' },
  { icon: Crown, label: '8–40 Passengers' },
  { icon: RefreshCw, label: 'Round Trip Available' },
]

// ─── Night Options ──────────────────────────────────────
const nightOptions = [
  'Night 1 — Thursday May 15',
  'Night 2 — Friday May 16',
  'Night 3 — Saturday May 17',
  'All 3 Nights (best value)',
]

const guestOptions = ['8-15', '16-25', '26-35', '36-40', '40+']

// ─── FAQ Accordion ──────────────────────────────────────
function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-[#333] bg-[#1A1A1A] overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-sm font-semibold text-white sm:text-base">{item.question}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-gold transition-transform duration-200 ${
                openIndex === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === i ? 'max-h-96 pb-4' : 'max-h-0'
            }`}
          >
            <p className="px-6 text-sm leading-relaxed text-white/60">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────
export function EdcPage({ faqItems }: { faqItems: FaqItem[] }) {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedNights, setSelectedNights] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  const toggleNight = (night: string) => {
    if (night === 'All 3 Nights (best value)') {
      // If "All 3" is being selected, clear individual nights and just set all
      if (selectedNights.includes(night)) {
        setSelectedNights([])
      } else {
        setSelectedNights([night])
      }
      return
    }
    // If selecting an individual night, remove "All 3" if it was selected
    setSelectedNights((prev) => {
      const without = prev.filter((n) => n !== 'All 3 Nights (best value)')
      return without.includes(night)
        ? without.filter((n) => n !== night)
        : [...without, night]
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedNights.length === 0) {
      setErrorMsg('Please select at least one night')
      return
    }

    setFormState('submitting')
    setErrorMsg('')

    const form = formRef.current!
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/edc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          guestCount: formData.get('guestCount'),
          pickupLocation: formData.get('pickupLocation'),
          nights: selectedNights,
          notes: formData.get('notes'),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setFormState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setFormState('error')
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <ParticleCanvas />

        {/* Neon glows */}
        <div className="pointer-events-none absolute -left-60 top-20 h-[600px] w-[600px] rounded-full bg-purple-600/[0.08] blur-[150px]" />
        <div className="pointer-events-none absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute left-1/3 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-600/[0.05] blur-[100px]" />

        <div className="container-max relative px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Date badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-300 backdrop-blur-sm mb-6">
              <Zap className="h-4 w-4" />
              May 15 · 16 · 17, 2026 — Las Vegas Motor Speedway
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-white">EDC Las Vegas </span>
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">2026</span>
            </h1>

            <p className="mt-3 text-lg font-medium text-gold sm:text-xl">
              Electric Daisy Carnival Transportation
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              Skip the parking chaos. Your private party bus takes your whole crew from your hotel directly to Las Vegas Motor Speedway — no waiting, just vibes.
            </p>

            {/* CTA arrow */}
            <div className="mt-10">
              <a
                href="#availability"
                className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-8 py-3 font-semibold text-gold transition-all hover:border-gold hover:bg-gold/20 hover:shadow-[0_0_30px_rgba(214,192,138,0.15)]"
              >
                Check Availability
                <span className="animate-bounce">↓</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Benefits Row ─────────────────────────────── */}
      <section className="relative border-y border-[#222] bg-[#111]">
        <div className="container-max px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
                  <b.icon className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-white/80 sm:text-sm">{b.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Availability Form ────────────────────────── */}
      <section id="availability" className="relative section-padding overflow-hidden">
        {/* Neon glows */}
        <div className="pointer-events-none absolute -right-60 top-20 h-[500px] w-[500px] rounded-full bg-purple-600/[0.06] blur-[130px]" />
        <div className="pointer-events-none absolute -left-40 bottom-20 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />

        <div className="container-max relative">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Check <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Availability</span>
              </h2>
              <div className="mx-auto mt-4 h-0.5 w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <p className="mt-4 text-white/50">
                Fill out the form below and we&apos;ll confirm availability and pricing within 2 hours.
              </p>
            </div>

            {formState === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-green-500/30 bg-green-500/10 p-10 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Request Received!</h3>
                <p className="mt-3 text-white/60">
                  We&apos;ll confirm availability within 2 hours.
                </p>
                <p className="mt-2 text-white/60">
                  Questions? Call or text{' '}
                  <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`} className="font-semibold text-gold hover:text-gold-light">
                    {BRAND.phone}
                  </a>
                </p>
              </motion.div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                {/* Name / Email / Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/70">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full rounded-lg border border-[#333] bg-[#1A1A1A] px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-lg border border-[#333] bg-[#1A1A1A] px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/70">
                      Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="w-full rounded-lg border border-[#333] bg-[#1A1A1A] px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      placeholder="(702) 555-0100"
                    />
                  </div>
                </div>

                {/* Guest Count / Pickup */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="guestCount" className="mb-1.5 block text-sm font-medium text-white/70">
                      Guest Count <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="guestCount"
                      name="guestCount"
                      required
                      className="w-full appearance-none rounded-lg border border-[#333] bg-[#1A1A1A] px-4 py-3 text-white transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    >
                      <option value="">Select group size</option>
                      {guestOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt} guests</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pickupLocation" className="mb-1.5 block text-sm font-medium text-white/70">
                      Pickup Location
                    </label>
                    <input
                      id="pickupLocation"
                      name="pickupLocation"
                      type="text"
                      className="w-full rounded-lg border border-[#333] bg-[#1A1A1A] px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      placeholder="Hotel name or address"
                    />
                  </div>
                </div>

                {/* Night Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Night Selection <span className="text-red-400">*</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {nightOptions.map((night) => {
                      const isSelected = selectedNights.includes(night)
                      const isBestValue = night.includes('best value')
                      return (
                        <button
                          key={night}
                          type="button"
                          onClick={() => toggleNight(night)}
                          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                            isSelected
                              ? isBestValue
                                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                                : 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                              : 'border-[#333] bg-[#1A1A1A] text-white/70 hover:border-[#555]'
                          } ${isBestValue ? 'sm:col-span-2' : ''}`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                              isSelected
                                ? isBestValue
                                  ? 'border-cyan-500 bg-cyan-500'
                                  : 'border-purple-500 bg-purple-500'
                                : 'border-[#555]'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="font-medium">{night}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-white/70">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full rounded-lg border border-[#333] bg-[#1A1A1A] px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
                    placeholder="Special requests, additional stops, etc."
                  />
                </div>

                {/* Error message */}
                {(formState === 'error' || errorMsg) && (
                  <p className="text-sm text-red-400">{errorMsg}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full rounded-lg bg-gold px-8 py-4 text-base font-bold text-black transition-all hover:bg-gold-light hover:shadow-[0_0_30px_rgba(214,192,138,0.25)] focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formState === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Check Availability →'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────── */}
      <section className="section-padding relative overflow-hidden border-t border-[#222]">
        <div className="pointer-events-none absolute -left-40 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/[0.04] blur-[100px]" />
        <div className="container-max relative">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Frequently Asked <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <div className="mx-auto mt-4 h-0.5 w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>
    </div>
  )
}
