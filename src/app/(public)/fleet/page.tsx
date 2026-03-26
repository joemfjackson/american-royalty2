export const revalidate = 60

import type { Metadata } from 'next'
import { getVehicles } from '@/lib/data'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { FleetGrid } from '@/components/FleetGrid'

const SITE = 'https://www.americanroyaltylasvegas.com'
const desc = 'Browse the American Royalty fleet of luxury party buses, Sprinter limos, and stretch limousines in Las Vegas. Vehicles from 8 to 40 passengers for bachelor parties, weddings, nightlife, and more.'

export const metadata: Metadata = {
  title: 'Las Vegas Party Bus & Limousine Fleet',
  description: desc,
  keywords: [
    'party bus fleet Las Vegas',
    'Las Vegas limousine fleet',
    'party bus rental Vegas',
    'Sprinter limo Las Vegas',
    'stretch limo rental Las Vegas',
    'luxury party bus Las Vegas',
    'Las Vegas VIP transportation fleet',
  ],
  alternates: { canonical: `${SITE}/fleet` },
  openGraph: {
    title: 'Las Vegas Party Bus & Limousine Fleet | American Royalty',
    description: 'Browse our fleet of luxury party buses, Sprinter limos, and stretch limousines. 8-40 passengers. Book your VIP ride in Las Vegas.',
    url: `${SITE}/fleet`,
    images: [{ url: '/images/fleet/white-bus-casino.webp', width: 1200, height: 630, alt: 'American Royalty party bus fleet in Las Vegas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Las Vegas Party Bus & Limousine Fleet | American Royalty',
    description: desc,
  },
}

export default async function FleetPage() {
  const vehicles = await getVehicles()

  const fleetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'American Royalty Las Vegas Fleet',
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: v.name,
      url: `${SITE}/fleet/${v.slug}`,
      image: v.image_url || '/images/fleet/white-bus-casino.webp',
      description: v.description,
    })),
  }

  return (
    <section className="section-padding overflow-hidden pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fleetJsonLd) }}
      />
      <div className="container-max">
        {/* Page Header */}
        <div className="text-center">
          <SectionTag>Our Fleet</SectionTag>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Las Vegas Party Bus &{' '}
            <span className="gold-gradient-text">Limousine Fleet</span>
          </h1>
          <GoldLine className="mx-auto mt-5" width="100px" />
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80">
            From intimate stretch limousines to our massive 40-passenger party
            buses, every vehicle in the American Royalty fleet is built for the
            ultimate Las Vegas experience. Club-quality sound, LED lighting, wet
            bars, and professional chauffeurs included with every booking.
          </p>
        </div>

        {/* Fleet Grid with Filters */}
        <div className="mt-16">
          <h2 className="sr-only">Available Vehicles</h2>
          <FleetGrid vehicles={vehicles} />
        </div>
      </div>
    </section>
  )
}
