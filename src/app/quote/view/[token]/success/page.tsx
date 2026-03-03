import { notFound } from 'next/navigation'
import { getQuotePublic } from '@/lib/actions/quote-public'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

function formatCurrencyDisplay(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default async function QuoteSuccessPage({ params }: Props) {
  const { token } = await params
  const quote = await getQuotePublic(token)

  if (!quote) {
    notFound()
  }

  const balanceDue = quote.quoted_amount - quote.deposit_amount

  return (
    <div className="space-y-8 text-center">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30">
          <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-white">You&apos;re Booked!</h1>
        <p className="mt-2 text-gray-400">
          Your deposit of <span className="text-gold font-semibold">{formatCurrencyDisplay(quote.deposit_amount)}</span> has been received.
        </p>
        <p className="mt-1 text-gray-400">Your reservation is confirmed.</p>
      </div>

      {/* Event summary card */}
      <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden text-left">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-gold to-emerald-500" />
        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Event</span>
            <span className="text-white font-medium">{quote.event_type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Date</span>
            <span className="text-white font-medium">{formatDate(quote.event_date)}</span>
          </div>
          {quote.vehicle_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Vehicle</span>
              <span className="text-white font-medium">{quote.vehicle_name}</span>
            </div>
          )}
          <div className="border-t border-dark-border my-1" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Deposit Paid</span>
            <span className="text-emerald-400 font-semibold">{formatCurrencyDisplay(quote.deposit_amount)}</span>
          </div>
          {balanceDue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Remaining Balance</span>
              <span className="text-white font-medium">{formatCurrencyDisplay(balanceDue)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Next steps */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400">
          We&apos;ll be in touch with final details before your event.
        </p>
        {balanceDue > 0 && (
          <p className="text-sm text-gray-500">
            Remaining balance of {formatCurrencyDisplay(balanceDue)} is due before your event.
          </p>
        )}
      </div>

      {/* Back link */}
      <div>
        <Link
          href="/"
          className="inline-block rounded-lg border border-dark-border px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:border-gold/30 hover:text-gold"
        >
          Back to American Royalty
        </Link>
      </div>
    </div>
  )
}
