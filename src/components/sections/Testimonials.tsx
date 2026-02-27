'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { StarRating } from '@/components/ui/StarRating'
import { MOCK_TESTIMONIALS } from '@/lib/constants'

const testimonials = MOCK_TESTIMONIALS.filter((t) => t.is_active)

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const t = testimonials[current]

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center">
          <SectionTag>Testimonials</SectionTag>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            What Our <span className="gold-gradient-text">Clients</span> Say
          </h2>
          <GoldLine className="mx-auto mt-4" width="80px" />
        </div>

        <div className="relative mx-auto mt-14 max-w-3xl">
          {/* Previous / Next arrows */}
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-dark-border bg-dark-card p-2 text-white/40 transition-colors hover:border-gold/30 hover:text-gold sm:-left-14 sm:block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-dark-border bg-dark-card p-2 text-white/40 transition-colors hover:border-gold/30 hover:text-gold sm:-right-14 sm:block"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Testimonial card */}
          <div className="relative overflow-hidden rounded-xl border border-gold/20 bg-dark-card shadow-[0_0_40px_rgba(214,192,138,0.06)]">
            {/* Gold gradient top border */}
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #6F2DBD, #D6C08A, #6F2DBD)' }}
            />

            <div className="relative px-6 py-10 sm:px-12 sm:py-14">
              {/* Decorative quote marks */}
              <span
                className="pointer-events-none absolute left-4 top-4 select-none text-7xl font-serif leading-none text-gold/[0.08] sm:left-8 sm:top-6 sm:text-8xl"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <span
                className="pointer-events-none absolute bottom-4 right-4 select-none text-7xl font-serif leading-none text-gold/[0.08] sm:bottom-6 sm:right-8 sm:text-8xl"
                aria-hidden="true"
              >
                &rdquo;
              </span>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={t.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="relative z-10 text-center"
                >
                  <StarRating rating={t.rating} className="justify-center text-xl sm:text-2xl" />

                  <blockquote className="mt-6 text-lg italic leading-relaxed text-white/80 sm:text-xl">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>

                  <p className="mt-6 font-semibold text-white">{t.name}</p>
                  {t.event_type && (
                    <p className="mt-1 text-sm text-gold/70">{t.event_type}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile arrows */}
          <div className="mt-4 flex items-center justify-center gap-4 sm:hidden">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-dark-border bg-dark-card text-white/40 transition-colors hover:border-gold/30 hover:text-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-dark-border bg-dark-card text-white/40 transition-colors hover:border-gold/30 hover:text-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-3 sm:gap-2" role="tablist">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={i === current}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => {
                  setDirection(i > current ? 1 : -1)
                  setCurrent(i)
                }}
                className={`h-2.5 rounded-full transition-all duration-300 sm:h-2 ${
                  i === current
                    ? 'w-7 bg-gold sm:w-6'
                    : 'w-2.5 bg-white/20 hover:bg-white/40 sm:w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
