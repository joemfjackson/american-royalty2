import type { Metadata } from 'next'
import { BRAND } from '@/lib/constants'
import { EdcPage } from './EdcPage'

export const metadata: Metadata = {
  title: 'EDC 2026 Party Bus Transportation | Las Vegas Motor Speedway',
  description:
    'Private party bus transportation to Electric Daisy Carnival 2026 at Las Vegas Motor Speedway. Groups of 8-40. Check availability for May 15, 16, 17.',
  openGraph: {
    title: 'EDC 2026 Party Bus Transportation | American Royalty',
    description:
      'Private party bus transportation to Electric Daisy Carnival 2026 at Las Vegas Motor Speedway. Groups of 8-40.',
    url: `${BRAND.siteUrl}/services/edc-2026`,
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Do you provide transportation to EDC Las Vegas?',
    answer:
      'Yes! American Royalty provides private party bus and limousine transportation directly to EDC at Las Vegas Motor Speedway. Our chauffeurs handle all the driving so your group can start the party on the way there.',
  },
  {
    question: 'What hotels do you pick up from for EDC?',
    answer:
      'We pick up from any hotel or address in the Las Vegas area — the Strip, Downtown, Henderson, Summerlin, or wherever your group is staying. Just provide your pickup location when you request availability.',
  },
  {
    question: 'How many people fit on the party bus to EDC?',
    answer:
      'Our fleet accommodates groups of 8 to 40+ passengers. We have stretch limousines for smaller groups and full-size party buses for larger crews. Tell us your group size and we\'ll match you with the right vehicle.',
  },
  {
    question: 'Is round trip included for EDC transportation?',
    answer:
      'Round trip transportation is available. We\'ll drop your group off at Las Vegas Motor Speedway and pick you up when the festival ends. One-way options are also available.',
  },
  {
    question: 'How far in advance should I book EDC transportation?',
    answer:
      'As early as possible — EDC weekends fill up fast. We recommend booking at least 2-4 weeks before the festival to guarantee availability for your preferred vehicle and dates.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'EDC 2026 Party Bus Transportation',
  description:
    'Private party bus and limousine transportation to Electric Daisy Carnival 2026 at Las Vegas Motor Speedway.',
  provider: {
    '@type': 'LocalBusiness',
    name: BRAND.name,
    telephone: BRAND.phone,
  },
  areaServed: {
    '@type': 'City',
    name: 'Las Vegas',
  },
  serviceType: 'Festival Transportation',
}

export default function EdcServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <EdcPage faqItems={faqItems} />
    </>
  )
}
