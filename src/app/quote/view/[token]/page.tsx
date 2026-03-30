import { notFound } from 'next/navigation'
import { getQuotePublic } from '@/lib/actions/quote-public'
import { formatDate, formatTime } from '@/lib/utils'
import { QuotePayClient } from './QuotePayClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

function fmt(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function QuoteViewPage({ params }: Props) {
  const { token } = await params
  const quote = await getQuotePublic(token)

  if (!quote) {
    notFound()
  }

  const balanceDue = quote.quoted_amount - quote.deposit_amount
  const isFullPayment = quote.is_full_payment
  const hasStructuredPricing = quote.base_fare != null

  return (
    <div className="space-y-6">
      {/* Quote header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-wider text-gray-500 uppercase">Quote</p>
          {quote.quote_sent_at && (
            <p className="text-sm text-gray-400 mt-1">
              Prepared {formatDate(quote.quote_sent_at)}
            </p>
          )}
        </div>
        {quote.is_booked && (
          <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm font-semibold text-emerald-400">
            Booked
          </div>
        )}
      </div>

      {/* Event details card */}
      <div className="rounded-xl bg-dark-card overflow-hidden glow-purple border border-gold/20 shadow-[0_0_40px_rgba(111,45,189,0.12)]">
        <div className="px-5 py-4 border-b border-dark-border">
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Event Details</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Client</span>
            <span className="text-white font-medium">{quote.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Event</span>
            <span className="text-white font-medium">{quote.event_type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Date</span>
            <span className="text-white font-medium">{formatDate(quote.event_date)}</span>
          </div>
          {quote.pickup_time && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Time</span>
              <span className="text-white font-medium">{formatTime(quote.pickup_time)}</span>
            </div>
          )}
          {quote.duration_hours && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Duration</span>
              <span className="text-white font-medium">{quote.duration_hours} hours</span>
            </div>
          )}
          {quote.vehicle_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Vehicle</span>
              <span className="text-white font-medium">{quote.vehicle_name}</span>
            </div>
          )}
          {quote.guest_count && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Guests</span>
              <span className="text-white font-medium">{quote.guest_count}</span>
            </div>
          )}
          {quote.pickup_location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Pickup</span>
              <span className="text-white font-medium text-right max-w-[60%]">{quote.pickup_location}</span>
            </div>
          )}
          {quote.dropoff_location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Drop-off</span>
              <span className="text-white font-medium text-right max-w-[60%]">{quote.dropoff_location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing breakdown card */}
      <div className="rounded-xl bg-dark-card overflow-hidden border border-gold/20 shadow-[0_0_40px_rgba(111,45,189,0.12),0_0_80px_rgba(214,192,138,0.06)]">
        {/* Gold-purple gradient accent line */}
        <div className="h-1 bg-gradient-to-r from-gold via-royal to-gold" />

        <div className="px-5 py-4 border-b border-dark-border">
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Pricing Breakdown</h2>
        </div>
        <div className="px-5 py-4 space-y-1">
          {hasStructuredPricing ? (
            <>
              {/* Base Fare */}
              <div className="flex justify-between items-baseline text-sm py-1.5">
                <div>
                  <span className="text-gray-300">Base Fare</span>
                  {quote.duration_hours && quote.hourly_rate && (
                    <span className="ml-2 text-xs text-gray-500">
                      {quote.duration_hours} hrs &times; {fmt(quote.hourly_rate)}/hr
                    </span>
                  )}
                </div>
                <span className="text-white font-medium ml-4 shrink-0">{fmt(quote.base_fare!)}</span>
              </div>

              {/* Fuel Surcharge */}
              {quote.fuel_surcharge != null && quote.fuel_surcharge > 0 && (
                <div className="flex justify-between items-baseline text-sm py-1.5">
                  <span className="text-gray-300">NTA Fuel Surcharge</span>
                  <span className="text-white font-medium ml-4 shrink-0">{fmt(quote.fuel_surcharge)}</span>
                </div>
              )}

              {/* Custom Items */}
              {quote.custom_items?.map((item, index) => (
                <div key={index} className="flex justify-between items-baseline text-sm py-1.5">
                  <span className="text-gray-300">{item.description}</span>
                  <span className="text-white font-medium ml-4 shrink-0">{fmt(item.amount)}</span>
                </div>
              ))}

              <div className="border-t border-dark-border my-2" />

              {/* Subtotal */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-medium">
                  {fmt(
                    (quote.base_fare || 0) +
                    (quote.fuel_surcharge || 0) +
                    (quote.custom_items?.reduce((s, i) => s + i.amount, 0) || 0)
                  )}
                </span>
              </div>

              {/* Tax */}
              {quote.tax_amount != null && quote.tax_amount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">NTA Excise Tax (3%)</span>
                  <span className="text-white font-medium">{fmt(quote.tax_amount)}</span>
                </div>
              )}

              {/* Gratuity */}
              {quote.driver_gratuity != null && quote.driver_gratuity > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Driver Gratuity{quote.gratuity_percent ? ` (${quote.gratuity_percent}%)` : ''}</span>
                  <span className="text-white font-medium">{fmt(quote.driver_gratuity)}</span>
                </div>
              )}

              <div className="border-t border-dark-border my-2" />
            </>
          ) : (
            <>
              {/* Fallback for old quotes without structured pricing */}
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-gray-300">Service Total</span>
                <span className="text-white font-medium">{fmt(quote.quoted_amount)}</span>
              </div>
              <div className="border-t border-dark-border my-2" />
            </>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total Amount</span>
            <span className="text-white font-medium">{fmt(quote.quoted_amount)}</span>
          </div>
          {!isFullPayment && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Deposit to Book ({quote.deposit_percent}%)</span>
              <span className="text-gold font-bold">{fmt(quote.deposit_amount)}</span>
            </div>
          )}

          <div className="border-t border-dark-border my-2" />

          <div className="flex justify-between items-center pt-1">
            <span className="text-base font-semibold text-white">
              {quote.is_paid
                ? (isFullPayment ? 'Paid in Full' : 'Deposit Paid')
                : (isFullPayment ? 'Pay Now to Book' : 'Pay Deposit to Book')}
            </span>
            <span className="text-2xl font-bold text-gold">
              {fmt(isFullPayment ? quote.quoted_amount : quote.deposit_amount)}
            </span>
          </div>

          {/* Pay button */}
          {!quote.is_booked && !quote.is_paid && (
            <QuotePayClient
              quoteToken={quote.token}
              depositAmount={quote.deposit_amount}
              isFullPayment={isFullPayment}
            />
          )}

          {/* Already booked state */}
          {quote.is_paid && (
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4 text-center mt-2">
              <div className="text-3xl mb-2">&#10003;</div>
              <p className="text-sm font-medium text-emerald-400">
                {isFullPayment ? 'Payment Complete' : 'Deposit Received'} &mdash; You&apos;re Booked!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll be in touch with final details before your event.
              </p>
            </div>
          )}
        </div>

        {/* Balance note */}
        {!quote.is_paid && !isFullPayment && balanceDue > 0 && (
          <div className="px-5 py-3 border-t border-dark-border bg-black/30">
            <p className="text-xs text-gray-500 text-center">
              Remaining balance of {fmt(balanceDue)} due 7 days before your event or cash upon arrival
            </p>
          </div>
        )}
      </div>

      {/* Alternative payment note */}
      {!quote.is_booked && !quote.is_paid && (
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500">
            Prefer to pay another way? We accept Zelle, Venmo, and cash.
          </p>
          <p className="text-sm text-gray-500">
            Call us at{' '}
            <a href="tel:+17026664037" className="text-gold hover:text-gold-light">(702) 666-4037</a>{' '}
            to arrange.
          </p>
        </div>
      )}

      {/* Validity note */}
      {!quote.is_booked && !quote.is_paid && (
        <p className="text-center text-xs text-gray-600">
          This quote is valid for 14 days.
        </p>
      )}
    </div>
  )
}
