import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${BRAND.name}. Learn how we collect, use, and protect your personal information.`,
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'February 28, 2026'

export default function PrivacyPolicyPage() {
  return (
    <section className="section-padding pt-32">
      <div className="container-max max-w-4xl">
        <SectionTag>Legal</SectionTag>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
          Privacy <span className="gold-gradient-text">Policy</span>
        </h1>
        <GoldLine className="mt-5" width="80px" />
        <p className="mt-4 text-sm text-white/40">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-12 space-y-10 text-white/60 leading-relaxed">
          {/* Introduction */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Introduction</h2>
            <p>
              {BRAND.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website{' '}
              <a href={BRAND.siteUrl} className="text-gold hover:underline">{BRAND.siteUrl.replace('https://', '')}</a>{' '}
              and provides party bus and limousine transportation services in Las Vegas, Nevada.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website or use our services.
            </p>
          </div>

          {/* Information We Collect */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Information We Collect</h2>
            <p className="mb-4">We may collect personal information that you voluntarily provide when you:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Submit a quote request or booking inquiry</li>
              <li>Fill out our contact form</li>
              <li>Call or email us directly</li>
              <li>Use our website</li>
            </ul>
            <p className="mt-4 font-medium text-white/80">Personal information may include:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Event details (date, type, location, group size)</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Respond to your quote requests and inquiries</li>
              <li>Process and manage your bookings</li>
              <li>Communicate with you about your reservation</li>
              <li>Send booking confirmations and reminders</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          {/* Information Sharing */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties.
              We may share your information only in the following circumstances:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <span className="text-white/80">Service providers:</span> Trusted third parties who
                assist us in operating our website, processing payments, or providing services
                (e.g., email delivery, payment processing)
              </li>
              <li>
                <span className="text-white/80">Legal requirements:</span> When required by law,
                regulation, or legal process
              </li>
              <li>
                <span className="text-white/80">Business transfers:</span> In connection with a
                merger, acquisition, or sale of business assets
              </li>
            </ul>
          </div>

          {/* Cookies and Tracking */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Cookies and Tracking Technologies</h2>
            <p>
              Our website may use cookies and similar tracking technologies to enhance your
              browsing experience and analyze website traffic. You can control cookie preferences
              through your browser settings. Disabling cookies may affect certain website
              functionality.
            </p>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical security measures
              to protect your personal information. However, no method of transmission over
              the Internet or electronic storage is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </div>

          {/* Data Retention */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the
              purposes outlined in this Privacy Policy, unless a longer retention period is
              required or permitted by law.
            </p>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us using the information below.
            </p>
          </div>

          {/* Third-Party Links */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible
              for the privacy practices or content of those websites. We encourage you to
              review the privacy policies of any third-party sites you visit.
            </p>
          </div>

          {/* Children's Privacy */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not
              knowingly collect personal information from minors. If we learn that we have
              collected information from a child under 18, we will take steps to delete
              that information promptly.
            </p>
          </div>

          {/* Changes to This Policy */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted
              on this page with an updated &quot;Last updated&quot; date. We encourage you to
              review this policy periodically.
            </p>
          </div>

          {/* Contact Us */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                Email:{' '}
                <a href={`mailto:${BRAND.email}`} className="text-gold hover:underline">
                  {BRAND.email}
                </a>
              </li>
              <li>
                Phone:{' '}
                <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`} className="text-gold hover:underline">
                  {BRAND.phone}
                </a>
              </li>
              <li>Location: {BRAND.address}</li>
            </ul>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-16 text-center">
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
