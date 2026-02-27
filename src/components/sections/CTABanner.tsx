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

      <div className="container-max relative z-10 px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready to Ride Like{' '}
          <span className="gold-gradient-text">Royalty</span>?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Book your Las Vegas party bus or limousine today. Premium vehicles,
          professional chauffeurs, unforgettable experiences.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={`tel:${BRAND.phone.replace(/[^+\d]/g, '')}`}
            className="btn-gold text-base sm:text-lg"
          >
            Call {BRAND.phone}
          </a>
          <Link href="/quote" className="btn-outline border-white/30 text-white hover:border-white hover:bg-white/10 text-base sm:text-lg">
            Get a Quote
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTABanner
