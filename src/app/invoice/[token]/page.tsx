import { notFound } from 'next/navigation'
import { getInvoicePublic } from '@/lib/actions/invoice-public'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { InvoiceClient } from './InvoiceClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvoicePage({ params }: Props) {
  const { token } = await params
  const invoice = await getInvoicePublic(token)

  if (!invoice) {
    notFound()
  }

  const isPaid = invoice.status === 'paid'
  const isCancelled = invoice.status === 'cancelled'
  const balanceDue = invoice.total_amount - invoice.deposit_amount

  return (
    <div className="space-y-6">
      {/* Invoice header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-wider text-gray-500 uppercase">Invoice</p>
          <p className="text-sm text-gray-400 mt-1">
            Issued {formatDate(invoice.created_at)}
          </p>
        </div>
        {isPaid && (
          <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm font-semibold text-emerald-400">
            Paid
          </div>
        )}
        {isCancelled && (
          <div className="rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-sm font-semibold text-red-400">
            Cancelled
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
            <span className="text-white font-medium">{invoice.quote.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Event</span>
            <span className="text-white font-medium">{invoice.quote.event_type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Date</span>
            <span className="text-white font-medium">{formatDate(invoice.quote.event_date)}</span>
          </div>
          {invoice.quote.pickup_time && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Time</span>
              <span className="text-white font-medium">{formatTime(invoice.quote.pickup_time)}</span>
            </div>
          )}
          {invoice.quote.duration_hours && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Duration</span>
              <span className="text-white font-medium">{invoice.quote.duration_hours} hours</span>
            </div>
          )}
          {invoice.quote.vehicle_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Vehicle</span>
              <span className="text-white font-medium">{invoice.quote.vehicle_name}</span>
            </div>
          )}
          {invoice.quote.guest_count && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Guests</span>
              <span className="text-white font-medium">{invoice.quote.guest_count}</span>
            </div>
          )}
          {invoice.quote.pickup_location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Pickup</span>
              <span className="text-white font-medium text-right max-w-[60%]">{invoice.quote.pickup_location}</span>
            </div>
          )}
          {invoice.quote.dropoff_location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Drop-off</span>
              <span className="text-white font-medium text-right max-w-[60%]">{invoice.quote.dropoff_location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment summary card */}
      <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
        {/* Gold accent line */}
        <div className="h-1 bg-gradient-to-r from-gold via-royal to-gold" />

        <div className="px-5 py-4 border-b border-dark-border">
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Payment Summary</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Amount</span>
            <span className="text-white font-medium">{formatCurrency(invoice.total_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Deposit Required ({invoice.deposit_percent}%)</span>
            <span className="text-gold font-bold">{formatCurrency(invoice.deposit_amount)}</span>
          </div>

          <div className="border-t border-dark-border my-2" />

          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-white">
              {isPaid ? 'Amount Paid' : 'Amount Due Now'}
            </span>
            <span className="text-2xl font-bold text-gold">
              {formatCurrency(invoice.deposit_amount)}
            </span>
          </div>

          {/* Pay button or paid state */}
          {!isPaid && !isCancelled && (
            <InvoiceClient
              invoiceId={invoice.id}
              token={invoice.token}
              depositAmount={invoice.deposit_amount}
            />
          )}

          {isPaid && invoice.paid_at && (
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4 text-center">
              <div className="text-3xl mb-2">&#10003;</div>
              <p className="text-sm font-medium text-emerald-400">Payment Received</p>
              <p className="text-xs text-gray-500 mt-1">
                Paid on {formatDate(invoice.paid_at)}
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4 text-center">
              <p className="text-sm font-medium text-red-400">This invoice has been cancelled</p>
              <p className="text-xs text-gray-500 mt-1">Please contact us for a new invoice</p>
            </div>
          )}
        </div>

        {/* Balance note */}
        {!isPaid && !isCancelled && balanceDue > 0 && (
          <div className="px-5 py-3 border-t border-dark-border bg-black/30">
            <p className="text-xs text-gray-500 text-center">
              Remaining balance of {formatCurrency(balanceDue)} due before your event
            </p>
          </div>
        )}
      </div>

      {/* Alternative payment note */}
      {!isPaid && !isCancelled && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Prefer to pay another way? We accept Zelle, Venmo, and cash.
          </p>
          <p className="text-sm text-gray-500">
            Call us at <a href="tel:+17026664037" className="text-gold hover:text-gold-light">(702) 666-4037</a> to arrange.
          </p>
        </div>
      )}
    </div>
  )
}
