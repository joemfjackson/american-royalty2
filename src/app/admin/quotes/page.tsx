'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ArrowUpDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { QuoteDetailPanel } from '@/components/admin/QuoteDetailPanel'
import { getQuotes, getVehicleNames } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import type { Quote } from '@/types'

type QuoteStatus = Quote['status']
type SortField = 'name' | 'email' | 'event_type' | 'event_date' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

const STATUS_TABS: { value: QuoteStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'booked', label: 'Booked' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusBadgeVariant: Record<string, 'yellow' | 'gold' | 'purple' | 'green' | 'red' | 'outline'> = {
  new: 'yellow',
  contacted: 'gold',
  quoted: 'purple',
  booked: 'green',
  completed: 'green',
  cancelled: 'red',
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [vehicleNames, setVehicleNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [q, vn] = await Promise.all([getQuotes(), getVehicleNames()])
        setQuotes(q)
        setVehicleNames(vn)
      } catch (err) {
        console.error('Failed to load quotes:', err)
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
    setSelectedQuote(quote)
    setPanelOpen(true)
  }

  const handleUpdateQuote = (updated: Quote) => {
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    setSelectedQuote(updated)
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
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              statusFilter === tab.value
                ? 'bg-gold/15 text-gold'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
            {statusCounts[tab.value] !== undefined && (
              <span className="ml-1.5 text-xs opacity-60">({statusCounts[tab.value] || 0})</span>
            )}
          </button>
        ))}
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
              className="cursor-pointer !p-4 transition-all hover:border-gold/20 active:scale-[0.99]"
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
                  <tr
                    key={quote.id}
                    onClick={() => handleRowClick(quote)}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
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

      {/* Quote detail panel */}
      <QuoteDetailPanel
        quote={selectedQuote}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onUpdateQuote={handleUpdateQuote}
        vehicleNames={vehicleNames}
      />
    </div>
  )
}
