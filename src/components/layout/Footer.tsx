import Link from 'next/link'
import { BRAND, SERVICE_AREAS, MOCK_SERVICES } from '@/lib/constants'

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/fleet', label: 'Fleet' },
  { href: '/services', label: 'Services' },
  { href: '/quote', label: 'Get a Quote' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-dark-border bg-[#0A0A0A]">
      {/* Gold accent line */}
      <div className="gold-line w-full" />

      {/* Main footer content */}
      <div className="container-max mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group inline-flex flex-col items-start">
              <span className="gold-gradient-text text-4xl font-bold leading-none tracking-wide">
                AR
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[3px] text-gold/70 transition-colors group-hover:text-gold">
                American Royalty
              </span>
            </Link>
            <p className="mt-3 text-lg font-semibold italic text-gold/80">
              {BRAND.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Las Vegas&apos;s premier party bus and limousine service. Luxury
              transportation for bachelor parties, bachelorette parties,
              weddings, nightlife, and more.
            </p>
            {/* Social icons placeholder */}
            <div className="mt-5 flex gap-3">
              <SocialPlaceholder label="FB" />
              <SocialPlaceholder label="IG" />
              <SocialPlaceholder label="TT" />
              <SocialPlaceholder label="YT" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">
              Our Services
            </h3>
            <ul className="space-y-2.5">
              {MOCK_SERVICES.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-white/50 transition-colors hover:text-gold"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">
              Service Areas
            </h3>
            <ul className="space-y-2.5">
              {SERVICE_AREAS.map((area) => (
                <li
                  key={area}
                  className="text-sm text-white/50"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-border">
        <div className="container-max mx-auto flex flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-white/40">
            &copy; {currentYear} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/40">
            <a
              href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`}
              className="transition-colors hover:text-gold"
            >
              {BRAND.phone}
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href={`mailto:${BRAND.email}`}
              className="transition-colors hover:text-gold"
            >
              {BRAND.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialPlaceholder({ label }: { label: string }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dark-border text-xs font-semibold text-white/40 transition-colors hover:border-gold/40 hover:text-gold">
      {label}
    </span>
  )
}
