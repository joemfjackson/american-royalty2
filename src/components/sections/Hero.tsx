'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background photo */}
      <Image
        src="/images/hero/bus-exterior-casino.jpg"
        alt="American Royalty white party bus at a Las Vegas casino"
        fill
        sizes="100vw"
        className="object-cover"
        priority
        quality={85}
      />

      {/* Dark overlay for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

      {/* Accent radial glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/15 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[100px]" />
        <div className="absolute left-1/4 top-2/3 h-[300px] w-[300px] rounded-full bg-royal/10 blur-[80px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(214,192,138,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(214,192,138,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container-max relative z-10 px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8 flex justify-center"
        >
          <Image
            src="/images/logo.png"
            alt="American Royalty"
            width={280}
            height={112}
            className="h-24 w-auto sm:h-28 md:h-32"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
        >
          <p className="section-tag mb-6">Las Vegas Premium Transportation</p>
        </motion.div>

        <motion.h1
          className="mx-auto max-w-5xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          Las Vegas{' '}
          <span className="gold-gradient-text">Party Bus</span> &{' '}
          <span className="gold-gradient-text">Limousine</span> Service
        </motion.h1>

        <motion.p
          className="mx-auto mt-4 text-xl font-light tracking-widest uppercase text-gold/80 sm:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
        >
          Ride Like Royalty
        </motion.p>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
        >
          Premium VIP transportation for bachelor and bachelorette parties,
          weddings, nightlife, corporate events, and more. Luxury fleet
          accommodating 8&ndash;40 guests across the Las Vegas valley.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: 'easeOut' }}
        >
          <Link href="/quote" className="btn-gold text-base sm:text-lg">
            Get a Quote
          </Link>
          <Link href="/fleet" className="btn-outline text-base sm:text-lg">
            View Our Fleet
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade to black */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  )
}

export default Hero
