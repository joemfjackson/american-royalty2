'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoldLine } from '@/components/ui/GoldLine'

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/American+Royalty/@36.0496103,-115.145409,10z/data=!4m18!1m9!3m8!1s0xaaf2d891a4939ebf:0xb2cb8292f96eb7e5!2sAmerican+Royalty!8m2!3d36.0561135!4d-115.0880966!9m1!1b1!16s%2Fg%2F11z1sr8qh2!3m7!1s0xaaf2d891a4939ebf:0xb2cb8292f96eb7e5!8m2!3d36.0561135!4d-115.0880966!9m1!1b1!16s%2Fg%2F11z1sr8qh2?entry=ttu&g_ep=EgoyMDI2MDQxNS4wIKXMDSoASAFQAw%3D%3D'

const AUTO_PLAY_MS = 5000

function GoogleG({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

const reviews = [
  {
    name: 'Punjabi Refix',
    rating: 5,
    date: '1 month ago',
    text: 'Booked a party bus for our parents anniversary. Great service and a smooth ride. Shami is the best and we will definitely be using his services again!!',
  },
  {
    name: 'Edgar Lopez',
    rating: 5,
    date: '1 day ago',
    text: "Las Vegas's limousine service provider. They provided me with an exceptional offer, and their fleet consists of new vehicles that are impeccably clean and exude a high level of professionalism.",
  },
  {
    name: 'Jenny',
    rating: 5,
    date: '1 week ago',
    text: 'We had the BEST experience with this party bus! From start to finish, everything was smooth, fun, and very well organized. Joe took such great care of us and truly made the whole night unforgettable. The vibes were perfect, the music was on point.',
  },
  {
    name: 'Terry Gebremichael',
    rating: 5,
    date: '1 week ago',
    text: 'Thank you Shammi for making my cousin birthday special. We had a blast!!',
  },
  {
    name: 'Mulu Mekonen',
    rating: 5,
    date: '2 weeks ago',
    text: 'Thank you shammi we had a good time you the best driver thanks again!',
  },
  {
    name: 'Jodenne Nunnally',
    rating: 5,
    date: '4 weeks ago',
    text: 'Joe was an excellent driver. We did a 2 hour strip tour for my daughters birthday. They gave us a great price for the party bus. I would book them every time I need a party bus. Thank you guys.',
  },
  {
    name: 'Jorge Quinonez',
    rating: 5,
    date: '1 month ago',
    text: "Excellent service, my driver Joe was great. Gave us a 4 hour tour on the strip. They drove my daughters quincea\u00f1era party. I highly recommend them. Thank you guys.",
  },
  {
    name: 'Alex Rodriguez',
    rating: 5,
    date: '2 weeks ago',
    text: 'Thanks brother, best limo company in Las Vegas.',
  },
]

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  const [expanded, setExpanded] = useState(false)
  const needsTruncate = review.text.length > 120
  const displayText = !expanded && needsTruncate ? review.text.slice(0, 120) + '...' : review.text

  return (
    <div className="flex h-full flex-col rounded-xl border border-gold/15 bg-[#18181B] p-5">
      {/* Header: avatar + name + date */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-sm font-bold text-black">
          {review.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{review.name}</p>
          <p className="text-xs text-white/40">{review.date}</p>
        </div>
      </div>

      {/* Stars */}
      <div className="mt-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="h-4 w-4 text-gold" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Review text */}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">
        {displayText}
        {needsTruncate && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="ml-1 font-medium text-gold hover:text-gold-light"
          >
            more
          </button>
        )}
      </p>

      {/* Google G icon */}
      <div className="mt-3 flex justify-end">
        <GoogleG className="h-4 w-4 opacity-40" />
      </div>
    </div>
  )
}

function useVisibleCount() {
  const [count, setCount] = useState(3)

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setCount(1)
      else if (window.innerWidth < 1024) setCount(2)
      else setCount(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}

export function GoogleReviews() {
  const visibleCount = useVisibleCount()
  const maxIndex = reviews.length - visibleCount
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(index, maxIndex)))
  }, [maxIndex])

  const next = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // Keep current in bounds when visibleCount changes
  useEffect(() => {
    if (current > maxIndex) setCurrent(maxIndex)
  }, [current, maxIndex])

  // Auto-play
  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(next, AUTO_PLAY_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, next])

  // Dot count = number of positions
  const dotCount = maxIndex + 1

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Purple ambient glow */}
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-royal/[0.05] blur-[120px]" />

      <div className="container-max relative">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <GoogleG className="h-7 w-7" />
            <span className="text-2xl font-bold text-gold">5.0</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-5 w-5 text-gold" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            <span className="gold-gradient-text">Google Reviews</span>
          </h2>
          <GoldLine className="mx-auto mt-4" width="80px" />
          <p className="mx-auto mt-4 max-w-lg text-white/50">
            See what our customers are saying
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Arrow buttons */}
          <button
            onClick={prev}
            aria-label="Previous reviews"
            className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-dark-border bg-dark-card/80 text-white/60 backdrop-blur-sm transition-colors hover:border-gold/30 hover:text-gold sm:-left-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next reviews"
            className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-dark-border bg-dark-card/80 text-white/60 backdrop-blur-sm transition-colors hover:border-gold/30 hover:text-gold sm:-right-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Slide track */}
          <div className="overflow-hidden px-2">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${current * (100 / visibleCount)}%)`,
              }}
            >
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="shrink-0 px-2.5"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-gold'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2"
          >
            <GoogleG className="h-4 w-4" />
            Read All Reviews on Google
          </a>
        </div>
      </div>
    </section>
  )
}

export default GoogleReviews
