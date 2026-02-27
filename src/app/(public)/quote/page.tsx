import type { Metadata } from 'next'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { getVehicles } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Get a Quote | Las Vegas Party Bus & Limo Pricing',
  description:
    'Request a free quote for party bus and limousine rental in Las Vegas. Bachelor parties, bachelorette parties, weddings, nightlife, corporate events. Fast response within 2 hours.',
  keywords: [
    'party bus quote Las Vegas',
    'limo rental quote Las Vegas',
    'party bus pricing Las Vegas',
    'Las Vegas party bus cost',
    'limousine rental price Las Vegas',
    'bachelor party bus quote',
    'bachelorette party limo quote',
    'wedding limo quote Las Vegas',
  ],
  openGraph: {
    title: 'Get a Quote | American Royalty Las Vegas',
    description:
      'Request a free, no-obligation quote for party bus and limo rental in Las Vegas. We respond within 2 hours.',
  },
}

export default async function QuotePage() {
  const vehicles = await getVehicles()
  const vehicleOptions = vehicles.map((v) => ({
    value: v.slug,
    label: `${v.name} — ${v.type} (up to ${v.capacity} guests)`,
  }))

  return (
    <section className="section-padding pt-32">
      <div className="container-max">
        {/* Page Header */}
        <div className="text-center">
          <SectionTag>Get a Quote</SectionTag>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Get Your Las Vegas Party Bus &{' '}
            <span className="gold-gradient-text">Limo Quote</span>
          </h1>
          <GoldLine className="mx-auto mt-5" width="100px" />
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/50">
            Tell us about your event and we&apos;ll put together a personalized
            quote within 2 hours. No commitment, no pressure &mdash; just royal
            treatment from the start.
          </p>
        </div>

        {/* Quote Form */}
        <div className="mt-14">
          <QuoteForm vehicleOptions={vehicleOptions} />
        </div>
      </div>
    </section>
  )
}
