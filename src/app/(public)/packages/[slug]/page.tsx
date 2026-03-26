import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Check, ChevronDown, ArrowLeft, Phone } from 'lucide-react'
import { PACKAGES, getPackageBySlug } from '@/lib/packages'
import { PackageBookingForm } from '@/components/packages/PackageBookingForm'

const SITE = 'https://www.americanroyaltylasvegas.com'

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const pkg = getPackageBySlug(slug)
  if (!pkg) return {}

  const url = `${SITE}/packages/${slug}`
  const title = `${pkg.name} | Las Vegas Party Bus Package`

  return {
    title,
    description: pkg.description.slice(0, 155),
    keywords: pkg.keywords.split(', '),
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | American Royalty`,
      description: pkg.description.slice(0, 155),
      url,
      images: [{ url: pkg.image, width: 1200, height: 630, alt: `${pkg.name} Las Vegas` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | American Royalty`,
      description: pkg.description.slice(0, 155),
    },
  }
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString()
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pkg = getPackageBySlug(slug)
  if (!pkg) notFound()

  const otherPackages = PACKAGES.filter((p) => p.slug !== slug)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.name,
    description: pkg.description,
    image: `${SITE}${pkg.image}`,
    brand: { '@type': 'Organization', name: 'American Royalty' },
    offers: pkg.pricing.map((t) => ({
      '@type': 'Offer',
      name: t.tier,
      price: t.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    })),
    provider: {
      '@type': 'LocalBusiness',
      name: 'American Royalty',
      telephone: '(702) 666-4037',
      address: { '@type': 'PostalAddress', addressLocality: 'Las Vegas', addressRegion: 'NV' },
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pkg.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Packages', item: `${SITE}/packages` },
      { '@type': 'ListItem', position: 3, name: pkg.name, item: `${SITE}/packages/${slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0">
          <Image src={pkg.image} alt={pkg.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4">
          <nav className="mb-6" aria-label="Breadcrumb">
            <Link
              href="/packages"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All Packages
            </Link>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-medium text-gold">
              <Clock className="h-3.5 w-3.5" />
              {pkg.duration}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {pkg.name}
          </h1>
          <p className="mt-2 text-lg text-gold">{pkg.tagline}</p>
          <p className="mt-1 text-sm text-gray-400">
            Starting at{' '}
            <span className="font-semibold text-white">
              {formatCurrency(pkg.pricing[0].price)}
            </span>{' '}
            for {pkg.pricing[0].tier}
          </p>
          <a
            href="#book"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-light lg:hidden"
          >
            Book Now
          </a>
          <a
            href="#book-desktop"
            className="mt-6 hidden lg:inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-light"
          >
            Book Now
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-16">
            {/* About */}
            <section>
              <h2 className="text-xl font-bold text-white">About This Package</h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-300">{pkg.description}</p>
            </section>

            {/* Photo Gallery */}
            {pkg.gallery && pkg.gallery.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white">From Our Guests</h2>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {pkg.gallery.slice(0, 9).map((src, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={src}
                        alt={`${pkg.name} guest photo ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                {pkg.gallery.length > 9 && (
                  <p className="mt-3 text-center text-xs text-gray-500">
                    +{pkg.gallery.length - 9} more photos from real tours
                  </p>
                )}
              </section>
            )}

            {/* What's Included */}
            <section>
              <h2 className="text-xl font-bold text-white">What&apos;s Included</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {pkg.includes.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            <section>
              <h2 className="text-xl font-bold text-white">The Route</h2>
              <div className="mt-6 space-y-0">
                {pkg.itinerary.map((stop, i) => (
                  <div key={i} className="relative flex gap-4 pb-6">
                    {i < pkg.itinerary.length - 1 && (
                      <div className="absolute left-[11px] top-6 h-full w-px bg-gold/20" />
                    )}
                    <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-2 border-gold bg-dark-card flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-gold" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gold">{stop.time}</p>
                      <p className="text-sm text-gray-300">{stop.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Booking form (mobile only) */}
            <section id="book" className="lg:hidden">
              <PackageBookingForm pkg={pkg} />
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-xl font-bold text-white">Common Questions</h2>
              <div className="mt-4 divide-y divide-dark-border">
                {pkg.faqs.map((faq) => (
                  <details key={faq.q} className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between text-white hover:text-gold transition-colors">
                      <span className="pr-4 text-sm font-medium">{faq.q}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar — booking form (desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div id="book-desktop" className="sticky top-24">
              <PackageBookingForm pkg={pkg} />
            </div>
          </div>
        </div>

        {/* Other Packages */}
        <section className="mt-20 border-t border-dark-border pt-16">
          <h2 className="text-xl font-bold text-white">Explore More Packages</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {otherPackages.map((p) => (
              <Link
                key={p.slug}
                href={`/packages/${p.slug}`}
                className="group rounded-xl border border-dark-border bg-dark-card p-4 transition-all hover:border-gold/30"
              >
                <div className="relative h-28 overflow-hidden rounded-lg">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-semibold text-white text-sm">{p.name}</h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  {p.duration} · from {formatCurrency(p.pricing[0].price)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <p className="text-gray-400">
            Questions? Call{' '}
            <a href="tel:+17026664037" className="inline-flex items-center gap-1 font-medium text-gold hover:text-gold-light">
              <Phone className="h-4 w-4" />
              (702) 666-4037
            </a>
          </p>
          <Link href="/packages" className="mt-2 inline-block text-sm text-gold hover:text-gold-light">
            ← View All Packages
          </Link>
        </section>
      </div>
    </>
  )
}
