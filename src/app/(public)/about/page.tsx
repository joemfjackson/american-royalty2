import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Shield, Car, Clock, MapPin, Crown, Star, Users, Award } from 'lucide-react'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { Card } from '@/components/ui/Card'
import { BRAND, SERVICE_AREAS } from '@/lib/constants'

const experienceGallery = [
  { src: '/images/gallery/bachelorette-group.webp', alt: 'Bachelorette party group celebrating on party bus' },
  { src: '/images/gallery/bachelor-suits.webp', alt: 'Bachelor party group in suits on party bus' },
  { src: '/images/gallery/corporate-group.webp', alt: 'Corporate team event on party bus' },
  { src: '/images/gallery/full-bus-party.webp', alt: 'Full bus of guests partying in Las Vegas' },
  { src: '/images/gallery/friends-outside-bus.webp', alt: 'Friends group photo outside American Royalty party bus' },
  { src: '/images/gallery/wedding-on-bus.webp', alt: 'Wedding couple celebrating on party bus' },
]

export const metadata: Metadata = {
  title: 'About American Royalty | Las Vegas Party Bus & Limo',
  description:
    'Learn about American Royalty, Las Vegas\'s premier party bus and limousine company. Professional chauffeurs, premium fleet, 24/7 availability, and deep Las Vegas expertise.',
  keywords: [
    'about American Royalty',
    'Las Vegas party bus company',
    'Las Vegas limo company',
    'luxury transportation Las Vegas',
    'party bus rental company Vegas',
    'professional chauffeurs Las Vegas',
  ],
  openGraph: {
    title: 'About American Royalty | Las Vegas Party Bus & Limo',
    description:
      'Las Vegas\'s premier party bus and limousine company. Premium fleet, professional chauffeurs, and 24/7 availability for every occasion.',
  },
}

const whyChooseUs = [
  {
    icon: Shield,
    title: 'Professional Chauffeurs',
    description:
      'Background-checked, formally trained, and deeply knowledgeable about every venue, route, and shortcut in Las Vegas. Our drivers elevate the experience.',
  },
  {
    icon: Car,
    title: 'Premium Fleet',
    description:
      'Meticulously maintained party buses and limousines equipped with club-quality sound, LED lighting, wet bars, and premium amenities.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description:
      'Las Vegas never sleeps, and neither do we. Book anytime, ride anytime. Our team is available around the clock for reservations and support.',
  },
  {
    icon: MapPin,
    title: 'Vegas Experts',
    description:
      'We know every club, restaurant, and hidden gem in the city. Our local expertise means your group gets the VIP treatment everywhere you go.',
  },
]

const stats = [
  { value: '500+', label: 'Events Served' },
  { value: '4.9', label: 'Average Rating' },
  { value: '6', label: 'Premium Vehicles' },
  { value: '24/7', label: 'Availability' },
]

