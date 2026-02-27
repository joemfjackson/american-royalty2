import Link from 'next/link'
import Image from 'next/image'
import { BRAND } from '@/lib/constants'

export function CTABanner() {
  return (
    <section className="relative overflow-hidden">
      {/* Background photo */}
      <Image
        src="/images/gallery/dancing-on-bus.webp"
        alt="Guests dancing and celebrating on an American Royalty party bus"
        fill
        sizes="100vw"
        quality={80}
        loading="lazy"
        className="object-cover"
      />
      {/* Heavy dark overlay */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Gradient styling on top */}
      <div className="absolute inset-0 bg-gradient-to-r from-royal/60 via-royal/40 to-gold/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

      <div className="container-max relative z-10 px-4 py-12 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-4xl">
          Ready to Ride Like{' '}
          <span className="gold-gradient-text">Royalty</span>?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Book your Las Vegas party bus or limousine today. Premium vehicles,
          professional chauffeurs, unforgettable experiences.
        </p>

        {/* Decorative purple-gold line divider */}
        <div className="mx-auto mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-royal/60 to-gold/60" />
          <div className="h-1.5 w-1.5 rotate-45 bg-royal-light shadow-[0_0_6px_rgba(111,45,189,0.6)]" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent via-royal/60 to-gold/60" />
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href={`tel:${BRAND.phone.replace(/[^+\d]/g, '')}`}
            className="btn-gold w-full text-lg font-bold sm:w-auto sm:text-xl lg:text-2xl lg:px-8 lg:py-4"
          >
            Call {BRAND.phone}
          </a>
          <Link
            href="/quote"
            className="btn-outline w-full border-white/30 text-white hover:border-white hover:bg-white/10 text-base sm:w-auto sm:text-lg animate-pulse-glow"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTABanner
