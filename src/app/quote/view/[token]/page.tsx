import { notFound } from 'next/navigation'
import { getQuotePublic } from '@/lib/actions/quote-public'
import { formatDate } from '@/lib/utils'
import { QuotePayClient } from './QuotePayClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

function formatCurrencyDisplay(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default async function QuoteViewPage({ params }: Props) {
  const { token } = await params
  const quote = await getQuotePublic(token)

  if (!quote) {
    notFound()
  }

  const balanceDue = quote.quoted_amount - quote.deposit_amount

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
      <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
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
              <span className="text-white font-medium">{quote.pickup_time}</span>
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
      <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
        {/* Gold accent line */}
        <div className="h-1 bg-gradient-to-r from-gold via-royal to-gold" />

        <div className="px-5 py-4 border-b border-dark-border">
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Pricing Breakdown</h2>
        </div>
        <div className="px-5 py-4 space-y-1">
          {quote.line_items.map((item, index) => {
            const lineTotal = item.quantity * item.unit_price
            return (
              <div key={index} className="flex justify-between items-baseline text-sm py-1.5">
                <div className="flex-1 min-w-0">
                  <span className="text-gray-300">{item.description}</span>
                  {item.quantity > 1 && (
                    <span className="ml-2 text-xs text-gray-500">
                      {item.quantity} × {formatCurrencyDisplay(item.unit_price)}
                    </span>
                  )}
                </div>
                <span className="text-white font-medium ml-4 shrink-0">
                  {formatCurrencyDisplay(lineTotal)}
                </span>
              </div>
            )
          })}

          {/* If no line items, show flat total */}
          {quote.line_items.length === 0 && (
            <div className="flex justify-between text-sm py-1.5">
              <span className="text-gray-300">Service Total</span>
              <span className="text-white font-medium">{formatCurrencyDisplay(quote.quoted_amount)}</span>
            </div>
          )}

          <div className="border-t border-dark-border my-2" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total Amount</span>
            <span className="text-white font-medium">{formatCurrencyDisplay(quote.quoted_amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Deposit to Book ({quote.deposit_percent}%)</span>
            <span className="text-gold font-bold">{formatCurrencyDisplay(quote.deposit_amount)}</span>
          </div>

          <div className="border-t border-dark-border my-2" />

          <div className="flex justify-between items-center pt-1">
            <span className="text-base font-semibold text-white">
              {quote.is_paid ? 'Deposit Paid' : 'Pay Now to Book'}
            </span>
            <span className="text-2xl font-bold text-gold">
              {formatCurrencyDisplay(quote.deposit_amount)}
            </span>
          </div>

          {/* Pay button */}
          {!quote.is_booked && !quote.is_paid && (
            <QuotePayClient
              quoteToken={quote.token}
              depositAmount={quote.deposit_amount}
            />
          )}

          {/* Already booked state */}
          {quote.is_paid && (
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4 text-center mt-2">
              <div className="text-3xl mb-2">&#10003;</div>
              <p className="text-sm font-medium text-emerald-400">Deposit Received — You&apos;re Booked!</p>
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll be in touch with final details before your event.
              </p>
            </div>
          )}
        </div>

        {/* Balance note */}
        {!quote.is_paid && balanceDue > 0 && (
          <div className="px-5 py-3 border-t border-dark-border bg-black/30">
            <p className="text-xs text-gray-500 text-center">
              Remaining balance of {formatCurrencyDisplay(balanceDue)} due before your event
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
