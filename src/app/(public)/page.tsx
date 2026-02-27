import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { TrustSignals } from '@/components/sections/TrustSignals'
import { FleetPreview } from '@/components/sections/FleetPreview'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { CTABanner } from '@/components/sections/CTABanner'
import { BRAND, SERVICE_AREAS } from '@/lib/constants'
import { getVehicles, getServices, getTestimonials } from '@/lib/data'

const Testimonials = dynamic(
  () => import('@/components/sections/Testimonials').then((m) => ({ default: m.Testimonials })),
  {
    loading: () => (
      <div className="section-padding">
        <div className="container-max h-96" />
      </div>
    ),
  }
)

const FAQ = dynamic(
  () => import('@/components/sections/FAQ').then((m) => ({ default: m.FAQ })),
  {
    loading: () => (
      <div className="section-padding">
        <div className="container-max h-96" />
      </div>
    ),
  }
)

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BRAND.siteUrl}/#business`,
  name: BRAND.name,
  description:
    'Premium party bus and limousine rental in Las Vegas. Bachelor & bachelorette parties, weddings, nightlife, corporate events. 8-40 passengers.',
  url: BRAND.siteUrl,
  telephone: BRAND.phone,
  email: BRAND.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Las Vegas',
    addressRegion: 'NV',
    addressCountry: 'US',
  },
  areaServed: SERVICE_AREAS.map((area) => ({
    '@type': 'City',
    name: area,
  })),
  priceRange: '$$-$$$',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '00:00',
    closes: '23:59',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '500',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: [],
}

export default async function HomePage() {
  const [vehicles, services, testimonials] = await Promise.all([
    getVehicles(),
    getServices(),
    getTestimonials(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <TrustSignals />
      <FleetPreview vehicles={vehicles} />
      <ServicesGrid services={services} />
      <Testimonials testimonials={testimonials} />
      <CTABanner />
      <FAQ />
    </>
  )
}
