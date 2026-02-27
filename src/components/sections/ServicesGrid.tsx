'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { MOCK_SERVICES } from '@/lib/constants'
import type { Service } from '@/types'

const serviceImages: Record<string, string> = {
  'bachelor-party': '/images/services/bachelor.webp',
  'bachelorette-party': '/images/services/bachelorette.webp',
  wedding: '/images/services/wedding.webp',
  nightlife: '/images/services/nightlife.webp',
  corporate: '/images/services/corporate.webp',
  birthday: '/images/services/birthday.webp',
  prom: '/images/services/prom.webp',
  airport: '/images/services/airport.webp',
  'strip-tour': '/images/services/strip-tour.webp',
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-royal/20 bg-dark-card shadow-[0_8px_30px_rgba(111,45,189,0.18),0_2px_8px_rgba(0,0,0,0.4)] -translate-y-0.5 transition-all duration-300 sm:translate-y-0 sm:border-dark-border sm:shadow-none sm:hover:-translate-y-1 sm:hover:border-royal/30 sm:hover:shadow-[0_12px_40px_rgba(111,45,189,0.2),0_4px_12px_rgba(0,0,0,0.4)]">
        {/* Purple-gold gradient top accent — always visible on mobile */}
        <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-gradient-to-r from-royal via-gold/60 to-royal sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100" />
        {/* Service thumbnail */}
        {serviceImages[service.slug] && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={serviceImages[service.slug]}
              alt={`${service.title} service in Las Vegas`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Enhanced gradient overlay that blends into card */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/30 to-transparent" />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          {/* Emoji in gold-tinted circle */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
            <span className="text-3xl" role="img" aria-label={service.title}>
              {service.icon}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-bold text-white">{service.title}</h3>

          <p className="mt-1 text-sm font-medium text-gold/70">
            {service.tagline}
          </p>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">
            {service.description}
          </p>

          <Link
            href={`/services/${service.slug}`}
            className="group/link mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold transition-colors group-hover:text-gold-light"
          >
            Learn More
            <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-1.5">&rarr;</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export function ServicesGrid() {
  return (
    <section className="section-padding bg-dark/50 relative overflow-hidden">
      {/* Purple ambient glow */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-royal/[0.05] blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-royal/[0.04] blur-[100px]" />
      <div className="container-max relative">
        <div className="text-center">
          <SectionTag>Our Services</SectionTag>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Premium{' '}
            <span className="gold-gradient-text">Transportation Services</span>
          </h2>
          <GoldLine className="mx-auto mt-4" width="80px" />
          <p className="mx-auto mt-4 max-w-2xl text-white/50">
            Whatever the occasion, American Royalty has the perfect ride. Every
            booking includes a professional chauffeur and a vehicle detailed to
            perfection.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesGrid
