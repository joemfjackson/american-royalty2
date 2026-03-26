import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Check, ArrowRight, ChevronDown } from 'lucide-react'
import { PACKAGES, PACKAGE_GENERAL_FAQS } from '@/lib/packages'

const SITE = 'https://www.americanroyaltylasvegas.com'
const desc =
  'Book a Las Vegas party bus package online. Vegas Sign photo tours, Fremont Street experience, Strip cruises, and late night tours. All-inclusive pricing for groups of 1-40.'

export const metadata: Metadata = {
  title: 'Las Vegas Party Bus Packages | Book Online',
  description: desc,
  alternates: { canonical: `${SITE}/packages` },
  openGraph: {
    title: 'Las Vegas Party Bus Packages | Book Online | American Royalty',
    description: desc,
    url: `${SITE}/packages`,
    images: [
      {
        url: '/images/hero/bus-exterior-casino.webp',
        width: 1200,
        height: 630,
        alt: 'American Royalty Las Vegas party bus packages',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Las Vegas Party Bus Packages | Book Online | American Royalty',
    description: desc,
  },
}

const STEPS = [
  { num: '1', title: 'Choose Your Package', desc: 'Pick the tour that fits your vibe' },
  { num: '2', title: 'Select Party Size', desc: 'Pricing scales with your group size' },
  { num: '3', title: 'Pick Date & Time', desc: 'Choose when you want to ride' },
  { num: '4', title: 'Pay & Confirm', desc: "You're booked — check your email" },
]

const INCLUDED = [
  'Professional chauffeur',
  'Party bus with premium sound & LED lighting',
  'Cooler with ice',
  'Liquor store stop',
  'All taxes and fees included',
]

function formatCurrency(n: number) {
  return '$' + n.toLocaleString()
}

export default function PackagesPage() {
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'American Royalty Las Vegas Party Bus Packages',
    numberOfItems: PACKAGES.length,
    itemListElement: PACKAGES.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE}/packages/${p.slug}`,
      description: p.tagline,
    })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PACKAGE_GENERAL_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Las Vegas Party Bus <span className="text-gold">Packages</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Pick a package. Pick your party size. Book instantly.
          </p>
        </div>
      </section>

      {/* Package Cards */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <Link
              key={pkg.slug}
              href={`/packages/${pkg.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all hover:border-gold/30"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={pkg.image}
                  alt={`${pkg.name} - Las Vegas party bus package`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/40 to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-gold backdrop-blur-sm">
                  <Clock className="h-3.5 w-3.5" />
                  {pkg.duration}
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-white">{pkg.name}</h2>
                <p className="mt-1 text-sm text-gray-400">{pkg.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Starting at{' '}
                    <span className="text-lg font-bold text-gold">
                      {formatCurrency(pkg.pricing[0].price)}
                    </span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gold group-hover:gap-2 transition-all">
                    View Package <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-dark-border bg-dark-card/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">How It Works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-xl font-bold text-gold">
                  {s.num}
                </div>
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Included with Every Package
          </h2>
          <div className="mx-auto mt-10 flex max-w-xl flex-col gap-3">
            {INCLUDED.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-dark-border bg-dark-card p-4"
              >
                <Check className="h-5 w-5 shrink-0 text-gold" />
                <span className="text-sm text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-dark-border py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 divide-y divide-dark-border">
            {PACKAGE_GENERAL_FAQS.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between text-white hover:text-gold transition-colors">
                  <span className="pr-4 text-sm font-medium">{faq.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-dark-border py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-lg text-gray-400">
            Want something custom?{' '}
            <Link href="/quote" className="font-medium text-gold hover:text-gold-light">
              Request a custom quote
            </Link>{' '}
            or call{' '}
            <a href="tel:+17026664037" className="font-medium text-gold hover:text-gold-light">
              (702) 666-4037
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
