import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Check, Users, Clock, ChevronRight, Phone } from 'lucide-react'
import { getVehicleBySlug, getVehicles } from '@/lib/data'
import { MOCK_VEHICLES, BRAND } from '@/lib/constants'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { Vehicle } from '@/types'

// ---------------------------------------------------------------------------
// Static params for all known vehicle slugs
// ---------------------------------------------------------------------------
export function generateStaticParams() {
  return MOCK_VEHICLES.map((v) => ({ slug: v.slug }))
}

// ---------------------------------------------------------------------------
// Dynamic metadata per vehicle
// ---------------------------------------------------------------------------
type MetadataProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) return { title: 'Vehicle Not Found' }

  return {
    title: `${vehicle.name} - ${vehicle.type} Rental`,
    description: `Rent the ${vehicle.name} ${vehicle.type.toLowerCase()} in Las Vegas. Up to ${vehicle.capacity} passengers, starting at ${formatCurrency(vehicle.hourly_rate)}/hr. ${vehicle.description.slice(0, 120)}`,
    keywords: [
      `${vehicle.name} Las Vegas`,
      `${vehicle.type} rental Las Vegas`,
      `${vehicle.capacity} passenger ${vehicle.type.toLowerCase()} Vegas`,
      'party bus rental Las Vegas',
      'limousine Las Vegas',
    ],
    openGraph: {
      title: `${vehicle.name} | ${vehicle.type} | American Royalty Las Vegas`,
      description: vehicle.description,
    },
  }
}

// ---------------------------------------------------------------------------
// Vehicle image mappings
// ---------------------------------------------------------------------------
const vehicleImages: Record<string, string> = {
  'the-sovereign': '/images/fleet/white-bus-casino.jpg',
  'the-crown-jewel': '/images/fleet/black-bus-mgm.jpg',
  'royal-sprinter': '/images/fleet/interior-pink-blue.jpg',
  'the-monarch': '/images/fleet/interior-blue-led.jpg',
  'black-diamond': '/images/fleet/interior-rainbow.jpg',
  'the-empire': '/images/fleet/white-bus-valet.jpg',
}

const vehicleGallery: Record<string, string[]> = {
  'the-sovereign': [
    '/images/fleet/white-bus-front.jpg',
    '/images/fleet/interior-pink-blue.jpg',
    '/images/fleet/interior-blue-led.jpg',
    '/images/gallery/full-bus-party.jpg',
  ],
  'the-crown-jewel': [
    '/images/fleet/black-bus-mgm-2.jpg',
    '/images/fleet/interior-rainbow.jpg',
    '/images/fleet/interior-rainbow-2.jpg',
    '/images/gallery/celebration-group.jpg',
  ],
  'royal-sprinter': [
    '/images/fleet/interior-blue-led.jpg',
    '/images/fleet/interior-rainbow.jpg',
    '/images/gallery/bachelorette-group.jpg',
    '/images/gallery/bachelor-suits.jpg',
  ],
  'the-monarch': [
    '/images/fleet/interior-pink-blue.jpg',
    '/images/fleet/interior-rainbow.jpg',
    '/images/gallery/dancing-on-bus.jpg',
    '/images/gallery/nightlife-group.jpg',
  ],
  'black-diamond': [
    '/images/fleet/interior-rainbow-2.jpg',
    '/images/fleet/interior-blue-led.jpg',
    '/images/fleet/black-bus-mgm.jpg',
    '/images/gallery/friends-outside-bus.jpg',
  ],
  'the-empire': [
    '/images/fleet/white-bus-front.jpg',
    '/images/fleet/white-bus-casino.jpg',
    '/images/fleet/interior-pink-blue.jpg',
    '/images/gallery/corporate-group.jpg',
  ],
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
type PageProps = { params: Promise<{ slug: string }> }

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) notFound()

  // Related vehicles: different from the current one, limit to 3
  const allVehicles = await getVehicles()
  const related = allVehicles.filter((v) => v.id !== vehicle.id).slice(0, 3)

  // JSON-LD Product schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.name} - ${vehicle.type}`,
    description: vehicle.description,
    brand: {
      '@type': 'Brand',
      name: BRAND.name,
    },
    offers: {
      '@type': 'Offer',
      price: vehicle.hourly_rate,
      priceCurrency: 'USD',
      priceValidUntil: new Date(Date.now() + 90 * 86_400_000)
        .toISOString()
        .split('T')[0],
      availability: 'https://schema.org/InStock',
      url: `${BRAND.siteUrl}/fleet/${vehicle.slug}`,
      unitCode: 'HUR',
      description: `Starting at ${formatCurrency(vehicle.hourly_rate)}/hr with a ${vehicle.min_hours}-hour minimum`,
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Passenger Capacity',
        value: vehicle.capacity,
      },
      {
        '@type': 'PropertyValue',
        name: 'Minimum Hours',
        value: vehicle.min_hours,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="section-padding pt-28">
        <div className="container-max">
          {/* ---- Breadcrumb ---- */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-white/40">
            <Link href="/fleet" className="transition-colors hover:text-gold">
              Fleet
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-white/70">{vehicle.name}</span>
          </nav>

          {/* ---- Hero Section ---- */}
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            {/* Left: Vehicle Image + Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-dark-border">
                <Image
                  src={vehicleImages[vehicle.slug] || '/images/fleet/white-bus-casino.jpg'}
                  alt={`${vehicle.name} - ${vehicle.type} in Las Vegas`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute left-4 top-4">
                  <Badge variant="gold">{vehicle.type}</Badge>
                </div>
              </div>

              {/* Gallery thumbnails */}
              {vehicleGallery[vehicle.slug] && (
                <div className="grid grid-cols-4 gap-2">
                  {vehicleGallery[vehicle.slug].map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-lg border border-dark-border"
                    >
                      <Image
                        src={img}
                        alt={`${vehicle.name} gallery photo ${i + 1}`}
                        fill
                        sizes="(max-width: 1024px) 25vw, 12vw"
                        className="object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Vehicle Info */}
            <div>
              <SectionTag>
                {vehicle.type}
              </SectionTag>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
                {vehicle.name}
              </h1>
              <GoldLine className="mt-4" width="80px" />

              {/* Stats Row */}
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="h-5 w-5 text-gold" aria-hidden="true" />
                  <span>Up to {vehicle.capacity} passengers</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Clock className="h-5 w-5 text-gold" aria-hidden="true" />
                  <span>{vehicle.min_hours} hour minimum</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-6 rounded-xl border border-dark-border bg-dark-card p-5">
                <p className="text-2xl font-bold text-gold">
                  Starting at {formatCurrency(vehicle.hourly_rate)}/hr
                </p>
                <p className="mt-1 text-sm text-white/40">
                  {vehicle.min_hours}-hour minimum &middot; Gratuity not included
                </p>
              </div>

              {/* Description */}
              <p className="mt-6 leading-relaxed text-white/60">
                {vehicle.description}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/quote?vehicle=${vehicle.slug}`}
                  className="btn-gold"
                >
                  Get a Quote for {vehicle.name}
                </Link>
                <a
                  href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn-outline flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call Now
                </a>
              </div>
            </div>
          </div>

          {/* ---- Features Grid ---- */}
          <div className="mt-20">
            <SectionTag>Features & Amenities</SectionTag>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              What&apos;s on Board
            </h2>
            <GoldLine className="mt-4" width="60px" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {vehicle.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-lg border border-dark-border bg-dark-card px-5 py-4"
                >
                  <Check className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span className="text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Related Vehicles ---- */}
          {related.length > 0 && (
            <div className="mt-20">
              <SectionTag>Keep Exploring</SectionTag>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Related Vehicles
              </h2>
              <GoldLine className="mt-4" width="60px" />

              <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rv) => (
                  <Link key={rv.id} href={`/fleet/${rv.slug}`} className="block">
                    <Card hover className="flex h-full flex-col overflow-hidden p-0">
                      {/* Vehicle image */}
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={vehicleImages[rv.slug] || '/images/fleet/white-bus-casino.jpg'}
                          alt={`${rv.name} - ${rv.type}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute right-3 top-3">
                          <Badge variant="gold">{rv.type}</Badge>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-display text-lg font-bold text-white">
                          {rv.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-white/50">
                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                            {rv.capacity}
                          </span>
                          <span className="font-semibold text-gold">
                            {formatCurrency(rv.hourly_rate)}/hr
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  )
}
