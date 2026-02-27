import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Crown, Shield, Star, MapPin } from 'lucide-react'
import { getServices } from '@/lib/data'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Party Bus & Limo Services in Las Vegas',
  description:
    'Luxury party bus and limousine services in Las Vegas. Bachelor & bachelorette parties, weddings, nightlife club crawls, corporate events, airport transfers, and more. Book American Royalty today.',
  keywords: [
    'party bus services Las Vegas',
    'limousine services Las Vegas',
    'bachelor party bus Vegas',
    'bachelorette party limo Vegas',
    'wedding transportation Las Vegas',
    'nightlife party bus Las Vegas',
    'corporate limo Las Vegas',
    'airport transfer Las Vegas',
    'Las Vegas Strip tour',
  ],
  openGraph: {
    title: 'Party Bus & Limo Services in Las Vegas | American Royalty',
    description:
      'Luxury party bus and limo services for every occasion. Bachelor parties, weddings, nightlife, corporate events, and more in Las Vegas.',
  },
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <section className="section-padding pt-32">
      <div className="container-max">
        {/* Page Header */}
        <div className="text-center">
          <SectionTag>Our Services</SectionTag>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Party Bus & Limo{' '}
            <span className="gold-gradient-text">Services in Las Vegas</span>
          </h1>
          <GoldLine className="mx-auto mt-5" width="100px" />
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/50">
            From epic bachelor parties to elegant wedding transportation,
            American Royalty delivers VIP experiences for every occasion. Our
            luxury fleet and professional chauffeurs ensure your Las Vegas event
            is nothing short of legendary.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group block"
            >
              <Card
                hover
                className="flex h-full flex-col p-8 transition-all duration-300 group-hover:-translate-y-1"
              >
                {/* Icon */}
                <span
                  className="text-5xl"
                  role="img"
                  aria-label={service.title}
                >
                  {service.icon}
                </span>

                {/* Title */}
                <h3 className="mt-5 text-xl font-bold text-white">
                  {service.title}
                </h3>

                {/* Tagline */}
                <p className="mt-2 text-sm font-medium italic text-gold">
                  {service.tagline}
                </p>

                {/* Description */}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">
                  {service.description}
                </p>

                {/* Learn More link */}
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold transition-all group-hover:gap-3">
                  Learn More
                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
              </Card>
            </Link>
          ))}
        </div>

        {/* Why Choose American Royalty - SEO Content */}
        <div className="mt-28">
          <div className="text-center">
            <SectionTag>Why Choose Us</SectionTag>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Why Choose{' '}
              <span className="gold-gradient-text">American Royalty</span>
            </h2>
            <GoldLine className="mx-auto mt-5" width="80px" />
          </div>

          {/* Feature highlights */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Crown,
                title: 'VIP Treatment',
                text: 'Every guest is treated like royalty from booking to drop-off',
              },
              {
                icon: Shield,
                title: 'Licensed & Insured',
                text: 'Fully licensed, insured, and DOT-compliant for your safety',
              },
              {
                icon: Star,
                title: '5-Star Rated',
                text: 'Hundreds of 5-star reviews from satisfied clients',
              },
              {
                icon: MapPin,
                title: 'Vegas Experts',
                text: 'Our drivers know every venue, route, and shortcut in Las Vegas',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10">
                  <item.icon className="h-7 w-7 text-gold" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/50">{item.text}</p>
              </div>
            ))}
          </div>

          {/* SEO paragraphs */}
          <div className="mx-auto mt-16 max-w-4xl space-y-6 text-white/50 leading-relaxed">
            <p>
              American Royalty is Las Vegas&apos;s premier luxury transportation
              provider, specializing in party buses and limousines for every
              occasion. Whether you&apos;re planning a wild bachelor party on
              the Strip, an elegant wedding with seamless logistics, or a
              corporate event that impresses clients, our fleet and team deliver
              an unmatched experience.
            </p>
            <p>
              What sets us apart is our attention to detail. Every vehicle in our
              fleet is meticulously maintained and equipped with club-quality
              sound systems, LED lighting, wet bars, and premium amenities.
              Our professional chauffeurs are background-checked, formally
              dressed, and deeply knowledgeable about Las Vegas venues,
              restaurants, and nightlife hotspots.
            </p>
            <p>
              We serve the entire Las Vegas valley &mdash; from the world-famous
              Strip and Downtown Fremont Street to Henderson, Summerlin, North
              Las Vegas, and Harry Reid International Airport. Custom routes to
              Red Rock Canyon, Lake Las Vegas, and the Hoover Dam are also
              available for groups looking to explore beyond the city.
            </p>
            <p>
              With vehicles accommodating 8 to 40 passengers and transparent
              pricing starting at $125/hour, American Royalty makes it easy to
              ride like royalty without the guesswork. Request a free quote today
              and discover why hundreds of Las Vegas visitors choose us for their
              most important celebrations.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/quote" className="btn-gold">
              Get a Free Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