export default function AboutPage() {
  return (
    <section className="section-padding pt-32">
      <div className="container-max">
        {/* Page Header */}
        <div className="text-center">
          <SectionTag>About Us</SectionTag>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            About{' '}
            <span className="gold-gradient-text">American Royalty</span>
          </h1>
          <GoldLine className="mx-auto mt-5" width="100px" />
        </div>

        {/* Company Story */}
        <div className="mx-auto mt-14 max-w-4xl space-y-6 text-lg leading-relaxed text-white/60">
          <p>
            American Royalty was founded on a simple belief: every celebration
            in Las Vegas deserves to feel legendary. What started as a passion
            for connecting people with unforgettable experiences has grown into
            one of the city&apos;s most trusted luxury transportation
            providers &mdash; serving bachelor and bachelorette parties,
            weddings, corporate events, nightlife adventures, and everything in
            between.
          </p>
          <p>
            Based in the heart of Las Vegas, our team brings deep local
            expertise and genuine hospitality to every booking. We&apos;ve
            spent years building relationships with the best clubs, venues, and
            restaurants on the Strip and beyond. That insider knowledge means
            your group doesn&apos;t just get a ride &mdash; you get a curated,
            VIP experience from start to finish.
          </p>
          <p>
            Our fleet of premium party buses and limousines is the backbone of
            what we do. Every vehicle is meticulously maintained, detailed
            before each trip, and equipped with top-tier amenities: concert-
            grade sound systems, LED and laser lighting, champagne bars, and
            spacious interiors designed for the ultimate celebration. From an
            intimate group of 8 to a full crew of 40, we have the perfect ride
            for your occasion.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card-dark p-6 text-center">
              <p className="text-3xl font-bold text-gold">{stat.value}</p>
              <p className="mt-1 text-sm text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* See the Experience Gallery */}
        <div className="mt-16 sm:mt-28">
          <div className="text-center">
            <SectionTag>Gallery</SectionTag>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
              See the{' '}
              <span className="gold-gradient-text">Experience</span>
            </h2>
            <GoldLine className="mx-auto mt-5" width="80px" />
            <p className="mx-auto mt-4 max-w-2xl text-white/50">
              From bachelorette parties to corporate events, here is what it
              looks like to ride with American Royalty.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {experienceGallery.map((photo) => (
              <div
                key={photo.src}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-dark-border"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/10" />
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-16 sm:mt-28">
          <div className="text-center">
            <SectionTag>Why Choose Us</SectionTag>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
              The{' '}
              <span className="gold-gradient-text">American Royalty</span>{' '}
              Difference
            </h2>
            <GoldLine className="mx-auto mt-5" width="80px" />
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <Card key={item.title} className="p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
                  <item.icon className="h-8 w-8 text-gold" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Values */}
        <div className="mt-16 sm:mt-28">
          <div className="text-center">
            <SectionTag>Our Values</SectionTag>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
              What Drives{' '}
              <span className="gold-gradient-text">Everything We Do</span>
            </h2>
            <GoldLine className="mx-auto mt-5" width="80px" />
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2">
            {[
              {
                icon: Crown,
                title: 'VIP Treatment for Everyone',
                text: 'Whether you\'re booking a 2-hour airport transfer or a 10-hour bachelor party, every client receives the same level of attention, care, and professionalism.',
              },
              {
                icon: Star,
                title: 'Excellence in Every Detail',
                text: 'From the polish on our vehicles to the professionalism of our chauffeurs, we obsess over the details so you can focus on having the time of your life.',
              },
              {
                icon: Users,
                title: 'People-First Approach',
                text: 'We\'re in the business of creating memories. Our team genuinely cares about making your event special and goes above and beyond to deliver.',
              },
              {
                icon: Award,
                title: 'Safety Without Compromise',
                text: 'Every vehicle is fully insured and DOT-compliant. Every driver is background-checked, drug-tested, and formally trained. Your safety is non-negotiable.',
              },
            ].map((value) => (
              <div key={value.title} className="card-dark flex gap-5 p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-royal/20">
                  <value.icon className="h-6 w-6 text-royal-light" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {value.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Areas */}
        <div className="mt-16 sm:mt-28">
          <div className="text-center">
            <SectionTag>Service Areas</SectionTag>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Where We{' '}
              <span className="gold-gradient-text">Serve</span>
            </h2>
            <GoldLine className="mx-auto mt-5" width="80px" />
            <p className="mx-auto mt-6 max-w-2xl text-white/50">
              We cover the entire Las Vegas valley and surrounding areas.
              Custom routes to Red Rock Canyon, Lake Las Vegas, and the Hoover
              Dam are also available.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {SERVICE_AREAS.map((area) => (
              <div
                key={area}
                className="flex items-center gap-2 rounded-lg border border-dark-border bg-dark-card/50 px-3 py-2.5 sm:px-4 sm:py-3"
              >
                <MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span className="truncate text-xs text-white/70 sm:text-sm">{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Licensing & Insurance */}
        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-gold/10 bg-gold/5 p-6 text-center sm:mt-20 sm:p-8">
          <Shield className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
          <h3 className="mt-4 text-xl font-bold text-white">
            Licensed, Insured & DOT Compliant
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            American Royalty is fully licensed by the Nevada Transportation
            Authority, carries comprehensive commercial insurance, and
            maintains full DOT compliance. All chauffeurs undergo background
            checks, drug testing, and professional training. Your safety and
            peace of mind are guaranteed.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center sm:mt-20">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to{' '}
            <span className="gold-gradient-text">Ride Like Royalty</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/50">
            Get a personalized quote for your Las Vegas event. No commitment,
            no pressure &mdash; just first-class service from start to finish.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/quote" className="btn-gold">
              Get a Free Quote
            </Link>
            <a href={`tel:${BRAND.phone}`} className="btn-outline">
              Call {BRAND.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
