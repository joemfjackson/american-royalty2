import { Hero } from '@/components/sections/Hero'
import { TrustSignals } from '@/components/sections/TrustSignals'
import { FleetPreview } from '@/components/sections/FleetPreview'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { Testimonials } from '@/components/sections/Testimonials'
import { CTABanner } from '@/components/sections/CTABanner'
import { FAQ } from '@/components/sections/FAQ'
import { BRAND, SERVICE_AREAS } from '@/lib/constants'

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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <TrustSignals />
      <FleetPreview />
      <ServicesGrid />
      <Testimonials />
      <CTABanner />
      <FAQ />
    </>
  )
}
