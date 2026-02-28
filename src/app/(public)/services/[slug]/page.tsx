export const revalidate = 60

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronRight, Users, Clock, Star } from 'lucide-react'
import { getServiceBySlug, getServices, getVehicles } from '@/lib/data'
import { BRAND, FAQ_ITEMS } from '@/lib/constants'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { Vehicle } from '@/types'

// ---------------------------------------------------------------------------
// Static params for all known service slugs
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const services = await getServices()
  return services.map((s) => ({ slug: s.slug }))
}

// ---------------------------------------------------------------------------
// Dynamic metadata per service
// ---------------------------------------------------------------------------
type MetadataProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found' }

  // Build a keyword-driven title
  const titleMap: Record<string, string> = {
    'bachelor-party': 'Bachelor Party Bus Rental Las Vegas',
    'bachelorette-party': 'Bachelorette Party Bus & Limo Las Vegas',
    wedding: 'Wedding Limousine & Party Bus Las Vegas',
    nightlife: 'Nightlife & Club Crawl Party Bus Las Vegas',
    corporate: 'Corporate Transportation & Limo Las Vegas',
    birthday: 'Birthday Party Bus Rental Las Vegas',
    prom: 'Prom & Homecoming Limo Las Vegas',
    airport: 'Airport Limo & Car Service Las Vegas',
    'strip-tour': 'Las Vegas Strip Tour Party Bus & Limo',
  }

  const title = titleMap[slug] || `${service.title} | Las Vegas`

  return {
    title,
    description: `${service.description} ${service.keywords}`,
    keywords: service.keywords.split(', '),
    openGraph: {
      title: `${title} | American Royalty`,
      description: service.description,
      url: `${BRAND.siteUrl}/services/${service.slug}`,
    },
  }
}

