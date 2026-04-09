'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ArrowUpDown, Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { QuoteDetailInlineContent } from '@/components/admin/QuoteDetailPanel'
import { getQuotes, getVehicleNames, createQuoteManually } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { EVENT_TYPES } from '@/lib/constants'
import type { Quote } from '@/types'

type QuoteStatus = Quote['status']
type SortField = 'name' | 'email' | 'event_type' | 'event_date' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

const STATUS_TABS: { value: QuoteStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'booked', label: 'Booked' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusBadgeVariant: Record<string, 'yellow' | 'gold' | 'purple' | 'green' | 'red' | 'outline'> = {
  new: 'yellow',
  contacted: 'gold',
  quoted: 'purple',
  invoiced: 'gold',
  booked: 'green',
  completed: 'green',
  cancelled: 'red',
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [vehicleNames, setVehicleNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingQuote, setAddingQuote] = useState(false)
  const [newQuote, setNewQuote] = useState({
    name: '', email: '', phone: '', event_type: 'Bachelor Party',
    event_date: '', pickup_time: '', duration_hours: '',
    guest_count: '', preferred_vehicle_id: '',
    pickup_location: '', dropoff_location: '', details: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const [q, vn] = await Promise.all([getQuotes(), getVehicleNames()])
        setQuotes(q)
        setVehicleNames(vn)
      } catch (err) {
        console.error('Failed to load quotes:', err)
        setError('Failed to load quotes. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getVehicleName = (id: string | null) => id ? vehicleNames[id] || 'Unknown' : 'Not specified'

  const filteredQuotes = useMemo(() => {
    let result = [...quotes]

    if (statusFilter !== 'all') {
      result = result.filter((q) => q.status === statusFilter)
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(term) ||
          q.email.toLowerCase().includes(term) ||
          q.phone.includes(term)
      )
    }

    result.sort((a, b) => {
      const aVal = a[sortField] || ''
      const bVal = b[sortField] || ''
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [quotes, search, statusFilter, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleRowClick = (quote: Quote) => {
    setExpandedQuoteId((prev) => (prev === quote.id ? null : quote.id))
  }

  const handleUpdateQuote = (updated: Quote) => {
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
  }

  const handleAddQuote = async () => {
    if (!newQuote.name || !newQuote.email || !newQuote.phone || !newQuote.event_date) return
    setAddingQuote(true)
    try {
      const created = await createQuoteManually({
        name: newQuote.name,
        email: newQuote.email,
        phone: newQuote.phone,
        event_type: newQuote.event_type,
        event_date: newQuote.event_date,
        pickup_time: newQuote.pickup_time || null,
        duration_hours: newQuote.duration_hours ? parseInt(newQuote.duration_hours) : null,
        guest_count: newQuote.guest_count ? parseInt(newQuote.guest_count) : null,
        preferred_vehicle_id: newQuote.preferred_vehicle_id || null,
        pickup_location: newQuote.pickup_location || null,
        dropoff_location: newQuote.dropoff_location || null,
        details: newQuote.details || null,
      })
      setQuotes((prev) => [created, ...prev])
      setShowAddModal(false)
      setNewQuote({
        name: '', email: '', phone: '', event_type: 'Bachelor Party',
        event_date: '', pickup_time: '', duration_hours: '',
        guest_count: '', preferred_vehicle_id: '',
        pickup_location: '', dropoff_location: '', details: '',
      })
    } catch (err) {
      console.error('Failed to create quote:', err)
    } finally {
      setAddingQuote(false)
    }
  }

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== quoteId))
    setExpandedQuoteId(null)
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: quotes.length }
    quotes.forEach((q) => {
      counts[q.status] = (counts[q.status] || 0) + 1
    })
    return counts
  }, [quotes])

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="cursor-pointer pb-3 pr-4 font-medium text-gray-400 select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1 hover:text-gold transition-colors">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-gold' : 'text-gray-600'}`} />
      </span>
    </th>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-gold/10 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quote Submissions</h1>
          <p className="mt-1 text-sm text-gray-400">
            {quotes.length} total quotes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light"
        >
          <Plus className="h-4 w-4" />
          Add Quote
        </button>
      </div>

      {/* Status filter dropdown */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | 'all')}
          className="rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-sm font-medium text-white focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors"
        >
          {STATUS_TABS.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}{statusCounts[tab.value] !== undefined ? ` (${statusCounts[tab.value] || 0})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full rounded-lg border border-dark-border bg-dark-card py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 sm:max-w-md"
        />
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 sm:hidden">
        {filteredQuotes.map((quote) => (
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              className={`cursor-pointer !p-4 transition-all hover:border-gold/20 active:scale-[0.99] ${
                expandedQuoteId === quote.id ? 'border-gold/30' : ''
              }`}
              onClick={() => handleRowClick(quote)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                    {quote.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">{quote.name}</p>
                    <p className="text-xs text-gray-400 truncate">{quote.email}</p>
                  </div>
                </div>
                <Badge variant={statusBadgeVariant[quote.status] || 'outline'} className="shrink-0 text-[10px]">
                  {quote.status}
                </Badge>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-gray-400">
                <span className="truncate">{quote.event_type}</span>
                <span className="shrink-0 ml-2">{formatDate(quote.event_date)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>{quote.phone}</span>
                <span className="shrink-0 ml-2">{formatDate(quote.created_at)}</span>
              </div>
            </Card>
            <AnimatePresence>
              {expandedQuoteId === quote.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <QuoteDetailInlineContent
                      quote={quote}
                      onClose={() => setExpandedQuoteId(null)}
                      onUpdateQuote={handleUpdateQuote}
                      onDeleteQuote={handleDeleteQuote}
                      vehicleNames={vehicleNames}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {filteredQuotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Filter className="mb-2 h-8 w-8" />
            <p className="font-medium">No quotes found</p>
            <p className="mt-1 text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden sm:block"
      >
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border text-left">
                  <th className="p-4 pb-3 font-medium text-gray-400">
                    <span className="sr-only">Avatar</span>
                  </th>
                  <SortHeader field="name">Name</SortHeader>
                  <SortHeader field="email">Email</SortHeader>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Phone</th>
                  <SortHeader field="event_type">Event</SortHeader>
                  <SortHeader field="event_date">Date</SortHeader>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Vehicle</th>
                  <SortHeader field="status">Status</SortHeader>
                  <SortHeader field="created_at">Submitted</SortHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredQuotes.map((quote) => (
                  <React.Fragment key={quote.id}>
                    <tr
                      onClick={() => handleRowClick(quote)}
                      className={`cursor-pointer transition-colors hover:bg-white/[0.03] ${
                        expandedQuoteId === quote.id ? 'bg-white/[0.05] border-l-2 border-l-gold' : ''
                      }`}
                    >
                      <td className="p-4 pr-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                          {quote.name.charAt(0)}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium text-white whitespace-nowrap">
                        {quote.name}
                      </td>
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{quote.email}</td>
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{quote.phone}</td>
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{quote.event_type}</td>
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                        {formatDate(quote.event_date)}
                      </td>
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                        {getVehicleName(quote.preferred_vehicle_id)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusBadgeVariant[quote.status] || 'outline'}>
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                        {formatDate(quote.created_at)}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedQuoteId === quote.id && (
                        <tr>
                          <td colSpan={9} className="p-0 border-b border-gold/20" onClick={(e) => e.stopPropagation()}>
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="p-4">
                                <QuoteDetailInlineContent
                                  quote={quote}
                                  onClose={() => setExpandedQuoteId(null)}
                                  onUpdateQuote={handleUpdateQuote}
                                  onDeleteQuote={handleDeleteQuote}
                                  vehicleNames={vehicleNames}
                                />
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {filteredQuotes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Filter className="mb-2 h-8 w-8" />
                <p className="font-medium">No quotes found</p>
                <p className="mt-1 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Add Quote Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-dark-border bg-dark-card shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-dark-border p-4">
              <h2 className="text-lg font-semibold text-white">Add Quote</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Contact Info */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Contact</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <input type="text" placeholder="Full Name *" value={newQuote.name} onChange={(e) => setNewQuote({ ...newQuote, name: e.target.value })}
                      className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                  </div>
                  <input type="email" placeholder="Email *" value={newQuote.email} onChange={(e) => setNewQuote({ ...newQuote, email: e.target.value })}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                  <input type="tel" placeholder="Phone *" value={newQuote.phone} onChange={(e) => setNewQuote({ ...newQuote, phone: e.target.value })}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              {/* Event Info */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Event</p>
                <div className="space-y-2">
                  <select value={newQuote.event_type} onChange={(e) => setNewQuote({ ...newQuote, event_type: e.target.value })}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none">
                    {EVENT_TYPES.map((et) => <option key={et} value={et}>{et}</option>)}
                  </select>
                  <input type="date" value={newQuote.event_date} onChange={(e) => setNewQuote({ ...newQuote, event_date: e.target.value })}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none" />
                  <input type="time" value={newQuote.pickup_time} onChange={(e) => setNewQuote({ ...newQuote, pickup_time: e.target.value })}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="Guests" value={newQuote.guest_count} onChange={(e) => setNewQuote({ ...newQuote, guest_count: e.target.value })}
                      className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                    <input type="number" placeholder="Hours" value={newQuote.duration_hours} onChange={(e) => setNewQuote({ ...newQuote, duration_hours: e.target.value })}
                      className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                    <select value={newQuote.preferred_vehicle_id} onChange={(e) => setNewQuote({ ...newQuote, preferred_vehicle_id: e.target.value })}
                      className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none">
                      <option value="">Vehicle</option>
                      {Object.entries(vehicleNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Locations</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Pickup" value={newQuote.pickup_location} onChange={(e) => setNewQuote({ ...newQuote, pickup_location: e.target.value })}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                  <input type="text" placeholder="Drop-off" value={newQuote.dropoff_location} onChange={(e) => setNewQuote({ ...newQuote, dropoff_location: e.target.value })}
                    className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Notes</p>
                <textarea rows={2} placeholder="Details or special requests..." value={newQuote.details} onChange={(e) => setNewQuote({ ...newQuote, details: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="border-t border-dark-border p-4">
              <button
                onClick={handleAddQuote}
                disabled={addingQuote || !newQuote.name || !newQuote.email || !newQuote.phone || !newQuote.event_date}
                className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingQuote ? 'Creating...' : 'Create Quote'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
