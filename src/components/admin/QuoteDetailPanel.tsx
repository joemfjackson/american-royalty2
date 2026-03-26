'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Copy,
  CreditCard,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react'
import type { Quote, QuoteLineItem, Invoice, Vehicle } from '@/types'
import { Badge } from '@/components/ui/Badge'
import {
  updateQuote,
  convertQuoteToBooking,
  createAndSendInvoice,
  getInvoiceByQuoteId,
  markInvoicePaidManually,
  markDepositPaidOffPlatform,
  cancelInvoice,
  getInvoiceLink,
  getQuoteWithLineItems,
  getQuotePublicLink,
  getVehicleForQuote,
  deleteQuote,
} from '@/lib/actions/admin'
import { formatDate, formatCurrency, formatTime } from '@/lib/utils'
import { QuoteBuilder } from '@/components/admin/QuoteBuilder'

type QuoteStatus = Quote['status']

const statusBadgeVariant: Record<string, 'yellow' | 'gold' | 'purple' | 'green' | 'red' | 'outline'> = {
  new: 'yellow',
  contacted: 'gold',
  quoted: 'purple',
  invoiced: 'gold',
  booked: 'green',
  completed: 'green',
  cancelled: 'red',
}

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'booked', label: 'Booked' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface QuoteDetailPanelProps {
  quote: Quote | null
  open: boolean
  onClose: () => void
  onUpdateQuote: (updated: Quote) => void
  onDeleteQuote?: (quoteId: string) => void
  vehicleNames?: Record<string, string>
}