// ---------------------------------------------------------------------------
// Service hero images
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Vehicle image mapping
// ---------------------------------------------------------------------------
const vehicleImages: Record<string, string> = {
  'the-sovereign': '/images/fleet/white-bus-casino.webp',
  'the-crown-jewel': '/images/fleet/black-bus-mgm.webp',
  'royal-sprinter': '/images/fleet/interior-pink-blue.webp',
  'the-monarch': '/images/fleet/interior-blue-led.webp',
  'black-diamond': '/images/fleet/interior-rainbow.webp',
  'the-empire': '/images/fleet/white-bus-valet.webp',
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
type PageProps = { params: Promise<{ slug: string }> }

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const vehicles = await getVehicles()

  // Pick a subset of FAQ items relevant to most services
  const faqSubset = FAQ_ITEMS.slice(0, 4)

  // JSON-LD Service schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: BRAND.name,
      url: BRAND.siteUrl,
      telephone: BRAND.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Las Vegas',
        addressRegion: 'NV',
        addressCountry: 'US',
      },
    },
    areaServed: {
      '@type': 'City',
      name: 'Las Vegas',
      sameAs: 'https://en.wikipedia.org/wiki/Las_Vegas',
    },
    url: `${BRAND.siteUrl}/services/${service.slug}`,
  }

  // FAQ JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSubset.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  // Split long_description into paragraphs on double newlines
  const paragraphs = service.long_description
    .split('\n\n')
    .filter((p) => p.trim().length > 0)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ---- Hero Banner Image ---- */}
      {serviceImages[slug] && (
        <div className="relative h-64 w-full sm:h-80 lg:h-96">
          <Image
            src={serviceImages[slug]}
            alt={`${service.title} party bus service in Las Vegas`}
            fill
            sizes="100vw"
            className="object-cover object-[center_20%]"
            priority
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
          <div className="absolute inset-0 flex items-end">
            <div className="container-max px-4 pb-8 sm:px-6 lg:px-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-gold/80">
                {service.icon} {service.title}
              </p>
            </div>
          </div>
        </div>
      )}

      <article className="section-padding pt-10">
        <div className="container-max">
          {/* ---- Breadcrumb ---- */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-sm text-white/40"
          >
            <Link href="/services" className="transition-colors hover:text-gold">
              Services
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-white/70">{service.title}</span>
          </nav>

          {/* ---- Hero Section ---- */}
          <div className="max-w-4xl">
            <SectionTag>
              {service.icon} {service.title}
            </SectionTag>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
              {(() => {
                const titleMap: Record<string, { before: string; gold: string }> = {
                  'bachelor-party': {
                    before: 'Bachelor Party Bus',
                    gold: 'Rental Las Vegas',
                  },
                  'bachelorette-party': {
                    before: 'Bachelorette Party',
                    gold: 'Bus & Limo Las Vegas',
                  },
                  wedding: {
                    before: 'Wedding Transportation',
                    gold: 'in Las Vegas',
                  },
                  nightlife: {
                    before: 'Nightlife & Club Crawl',
                    gold: 'Party Bus Las Vegas',
                  },
                  corporate: {
                    before: 'Corporate',
                    gold: 'Transportation Las Vegas',
                  },
                  birthday: {
                    before: 'Birthday Party Bus',
                    gold: 'Rental Las Vegas',
                  },
                  prom: {
                    before: 'Prom & Homecoming',
                    gold: 'Limo Las Vegas',
                  },
                  airport: {
                    before: 'Airport Limo &',
                    gold: 'Car Service Las Vegas',
                  },
                  'strip-tour': {
                    before: 'Las Vegas Strip Tour',
                    gold: 'Party Bus & Limo',
                  },
                }
                const parts = titleMap[slug] || {
                  before: service.title,
                  gold: 'in Las Vegas',
                }
                return (
                  <>
                    {parts.before}{' '}
                    <span className="gold-gradient-text">{parts.gold}</span>
                  </>
                )
              })()}
            </h1>
            <GoldLine className="mt-5" width="100px" />
            <p className="mt-6 text-lg font-medium italic text-gold">
              {service.tagline}
            </p>
          </div>

          {/* ---- Long Description ---- */}
          <div className="mt-12 max-w-4xl space-y-5">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className="leading-relaxed text-white/60"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* ---- Recommended Vehicles ---- */}
          <div className="mt-20">
            <SectionTag>Recommended Vehicles</SectionTag>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Choose Your{' '}
              <span className="gold-gradient-text">Ride</span>
            </h2>
            <GoldLine className="mt-4" width="60px" />
            <p className="mt-4 max-w-2xl text-white/50">
              Every vehicle in our fleet is ideal for{' '}
              {service.title.toLowerCase()}. Pick the one that fits your group
              size and style.
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/fleet/${vehicle.slug}`}
                  className="group block"
                >
                  <Card
                    hover
                    className="flex h-full flex-col overflow-hidden p-0 transition-all duration-300 group-hover:-translate-y-1"
                  >
                    {/* Vehicle image */}
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={vehicleImages[vehicle.slug] || '/images/fleet/white-bus-casino.webp'}
                        alt={`${vehicle.name} - ${vehicle.type}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute right-3 top-3">
                        <Badge variant="gold">{vehicle.type}</Badge>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-display text-lg font-bold text-white">
                        {vehicle.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-white/50">
                          <Users
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Up to {vehicle.capacity}
                        </span>
                        <span className="flex items-center gap-1 text-white/50">
                          <Clock
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          {vehicle.min_hours}hr min
                        </span>
                        <span className="font-semibold text-gold">
                          {formatCurrency(vehicle.hourly_rate)}/hr
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-white/40">
                        {vehicle.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* ---- CTA Section ---- */}
          <div className="mt-14 rounded-2xl border border-gold/20 bg-gradient-to-br from-dark-card via-royal/5 to-dark-card p-6 text-center sm:mt-20 sm:p-10 md:p-14">
            <Star className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Ready to Book Your{' '}
              <span className="gold-gradient-text">{service.title}</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/50">
              Get a personalized quote in minutes. Tell us about your event and
              we&apos;ll recommend the perfect vehicle and package for your
              group.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href={`/quote?event=${service.slug}`}
                className="btn-gold w-full sm:w-auto"
              >
                Get a Free Quote
              </Link>
              <a
                href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`}
                className="btn-outline w-full sm:w-auto"
              >
                Call {BRAND.phone}
              </a>
            </div>
          </div>

          {/* ---- FAQ Section ---- */}
          <div className="mt-20">
            <SectionTag>Frequently Asked Questions</SectionTag>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Common Questions About{' '}
              <span className="gold-gradient-text">{service.title}</span>
            </h2>
            <GoldLine className="mt-4" width="60px" />

            <div className="mt-8 space-y-4">
              {faqSubset.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-dark-border bg-dark-card"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-semibold text-white transition-colors hover:text-gold [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-gold/50 transition-transform duration-200 group-open:rotate-90"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-6 pb-5 leading-relaxed text-white/50">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* ---- Back to all services ---- */}
          <div className="mt-16 text-center">
            <Link
              href="/services"
              className="btn-outline"
            >
              View All Services
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
