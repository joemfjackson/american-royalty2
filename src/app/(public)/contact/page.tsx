import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { ContactForm } from '@/components/forms/ContactForm'
import { BRAND, SERVICE_AREAS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contact American Royalty | Las Vegas Party Bus & Limo',
  description:
    'Contact American Royalty for party bus and limousine rentals in Las Vegas. Call, email, or submit a form. 24/7 availability for bachelor parties, weddings, nightlife, and more.',
  keywords: [
    'contact American Royalty',
    'Las Vegas party bus phone number',
    'Las Vegas limo contact',
    'party bus booking Las Vegas',
    'limo reservation Las Vegas',
  ],
  openGraph: {
    title: 'Contact American Royalty | Las Vegas Party Bus & Limo',
    description:
      'Get in touch with American Royalty for party bus and limo rentals in Las Vegas. 24/7 availability.',
  },
}

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone',
    value: BRAND.phone,
    href: `tel:${BRAND.phone}`,
    description: 'Call or text anytime',
  },
  {
    icon: Mail,
    label: 'Email',
    value: BRAND.email,
    href: `mailto:${BRAND.email}`,
    description: 'We respond within 2 hours',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: BRAND.address,
    href: null,
    description: 'Serving the entire Las Vegas valley',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Open 24/7',
    href: null,
    description: 'Always available for bookings & support',
  },
]

export default function ContactPage() {
  return (
    <section className="section-padding pt-32">
      <div className="container-max">
        {/* Page Header */}
        <div className="text-center">
          <SectionTag>Contact Us</SectionTag>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Get in{' '}
            <span className="gold-gradient-text">Touch</span>
          </h1>
          <GoldLine className="mx-auto mt-5" width="100px" />
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/50">
            Have a question, want to book, or need help planning your Las
            Vegas event? We&apos;re here 24/7 and ready to help you ride like
            royalty.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="mt-16 grid gap-12 lg:grid-cols-5">
          {/* Contact Info — Left Column */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {contactInfo.map((item) => {
                const inner = (
                  <div className="card-dark flex items-start gap-4 p-6 transition-colors hover:border-gold/20">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                      <item.icon className="h-6 w-6 text-gold" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/40">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                      <p className="mt-0.5 text-sm text-white/50">{item.description}</p>
                    </div>
                  </div>
                )

                if (item.href) {
                  return (
                    <a key={item.label} href={item.href} className="block">
                      {inner}
                    </a>
                  )
                }

                return <div key={item.label}>{inner}</div>
              })}
            </div>

            {/* Service Areas */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-white">Service Areas</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {SERVICE_AREAS.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dark-border bg-dark-card/50 px-3 py-1.5 text-xs text-white/60"
                  >
                    <MapPin className="h-3 w-3 text-gold" aria-hidden="true" />
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Link to Quote */}
            <div className="mt-10 rounded-xl border border-gold/10 bg-gold/5 p-6">
              <p className="font-semibold text-white">Ready to book?</p>
              <p className="mt-1 text-sm text-white/50">
                Skip the back-and-forth. Get a detailed quote for your event
                with our quick form.
              </p>
              <Link
                href="/quote"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold transition-all hover:gap-3"
              >
                Get a Free Quote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Contact Form — Right Column */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