export function QuoteDetailPanel({ quote, open, onClose, onUpdateQuote, onDeleteQuote, vehicleNames = {} }: QuoteDetailPanelProps) {
  const [status, setStatus] = useState<QuoteStatus>(quote?.status || 'new')
  const [adminNotes, setAdminNotes] = useState(quote?.admin_notes || '')
  const [quotedAmount, setQuotedAmount] = useState(quote?.quoted_amount?.toString() || '')
  const [saving, setSaving] = useState(false)
  const [depositPercent, setDepositPercent] = useState(20)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [sendingInvoice, setSendingInvoice] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [invoiceLink, setInvoiceLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false)
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([])
  const [quoteLink, setQuoteLink] = useState<string | null>(null)
  const [quoteLinkCopied, setQuoteLinkCopied] = useState(false)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [showDepositConfirm, setShowDepositConfirm] = useState(false)
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('Zelle')
  const [depositProcessing, setDepositProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Update local state when quote changes
  useEffect(() => {
    if (quote) {
      setStatus(quote.status)
      setAdminNotes(quote.admin_notes || '')
      setQuotedAmount(quote.quoted_amount?.toString() || '')
      setShowInvoiceForm(false)
      setShowQuoteBuilder(false)
      setActionMessage(null)
      setCopied(false)
      setQuoteLinkCopied(false)

      // Load line items
      getQuoteWithLineItems(quote.id)
        .then((data) => setLineItems(data.line_items))
        .catch(() => setLineItems([]))

      // Load vehicle for pricing
      if (quote.preferred_vehicle_id) {
        getVehicleForQuote(quote.preferred_vehicle_id)
          .then(setVehicle)
          .catch(() => setVehicle(null))
      } else {
        setVehicle(null)
      }

      // Load quote link if quote has been sent
      if (quote.quote_sent_at) {
        getQuotePublicLink(quote.id).then(setQuoteLink).catch(() => setQuoteLink(null))
      } else {
        setQuoteLink(null)
      }

      // Load existing invoice if quote is invoiced
      if (quote.status === 'invoiced') {
        getInvoiceByQuoteId(quote.id).then(setInvoice).catch(() => {})
        getInvoiceLink(quote.id).then(setInvoiceLink).catch(() => {})
      } else {
        setInvoice(null)
        setInvoiceLink(null)
      }
    }
  }, [quote])

  if (!quote) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateQuote(quote.id, {
        status,
        admin_notes: adminNotes || null,
        quoted_amount: quotedAmount ? parseFloat(quotedAmount) : null,
      })
      // If status changed to booked directly (legacy path), create booking
      if (status === 'booked' && quote.status !== 'booked') {
        await convertQuoteToBooking(quote.id)
      }
      onUpdateQuote(updated)
      setActionMessage({ type: 'success', text: 'Changes saved' })
    } catch (err) {
      console.error('Failed to save quote:', err)
      setActionMessage({ type: 'error', text: 'Failed to save changes' })
    } finally {
      setSaving(false)
    }
  }

  const handleQuickAction = async (newStatus: QuoteStatus) => {
    setStatus(newStatus)
    try {
      if (newStatus === 'booked') {
        await updateQuote(quote.id, {
          admin_notes: adminNotes || null,
          quoted_amount: quotedAmount ? parseFloat(quotedAmount) : null,
        })
        await convertQuoteToBooking(quote.id)
        onUpdateQuote({ ...quote, status: 'booked' })
        return
      }
      const updated = await updateQuote(quote.id, {
        status: newStatus,
        admin_notes: adminNotes || null,
        quoted_amount: quotedAmount ? parseFloat(quotedAmount) : null,
      })
      onUpdateQuote(updated)
    } catch (err) {
      console.error('Failed to update quote status:', err)
    }
  }

  const handleSendInvoice = async () => {
    setSendingInvoice(true)
    setActionMessage(null)
    try {
      // Save quoted amount first
      if (quotedAmount) {
        await updateQuote(quote.id, {
          admin_notes: adminNotes || null,
          quoted_amount: parseFloat(quotedAmount),
        })
      }
      const inv = await createAndSendInvoice(quote.id, depositPercent)
      setInvoice(inv)
      setShowInvoiceForm(false)
      onUpdateQuote({ ...quote, status: 'invoiced', quoted_amount: parseFloat(quotedAmount) })

      const link = await getInvoiceLink(quote.id)
      setInvoiceLink(link)

      setActionMessage({ type: 'success', text: `Invoice sent to ${quote.email}` })
    } catch (err) {
      console.error('Failed to send invoice:', err)
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to send invoice' })
    } finally {
      setSendingInvoice(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!invoice) return
    setSaving(true)
    setActionMessage(null)
    try {
      await markInvoicePaidManually(invoice.id)
      onUpdateQuote({ ...quote, status: 'booked' })
      setActionMessage({ type: 'success', text: 'Marked as paid — booking created' })
    } catch (err) {
      console.error('Failed to mark invoice paid:', err)
      setActionMessage({ type: 'error', text: 'Failed to mark as paid' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelInvoice = async () => {
    if (!invoice) return
    setSaving(true)
    setActionMessage(null)
    try {
      await cancelInvoice(invoice.id)
      setInvoice(null)
      setInvoiceLink(null)
      onUpdateQuote({ ...quote, status: 'quoted' })
      setActionMessage({ type: 'success', text: 'Invoice cancelled — quote reverted to Quoted' })
    } catch (err) {
      console.error('Failed to cancel invoice:', err)
      setActionMessage({ type: 'error', text: 'Failed to cancel invoice' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuote = async () => {
    setDeleting(true)
    try {
      await deleteQuote(quote.id)
      onDeleteQuote?.(quote.id)
      onClose()
    } catch (err) {
      console.error('Failed to delete quote:', err)
      setActionMessage({ type: 'error', text: 'Failed to delete quote' })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCopyLink = async () => {
    if (!invoiceLink) return
    await navigator.clipboard.writeText(invoiceLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyQuoteLink = async () => {
    if (!quoteLink) return
    await navigator.clipboard.writeText(quoteLink)
    setQuoteLinkCopied(true)
    setTimeout(() => setQuoteLinkCopied(false), 2000)
  }

  const handleDepositPaidOffPlatform = async () => {
    setDepositProcessing(true)
    setActionMessage(null)
    try {
      await markDepositPaidOffPlatform(quote.id, depositPaymentMethod)
      onUpdateQuote({ ...quote, status: 'booked' })
      setShowDepositConfirm(false)
      setActionMessage({ type: 'success', text: `Deposit marked paid via ${depositPaymentMethod} — booking created` })
    } catch (err) {
      console.error('Failed to mark deposit paid:', err)
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to process' })
    } finally {
      setDepositProcessing(false)
    }
  }

  const handleQuoteSaved = (updatedQuote: Quote) => {
    onUpdateQuote(updatedQuote)
    setShowQuoteBuilder(false)
    if (updatedQuote.line_items) {
      setLineItems(updatedQuote.line_items)
    }
    if (updatedQuote.quoted_amount) {
      setQuotedAmount(updatedQuote.quoted_amount.toString())
    }
    if (updatedQuote.quote_sent_at) {
      setActionMessage({ type: 'success', text: `Quote sent to ${quote.email}` })
      getQuotePublicLink(quote.id).then(setQuoteLink).catch(() => {})
    } else {
      setActionMessage({ type: 'success', text: 'Draft saved' })
    }
    // Reload line items from server
    getQuoteWithLineItems(quote.id)
      .then((data) => setLineItems(data.line_items))
      .catch(() => {})
  }

  const hasLineItems = lineItems.length > 0

  const amount = quotedAmount ? parseFloat(quotedAmount) : 0
  const depositAmount = Math.round(amount * depositPercent / 100)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-dark-border bg-dark-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-border p-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Quote Details</h2>
                <p className="text-sm text-gray-400">
                  Submitted {formatDate(quote.created_at)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Action message */}
              {actionMessage && (
                <div className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {actionMessage.text}
                </div>
              )}

              {/* Client info — compact row */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                  {quote.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{quote.name}</p>
                    <Badge variant={statusBadgeVariant[quote.status] || 'outline'}>
                      {quote.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <a href={`mailto:${quote.email}`} className="flex items-center gap-1 hover:text-gold truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {quote.email}
                    </a>
                    <a href={`tel:${quote.phone}`} className="flex items-center gap-1 hover:text-gold shrink-0">
                      <Phone className="h-3.5 w-3.5" />
                      {quote.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Event details — 3-col grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-dark-border p-2.5">
                  <p className="text-xs text-gray-500">Event</p>
                  <p className="text-sm font-medium text-white">{quote.event_type}</p>
                </div>
                <div className="rounded-lg border border-dark-border p-2.5">
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="text-sm font-medium text-white truncate">
                    {quote.preferred_vehicle_id ? vehicleNames[quote.preferred_vehicle_id] || 'Unknown' : 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border border-dark-border p-2.5">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium text-white">{formatDate(quote.event_date)}</p>
                </div>
                <div className="rounded-lg border border-dark-border p-2.5">
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-sm font-medium text-white">{quote.pickup_time ? formatTime(quote.pickup_time) : 'TBD'}</p>
                </div>
                <div className="rounded-lg border border-dark-border p-2.5">
                  <p className="text-xs text-gray-500">Guests</p>
                  <p className="text-sm font-medium text-white">{quote.guest_count || 'TBD'}</p>
                </div>
                <div className="rounded-lg border border-dark-border p-2.5">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium text-white">
                    {quote.duration_hours ? `${quote.duration_hours}h` : 'TBD'}
                  </p>
                </div>
              </div>

              {/* Locations — inline */}
              {(quote.pickup_location || quote.dropoff_location) && (
                <div className="flex flex-col gap-1.5 text-sm">
                  {quote.pickup_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span className="text-gray-500">Pickup:</span>
                      <span className="text-white truncate">{quote.pickup_location}</span>
                    </div>
                  )}
                  {quote.dropoff_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-red-400" />
                      <span className="text-gray-500">Dropoff:</span>
                      <span className="text-white truncate">{quote.dropoff_location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Client message */}
              {quote.details && (
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Client Message</p>
                  <p className="rounded-lg border border-dark-border bg-black/50 p-2.5 text-sm text-gray-300">
                    {quote.details}
                  </p>
                </div>
              )}

              {/* Invoice info (when invoiced) */}
              {quote.status === 'invoiced' && invoice && (
                <div className="rounded-lg border border-dark-border bg-black/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Invoice</span>
                    <Badge variant={invoice.status === 'viewed' ? 'gold' : 'purple'}>
                      {invoice.status === 'viewed' ? 'Viewed' : 'Sent'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total</span>
                    <span className="font-medium text-white">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Deposit ({invoice.deposit_percent}%)</span>
                    <span className="font-bold text-gold">{formatCurrency(invoice.deposit_amount)}</span>
                  </div>
                  {invoiceLink && (
                    <button
                      onClick={handleCopyLink}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dark-border bg-black px-3 py-2 text-xs font-medium text-gray-300 transition-all hover:border-gold/30 hover:text-gold"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Invoice Link
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Status + Amount row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Status</p>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                    className="w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {!showQuoteBuilder && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Quoted Amount</p>
                    {hasLineItems ? (
                      <div className="flex items-center gap-2 rounded-lg border border-dark-border bg-black/50 px-3 py-2">
                        <DollarSign className="h-4 w-4 text-gold" />
                        <span className="text-sm font-medium text-white">{formatCurrency(amount)}</span>
                        <span className="text-xs text-gray-500">({lineItems.length} items)</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <input
                          type="number"
                          value={quotedAmount}
                          onChange={(e) => setQuotedAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-dark-border bg-black py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quote Sent status card */}
              {quote.quote_sent_at && !showQuoteBuilder && (
                <div className="rounded-lg border border-dark-border bg-black/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Quote Sent</span>
                    <span className="text-xs text-gray-400">{formatDate(quote.quote_sent_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total</span>
                    <span className="font-bold text-gold">{formatCurrency(amount)}</span>
                  </div>
                  {hasLineItems && (
                    <div className="border-t border-dark-border pt-2">
                      <p className="text-xs text-gray-500 mb-1">{lineItems.length} line item{lineItems.length > 1 ? 's' : ''}</p>
                      {lineItems.slice(0, 3).map((li) => (
                        <div key={li.id} className="flex justify-between text-xs text-gray-400">
                          <span className="truncate mr-2">{li.description}</span>
                          <span>${(li.quantity * li.unit_price).toLocaleString()}</span>
                        </div>
                      ))}
                      {lineItems.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">+{lineItems.length - 3} more</p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {quoteLink && (
                      <button
                        onClick={handleCopyQuoteLink}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-dark-border bg-black px-3 py-2 text-xs font-medium text-gray-300 transition-all hover:border-gold/30 hover:text-gold"
                      >
                        {quoteLinkCopied ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Quote Link
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setShowQuoteBuilder(true)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-dark-border bg-black px-3 py-2 text-xs font-medium text-gray-300 transition-all hover:border-gold/30 hover:text-gold"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Edit Quote
                    </button>
                  </div>
                </div>
              )}

              {/* Quote Builder */}
              {showQuoteBuilder && (
                <QuoteBuilder
                  quote={quote}
                  vehicle={vehicle}
                  onSaved={handleQuoteSaved}
                  onCancel={() => setShowQuoteBuilder(false)}
                  adminNotes={adminNotes}
                />
              )}

              {/* Send Invoice form (inline) */}
              {showInvoiceForm && amount > 0 && (
                <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 space-y-3">
                  <h3 className="text-sm font-semibold text-gold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Send Invoice
                  </h3>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Deposit Percentage</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={depositPercent}
                        onChange={(e) => setDepositPercent(Math.min(100, Math.max(10, parseInt(e.target.value) || 50)))}
                        className="w-20 rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                      />
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-dark-border bg-black/50 p-2.5 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total</span>
                      <span className="text-white">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Deposit ({depositPercent}%)</span>
                      <span className="font-bold text-gold">{formatCurrency(depositAmount)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Invoice will be emailed to <span className="text-white">{quote.email}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendInvoice}
                      disabled={sendingInvoice}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {sendingInvoice ? 'Sending...' : 'Send Invoice'}
                    </button>
                    <button
                      onClick={() => setShowInvoiceForm(false)}
                      className="rounded-lg border border-dark-border px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Admin notes */}
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">Admin Notes</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this quote..."
                  rows={2}
                  className="w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 resize-y"
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t border-dark-border p-4 space-y-3">
              {/* Quick action buttons — contextual based on status */}
              <div className="flex flex-wrap gap-2">
                {(quote.status === 'new' || quote.status === 'contacted') && (
                  <button
                    onClick={() => handleQuickAction('contacted')}
                    className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold transition-all hover:bg-gold/20"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Mark Contacted
                  </button>
                )}

                {(quote.status === 'new' || quote.status === 'contacted' || quote.status === 'quoted') && !showQuoteBuilder && (
                  <button
                    onClick={() => setShowQuoteBuilder(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-royal/40 bg-royal/10 px-4 py-2.5 text-sm font-semibold text-royal-light transition-all hover:bg-royal/20"
                  >
                    <FileText className="h-4 w-4" />
                    Build Quote
                  </button>
                )}

                {(quote.status === 'quoted') && amount > 0 && !showInvoiceForm && (
                  <button
                    onClick={() => setShowInvoiceForm(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light"
                  >
                    <FileText className="h-4 w-4" />
                    Send Invoice
                  </button>
                )}

                {quote.status === 'invoiced' && invoice && (
                  <>
                    <button
                      onClick={handleMarkPaid}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <CreditCard className="h-4 w-4" />
                      {saving ? 'Processing...' : 'Mark Paid (Manual)'}
                    </button>
                    {invoiceLink && (
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-2 rounded-lg border border-dark-border bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <LinkIcon className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    )}
                    <button
                      onClick={handleCancelInvoice}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Invoice
                    </button>
                  </>
                )}

                {(quote.status === 'quoted' || quote.status === 'invoiced') && amount > 0 && (
                  <button
                    onClick={() => setShowDepositConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
                  >
                    <DollarSign className="h-4 w-4" />
                    Deposit Paid (Zelle/Venmo/CashApp)
                  </button>
                )}

                {quote.status !== 'booked' && quote.status !== 'completed' && quote.status !== 'cancelled' && quote.status !== 'invoiced' && (
                  <button
                    onClick={() => handleQuickAction('cancelled')}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </button>
                )}

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>

          {/* Deposit paid confirmation popup */}
          {showDepositConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/60"
                onClick={() => setShowDepositConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-white">Confirm Deposit Payment</h3>
                <p className="mt-2 text-sm text-gray-400">
                  This will mark the deposit as paid and create a booking for <span className="font-medium text-white">{quote.name}</span>.
                </p>

                <div className="mt-4 rounded-lg border border-dark-border bg-black/50 p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Deposit ({quote.deposit_percent}%)</span>
                    <span className="font-bold text-gold">{formatCurrency(depositAmount)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Payment Method</label>
                  <select
                    value={depositPaymentMethod}
                    onChange={(e) => setDepositPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-dark-border bg-black px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="Zelle">Zelle</option>
                    <option value="Venmo">Venmo</option>
                    <option value="CashApp">CashApp</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowDepositConfirm(false)}
                    className="flex-1 rounded-lg border border-dark-border px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDepositPaidOffPlatform}
                    disabled={depositProcessing}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {depositProcessing ? 'Processing...' : 'Confirm Paid'}
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {/* Delete confirmation popup */}
          {showDeleteConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/60"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-500/30 bg-dark-card p-6 shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-white">Delete Quote</h3>
                <p className="mt-2 text-sm text-gray-400">
                  This will permanently delete this quote from <span className="font-medium text-white">{quote.name}</span>, along with all related invoices and bookings. This cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border border-dark-border px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteQuote}
                    disabled={deleting}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Forever'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
