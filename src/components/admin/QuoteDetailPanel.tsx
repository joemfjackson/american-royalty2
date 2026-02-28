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
  Car,
  DollarSign,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import type { Quote } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { updateQuote, convertQuoteToBooking } from '@/lib/actions/admin'
import { formatDate, formatCurrency } from '@/lib/utils'

type QuoteStatus = Quote['status']

const statusBadgeVariant: Record<string, 'yellow' | 'gold' | 'purple' | 'green' | 'red' | 'outline'> = {
  new: 'yellow',
  contacted: 'gold',
  quoted: 'purple',
  booked: 'green',
  completed: 'green',
  cancelled: 'red',
}

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'booked', label: 'Booked' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface QuoteDetailPanelProps {
  quote: Quote | null
  open: boolean
  onClose: () => void
  onUpdateQuote: (updated: Quote) => void
  vehicleNames?: Record<string, string>
}

export function QuoteDetailPanel({ quote, open, onClose, onUpdateQuote, vehicleNames = {} }: QuoteDetailPanelProps) {
  const [status, setStatus] = useState<QuoteStatus>(quote?.status || 'new')
  const [adminNotes, setAdminNotes] = useState(quote?.admin_notes || '')
  const [quotedAmount, setQuotedAmount] = useState(quote?.quoted_amount?.toString() || '')
  const [saving, setSaving] = useState(false)

  // Update local state when quote changes
  useEffect(() => {
    if (quote) {
      setStatus(quote.status)
      setAdminNotes(quote.admin_notes || '')
      setQuotedAmount(quote.quoted_amount?.toString() || '')
    }
  }, [quote])

  if (!quote) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save quote fields first
      const updated = await updateQuote(quote.id, {
        status,
        admin_notes: adminNotes || null,
        quoted_amount: quotedAmount ? parseFloat(quotedAmount) : null,
      })
      // If status changed to booked, also create a Booking record
      if (status === 'booked' && quote.status !== 'booked') {
        await convertQuoteToBooking(quote.id)
      }
      onUpdateQuote(updated)
    } catch (err) {
      console.error('Failed to save quote:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleQuickAction = async (newStatus: QuoteStatus) => {
    setStatus(newStatus)
    try {
      if (newStatus === 'booked') {
        // Save any pending changes first, then create a real Booking record
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-dark-border bg-dark-card shadow-2xl"
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
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Client info */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Client Information
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                      {quote.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{quote.name}</p>
                      <Badge variant={statusBadgeVariant[quote.status] || 'outline'}>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${quote.email}`} className="hover:text-gold">{quote.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${quote.phone}`} className="hover:text-gold">{quote.phone}</a>
                  </div>
                </div>
              </div>

              {/* Event details */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Event Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-dark-border p-3">
                    <p className="text-xs text-gray-400">Event Type</p>
                    <p className="mt-1 text-sm font-medium text-white">{quote.event_type}</p>
                  </div>
                  <div className="rounded-lg border border-dark-border p-3">
                    <p className="text-xs text-gray-400">Vehicle</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {quote.preferred_vehicle_id ? vehicleNames[quote.preferred_vehicle_id] || 'Unknown' : 'Not specified'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-dark-border p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      Date
                    </div>
                    <p className="mt-1 text-sm font-medium text-white">{formatDate(quote.event_date)}</p>
                  </div>
                  <div className="rounded-lg border border-dark-border p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      Time
                    </div>
                    <p className="mt-1 text-sm font-medium text-white">{quote.pickup_time || 'TBD'}</p>
                  </div>
                  <div className="rounded-lg border border-dark-border p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Users className="h-3 w-3" />
                      Guests
                    </div>
                    <p className="mt-1 text-sm font-medium text-white">{quote.guest_count || 'TBD'}</p>
                  </div>
                  <div className="rounded-lg border border-dark-border p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      Duration
                    </div>
                    <p className="mt-1 text-sm font-medium text-white">
                      {quote.duration_hours ? `${quote.duration_hours} hours` : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Locations */}
              {(quote.pickup_location || quote.dropoff_location) && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Locations
                  </h3>
                  <div className="space-y-2">
                    {quote.pickup_location && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <div>
                          <span className="text-gray-400">Pickup: </span>
                          <span className="text-white">{quote.pickup_location}</span>
                        </div>
                      </div>
                    )}
                    {quote.dropoff_location && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        <div>
                          <span className="text-gray-400">Dropoff: </span>
                          <span className="text-white">{quote.dropoff_location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Client message */}
              {quote.details && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Client Message
                  </h3>
                  <p className="rounded-lg border border-dark-border bg-black/50 p-3 text-sm text-gray-300">
                    {quote.details}
                  </p>
                </div>
              )}

              {/* Status change */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Update Status
                </h3>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                  className="w-full rounded-lg border border-dark-border bg-black px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quoted amount */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Quoted Amount
                </h3>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    value={quotedAmount}
                    onChange={(e) => setQuotedAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-dark-border bg-black py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                  />
                </div>
              </div>

              {/* Admin notes */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Admin Notes
                </h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this quote..."
                  rows={3}
                  className="w-full rounded-lg border border-dark-border bg-black px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 resize-y"
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t border-dark-border p-4 space-y-3">
              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickAction('contacted')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-2 text-xs font-medium text-gold transition-all hover:bg-gold/20"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleQuickAction('quoted')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-royal/10 px-3 py-2 text-xs font-medium text-royal-light transition-all hover:bg-royal/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send Quote
                </button>
                <button
                  onClick={() => handleQuickAction('booked')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Convert to Booking
                </button>
                <button
                  onClick={() => handleQuickAction('cancelled')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel
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
        </>
      )}
    </AnimatePresence>
  )
}
