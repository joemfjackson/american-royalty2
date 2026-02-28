import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Terms and conditions for ${BRAND.name} party bus and limousine services in Las Vegas, Nevada.`,
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'February 28, 2026'

export default function TermsPage() {
  return (
    <section className="section-padding pt-32">
      <div className="container-max max-w-4xl">
        <SectionTag>Legal</SectionTag>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
          Terms &amp; <span className="gold-gradient-text">Conditions</span>
        </h1>
        <GoldLine className="mt-5" width="80px" />
        <p className="mt-4 text-sm text-white/40">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-12 space-y-10 text-white/60 leading-relaxed">
          {/* Agreement */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using the {BRAND.name} website at{' '}
              <a href={BRAND.siteUrl} className="text-gold hover:underline">{BRAND.siteUrl.replace('https://', '')}</a>{' '}
              or booking our party bus and limousine services, you agree to be bound by these
              Terms and Conditions. If you do not agree to these terms, please do not use our
              website or services.
            </p>
          </div>

          {/* Reservations and Bookings */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Reservations &amp; Bookings</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>All reservations are subject to vehicle availability and confirmation by {BRAND.name}.</li>
              <li>A deposit is required to secure your reservation. The deposit amount varies by vehicle and event type.</li>
              <li>Reservations are not confirmed until the deposit has been received and a confirmation has been sent.</li>
              <li>All bookings require a minimum rental period, which varies by vehicle (typically 2-4 hours).</li>
              <li>You must be at least 18 years of age to make a reservation.</li>
            </ul>
          </div>

          {/* Pricing and Payment */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Pricing &amp; Payment</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>All prices are quoted in U.S. dollars and are subject to change without notice.</li>
              <li>Quoted rates do not include gratuity. A 18-20% gratuity for your chauffeur is customary and greatly appreciated.</li>
              <li>The remaining balance is due prior to or at the start of your service, unless other arrangements have been made.</li>
              <li>We accept major credit cards, debit cards, and cash payments.</li>
              <li>Any additional time beyond the reserved hours will be billed at the standard hourly rate in 30-minute increments, subject to vehicle availability.</li>
            </ul>
          </div>

          {/* Cancellation Policy */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Cancellation &amp; Refund Policy</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Cancellations made <span className="text-white/80">72 or more hours</span> before your reservation receive a full refund of the deposit.</li>
              <li>Cancellations made <span className="text-white/80">48-72 hours</span> before your reservation receive a 50% refund of the deposit.</li>
              <li>Cancellations made <span className="text-white/80">within 48 hours</span> of your reservation are non-refundable.</li>
              <li>No-shows are non-refundable.</li>
              <li>We reserve the right to cancel a reservation due to unforeseen circumstances (mechanical issues, severe weather, etc.). In such cases, a full refund or rescheduling will be offered.</li>
            </ul>
          </div>

          {/* Passenger Conduct */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Passenger Conduct</h2>
            <p className="mb-4">All passengers must adhere to the following rules while using our vehicles:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>All passengers must remain seated while the vehicle is in motion and wear seatbelts where available.</li>
              <li>Smoking, vaping, and the use of illegal substances are strictly prohibited in all vehicles.</li>
              <li>All passengers consuming alcohol must be 21 years of age or older. Valid ID may be requested.</li>
              <li>Passengers must treat the vehicle, equipment, and chauffeur with respect.</li>
              <li>Standing through sunroofs or hanging out of windows while the vehicle is in motion is prohibited.</li>
              <li>The chauffeur has the authority to end service if passenger behavior poses a safety risk or violates these terms. No refund will be issued in such cases.</li>
            </ul>
          </div>

          {/* Damages */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">6. Damages &amp; Cleaning Fees</h2>
            <p>
              The person who made the reservation is responsible for any damages caused to the
              vehicle during the rental period, including but not limited to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Interior or exterior damage to the vehicle</li>
              <li>Stains, spills, or excessive mess requiring professional cleaning</li>
              <li>Damage to audio/visual equipment or lighting systems</li>
              <li>Lost or stolen items belonging to the vehicle</li>
            </ul>
            <p className="mt-4">
              A cleaning fee of up to $500 may be assessed for excessive mess. Damage repair
              costs will be billed at actual repair cost plus any lost revenue during downtime.
            </p>
          </div>

          {/* Alcohol Policy */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">7. Alcohol Policy</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Passengers are welcome to bring their own alcoholic beverages aboard our vehicles.</li>
              <li>All passengers consuming alcohol must be 21 years of age or older.</li>
              <li>Our chauffeurs do not serve alcohol and are not responsible for monitoring alcohol consumption.</li>
              <li>Open containers of alcohol must remain inside the vehicle at all times in compliance with Nevada state law.</li>
              <li>We reserve the right to refuse service to any passenger who is excessively intoxicated.</li>
            </ul>
          </div>

          {/* Liability */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">8. Limitation of Liability</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>{BRAND.name} is not responsible for delays caused by traffic, road conditions, weather, or other circumstances beyond our control.</li>
              <li>We are not liable for any personal belongings left in the vehicle. While we will make reasonable efforts to locate lost items, we cannot guarantee their return.</li>
              <li>Our total liability for any claim arising from our services shall not exceed the amount paid for the reservation.</li>
              <li>{BRAND.name} is not responsible for any injuries resulting from passenger misconduct or failure to follow safety guidelines.</li>
            </ul>
          </div>

          {/* Route and Itinerary */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">9. Route &amp; Itinerary</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>The chauffeur will follow the agreed-upon itinerary to the best of their ability.</li>
              <li>Route changes during the trip are accommodated when possible but may affect timing.</li>
              <li>The chauffeur reserves the right to modify the route for safety reasons.</li>
              <li>Wait times at stops are included in your total rental hours.</li>
            </ul>
          </div>

          {/* Website Use */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">10. Website Use &amp; Intellectual Property</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>The domain <span className="text-white/80">{BRAND.siteUrl.replace('https://', '')}</span> and all brand content, including text, images, logos, and graphics, are the property of {BRAND.name} and are protected by copyright laws.</li>
              <li>The website source code, software, and underlying technology are the property of <span className="text-white/80">Stage1Labs</span> and are licensed for use by {BRAND.name}. Unauthorized reproduction, modification, or distribution of the software is prohibited.</li>
              <li>You may not reproduce, distribute, or use our content without prior written permission.</li>
              <li>We make every effort to ensure the accuracy of information on our website but do not guarantee that all content is error-free.</li>
              <li>Vehicle images are representative and actual vehicles may vary slightly in appearance.</li>
            </ul>
          </div>

          {/* Governing Law */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">11. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the
              laws of the State of Nevada. Any disputes arising from these terms or our services
              shall be resolved in the courts of Clark County, Nevada.
            </p>
          </div>

          {/* Changes */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">12. Changes to These Terms</h2>
            <p>
              We reserve the right to update or modify these Terms and Conditions at any time.
              Changes will be posted on this page with an updated &quot;Last updated&quot; date.
              Continued use of our website or services after changes constitutes acceptance of
              the revised terms.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us:
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
