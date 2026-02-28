import Link from 'next/link'
import Image from 'next/image'
import { BRAND, SERVICE_AREAS } from '@/lib/constants'
import { getServices } from '@/lib/data'

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/fleet', label: 'Fleet' },
  { href: '/services', label: 'Services' },
  { href: '/quote', label: 'Get a Quote' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.44a4.85 4.85 0 01-3.77-1.47V6.69h3.77z" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { label: 'Facebook', icon: FacebookIcon, href: '#' },
  { label: 'Instagram', icon: InstagramIcon, href: '#' },
  { label: 'TikTok', icon: TikTokIcon, href: '#' },
  { label: 'YouTube', icon: YouTubeIcon, href: '#' },
]

export async function Footer() {
  const currentYear = new Date().getFullYear()
  const services = await getServices()

  return (
    <footer className="border-t border-dark-border bg-[#0A0A0A]">
      {/* Purple-gold accent line */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #6F2DBD, #D6C08A, #6F2DBD)' }} />

      {/* Main footer content */}
      <div className="container-max mx-auto px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group inline-block">
              <Image
                src="/images/logo.png"
                alt="American Royalty"
                width={180}
                height={72}
                className="h-16 w-auto transition-opacity group-hover:opacity-90"
              />
            </Link>
            <p className="mt-3 text-lg font-semibold italic text-gold/80">
              {BRAND.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Las Vegas&apos;s premier party bus and limousine service. Luxury
              transportation for bachelor parties, bachelorette parties,
              weddings, nightlife, and more.
            </p>
            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-dark-border text-white/60 transition-all duration-200 hover:border-royal/40 hover:text-gold hover:bg-royal/10 hover:shadow-[0_0_15px_rgba(111,45,189,0.2)]"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href} className="py-1">
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services — top 5 on mobile, all on desktop */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">
              Our Services
            </h3>
            <ul className="space-y-2.5">
              {services.map((service, i) => (
                <li key={service.id} className={`py-1 ${i >= 5 ? 'hidden sm:block' : ''}`}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              {services.length > 5 && (
                <li className="py-1 sm:hidden">
                  <Link
                    href="/services"
                    className="text-sm font-medium text-gold/70 transition-colors hover:text-gold"
                  >
                    View All Services &rarr;
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Service Areas — 2-col grid on mobile for compactness */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">
              Service Areas
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-1 sm:space-y-2.5 sm:gap-0">
              {SERVICE_AREAS.map((area) => (
                <li
                  key={area}
                  className="truncate text-sm text-white/60"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-border pb-16 sm:pb-0">
        <div className="container-max mx-auto flex flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-white/60">
            &copy; {currentYear} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/60">
            <span>{BRAND.address}</span>
            <span className="hidden sm:inline">|</span>
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
        <p className="pb-4 text-center text-[11px] text-white/30">
          Website designed by{' '}
          <a
            href="https://www.stage1labs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 transition-colors hover:text-gold"
          >
            Stage1Labs
          </a>
        </p>
      </div>
    </footer>
  )
}
