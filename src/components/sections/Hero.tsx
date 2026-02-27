'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background photo */}
      <Image
        src="/images/hero/bus-exterior-casino.webp"
        alt="American Royalty white party bus at a Las Vegas casino"
        fill
        sizes="100vw"
        className="object-cover"
        priority
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAEAAQDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAFRABAAAAAAAAAAAAAAAAAAAABf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKyAP//Z"
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
        {/* Logo — CSS animation, no JS dependency */}
        <div className="mb-6 flex justify-center animate-hero-fade-in" style={{ animationDelay: '0s' }}>
          <Image
            src="/images/logo.png"
            alt="American Royalty"
            width={280}
            height={112}
            className="h-20 w-auto sm:h-28 md:h-32"
            priority
          />
        </div>

        <p className="section-tag mb-4 animate-hero-fade-in sm:mb-6" style={{ animationDelay: '0.1s' }}>
          Las Vegas Premium Transportation
        </p>

        <h1
          className="mx-auto max-w-5xl text-3xl font-bold leading-tight tracking-tight animate-hero-fade-in sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ animationDelay: '0.15s' }}
        >
          Las Vegas{' '}
          <span className="gold-gradient-text-shimmer">Party Bus</span> &{' '}
          <span className="gold-gradient-text-shimmer">Limousine</span> Service
        </h1>

        <p
          className="mx-auto mt-3 text-lg font-light tracking-widest uppercase text-gold/80 animate-hero-fade-in sm:mt-4 sm:text-2xl"
          style={{ animationDelay: '0.3s' }}
        >
          Ride Like Royalty
        </p>

        <p
          className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 animate-hero-fade-in sm:mt-6 sm:text-lg"
          style={{ animationDelay: '0.45s' }}
        >
          Premium VIP transportation for bachelor and bachelorette parties,
          weddings, nightlife, corporate events, and more. Luxury fleet
          accommodating 8&ndash;40 guests across the Las Vegas valley.
        </p>

        <div
          className="mt-8 flex flex-col items-center justify-center gap-3 animate-hero-fade-in sm:mt-10 sm:flex-row sm:gap-4"
          style={{ animationDelay: '0.6s' }}
        >
          <Link
            href="/quote"
            className="btn-gold w-full text-base sm:w-auto sm:text-lg lg:px-8 lg:py-4 lg:text-xl transition-shadow hover:shadow-[0_0_30px_rgba(214,192,138,0.4)]"
          >
            Get a Quote
          </Link>
          <Link
            href="/fleet"
            className="btn-outline w-full text-base sm:w-auto sm:text-lg lg:px-8 lg:py-4 lg:text-xl transition-shadow hover:shadow-[0_0_30px_rgba(111,45,189,0.35)]"
          >
            View Our Fleet
          </Link>
        </div>
      </div>

      {/* Bottom fade to black */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />

      {/* Scroll-down indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-hero-fade-in" style={{ animationDelay: '1.2s' }}>
        <a
          href="#trust-signals"
          aria-label="Scroll down"
          className="flex flex-col items-center gap-1 text-gold/60 transition-colors hover:text-gold"
        >
          <span className="text-[10px] uppercase tracking-[2px]">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce-gentle" />
        </a>
      </div>
    </section>
  )
}

export default Hero
