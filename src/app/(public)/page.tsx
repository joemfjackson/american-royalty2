export const revalidate = 60

import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
const TrustSignals = dynamic(
  () => import('@/components/sections/TrustSignals').then((m) => m.TrustSignals),
)

const FleetPreview = dynamic(
  () => import('@/components/sections/FleetPreview').then((m) => m.FleetPreview),
)

const ServicesGrid = dynamic(
  () => import('@/components/sections/ServicesGrid').then((m) => m.ServicesGrid),
)

const PackagesPreview = dynamic(
  () => import('@/components/sections/PackagesPreview').then((m) => m.PackagesPreview),
)

const GoogleReviews = dynamic(
  () => import('@/components/sections/GoogleReviews').then((m) => m.GoogleReviews),
)

const CTABanner = dynamic(
  () => import('@/components/sections/CTABanner').then((m) => m.CTABanner),
)
import { BRAND, SERVICE_AREAS, FAQ_ITEMS } from '@/lib/constants'
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
  sameAs: [],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '8',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    { '@type': 'Review', author: { '@type': 'Person', name: 'Punjabi Refix' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'Booked a party bus for our parents anniversary. Great service and a smooth ride.' },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Edgar Lopez' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: "Las Vegas's limousine service provider. They provided me with an exceptional offer." },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Jenny' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'We had the BEST experience with this party bus! From start to finish, everything was smooth, fun, and very well organized.' },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Terry Gebremichael' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'Thank you Shammi for making my cousin birthday special. We had a blast!!' },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Mulu Mekonen' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'Thank you shammi we had a good time you the best driver thanks again!' },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Jodenne Nunnally' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'Joe was an excellent driver. We did a 2 hour strip tour for my daughters birthday.' },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Jorge Quinonez' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'Excellent service, my driver Joe was great. They drove my daughters quincea\u00f1era party. I highly recommend them.' },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Alex Rodriguez' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'Best limo company in Las Vegas.' },
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <TrustSignals />
      <GoogleReviews />
      <FleetPreview vehicles={vehicles} />
      <ServicesGrid services={services} />
      <PackagesPreview />
      <Testimonials testimonials={testimonials} />
      <CTABanner />
      <FAQ />
    </>
  )
}
