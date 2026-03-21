'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  Plus,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getBookings, getVehicleNames, updateBookingStatus, createBooking } from '@/lib/actions/admin'
import { formatDate, formatCurrency } from '@/lib/utils'
import { EVENT_TYPES } from '@/lib/constants'
import type { Booking } from '@/types'

type BookingStatus = Booking['status']

const STATUS_TABS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'deposit_paid', label: 'Deposit Paid' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusBadgeVariant: Record<string, 'yellow' | 'gold' | 'purple' | 'green' | 'red' | 'outline'> = {
  pending: 'yellow',
  confirmed: 'green',
  deposit_paid: 'gold',
  in_progress: 'purple',
  completed: 'green',
  cancelled: 'red',
}

const EMPTY_FORM = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  eventType: EVENT_TYPES[0] as string,
  bookingDate: '',
  startTime: '',
  endTime: '',
  durationHours: '',
  vehicleId: '',
  pickupLocation: '',
  dropoffLocation: '',
  guestCount: '',
  totalAmount: '',
  depositAmount: '',
  depositPaid: false,
  notes: '',
}

const inputClass =
  'w-full rounded-lg border border-dark-border bg-black px-4 py-3 text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [vehicleNames, setVehicleNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    async function load() {
      try {
        const [b, vn] = await Promise.all([getBookings(), getVehicleNames()])
        setBookings(b)
        setVehicleNames(vn)
      } catch (err) {
        console.error('Failed to load bookings:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getVehicleName = (id: string | null) => id ? vehicleNames[id] || 'Unknown' : 'Not specified'

  const filteredBookings = useMemo(() => {
    let result = [...bookings]

    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter)
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.client_name.toLowerCase().includes(term) ||
          (b.client_email && b.client_email.toLowerCase().includes(term)) ||
          (b.client_phone && b.client_phone.includes(term))
      )
    }

    result.sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())

    return result
  }, [bookings, search, statusFilter])

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const updated = await updateBookingStatus(bookingId, newStatus)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updated : b))
      )
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(updated)
      }
    } catch (err) {
      console.error('Failed to update booking status:', err)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError(null)
    try {
      const created = await createBooking({
        clientName: form.clientName,
        clientEmail: form.clientEmail || null,
        clientPhone: form.clientPhone || null,
        eventType: form.eventType,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime || null,
        durationHours: form.durationHours ? parseInt(form.durationHours) : null,
        vehicleId: form.vehicleId || null,
        pickupLocation: form.pickupLocation || null,
        dropoffLocation: form.dropoffLocation || null,
        guestCount: form.guestCount ? parseInt(form.guestCount) : null,
        totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null,
        depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : null,
        depositPaid: form.depositPaid,
        notes: form.notes || null,
      })
      setBookings((prev) => [created, ...prev])
      setCreateOpen(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setCreateLoading(false)
    }
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="mt-1 text-sm text-gray-400">
            {bookings.length} total bookings
          </p>
        </div>
        <button
          onClick={() => { setCreateOpen(true); setCreateError(null) }}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
        >
          <Plus className="h-4 w-4" />
          Add Booking
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'all'
            ? bookings.length
            : bookings.filter((b) => b.status === tab.value).length
          return (
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
              <span className="ml-1.5 text-xs opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name, email, or phone..."
          className="w-full rounded-lg border border-dark-border bg-dark-card py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 sm:max-w-md"
        />
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 sm:hidden">
        {filteredBookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              className="cursor-pointer !p-4 transition-all hover:border-gold/20 active:scale-[0.99]"
              onClick={() => {
                setSelectedBooking(booking)
                setDetailOpen(true)
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                    {booking.client_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">{booking.client_name}</p>
                    <p className="text-xs text-gray-400">{booking.event_type}</p>
                  </div>
                </div>
                <Badge variant={statusBadgeVariant[booking.status] || 'outline'} className="shrink-0 text-[10px]">
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-gray-400">
                <span>{formatDate(booking.booking_date)}</span>
                <span className="shrink-0">{booking.start_time}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span className="truncate">{getVehicleName(booking.vehicle_id)}</span>
                <span className="shrink-0 ml-2 font-semibold text-gold">
                  {booking.total_amount ? formatCurrency(booking.total_amount) : '-'}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
        {filteredBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Filter className="mb-2 h-8 w-8" />
            <p className="font-medium">No bookings found</p>
            <p className="mt-1 text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hidden sm:block">
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border text-left">
                  <th className="p-4 pb-3 font-medium text-gray-400">Client</th>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Event</th>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Vehicle</th>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Date</th>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Time</th>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Duration</th>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Status</th>
                  <th className="pb-3 pr-4 font-medium text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => {
                      setSelectedBooking(booking)
                      setDetailOpen(true)
                    }}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="p-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                          {booking.client_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white whitespace-nowrap">{booking.client_name}</p>
                          <p className="text-xs text-gray-400">{booking.client_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{booking.event_type}</td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                      {getVehicleName(booking.vehicle_id)}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                      {formatDate(booking.booking_date)}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                      {booking.start_time}{booking.end_time ? ` - ${booking.end_time}` : ''}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                      {booking.duration_hours ? `${booking.duration_hours}h` : '-'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusBadgeVariant[booking.status] || 'outline'}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-gold whitespace-nowrap">
                      {booking.total_amount ? formatCurrency(booking.total_amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Filter className="mb-2 h-8 w-8" />
                <p className="font-medium">No bookings found</p>
                <p className="mt-1 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Booking detail slide-in panel */}
      <AnimatePresence>
        {detailOpen && selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setDetailOpen(false)}
            />
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
                  <h2 className="text-lg font-semibold text-white">Booking Details</h2>
                  <p className="text-sm text-gray-400">
                    {selectedBooking.event_type}
                  </p>
                </div>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Client info — compact row */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                    {selectedBooking.client_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{selectedBooking.client_name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {selectedBooking.client_email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {selectedBooking.client_email}
                        </span>
                      )}
                      {selectedBooking.client_phone && (
                        <span className="flex items-center gap-1 shrink-0">
                          <Phone className="h-3.5 w-3.5" />
                          {selectedBooking.client_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking details — 3-col grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-dark-border p-2.5">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium text-white">
                      {formatDate(selectedBooking.booking_date)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-dark-border p-2.5">
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium text-white">
                      {selectedBooking.start_time} - {selectedBooking.end_time || 'TBD'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-dark-border p-2.5">
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="text-sm font-medium text-white truncate">
                      {getVehicleName(selectedBooking.vehicle_id)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-dark-border p-2.5">
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="text-sm font-medium text-white">
                      {selectedBooking.guest_count || 'N/A'}
                    </p>
                  </div>
                  {selectedBooking.pickup_location && (
                    <div className="rounded-lg border border-dark-border p-2.5">
                      <p className="text-xs text-gray-500">Pickup</p>
                      <p className="text-sm font-medium text-white truncate">
                        {selectedBooking.pickup_location}
                      </p>
                    </div>
                  )}
                  {selectedBooking.dropoff_location && (
                    <div className="rounded-lg border border-dark-border p-2.5">
                      <p className="text-xs text-gray-500">Dropoff</p>
                      <p className="text-sm font-medium text-white truncate">
                        {selectedBooking.dropoff_location}
                      </p>
                    </div>
                  )}
                </div>

                {/* Financial */}
                <div className="rounded-lg border border-dark-border p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total</span>
                    <span className="font-semibold text-white">
                      {selectedBooking.total_amount ? formatCurrency(selectedBooking.total_amount) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Deposit</span>
                    <span className="text-white">
                      {selectedBooking.deposit_amount ? formatCurrency(selectedBooking.deposit_amount) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Deposit Status</span>
                    <Badge variant={selectedBooking.deposit_paid ? 'green' : 'yellow'}>
                      {selectedBooking.deposit_paid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                  {selectedBooking.total_amount && selectedBooking.deposit_amount && (
                    <div className="flex items-center justify-between border-t border-dark-border pt-2 text-sm">
                      <span className="text-gray-400">Balance Due</span>
                      <span className="font-semibold text-gold">
                        {formatCurrency(
                          selectedBooking.total_amount -
                            (selectedBooking.deposit_paid ? selectedBooking.deposit_amount : 0)
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Notes</p>
                    <p className="rounded-lg border border-dark-border bg-black/50 p-2.5 text-sm text-gray-300">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Status</p>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value as BookingStatus)}
                    className="w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create booking modal */}
      <AnimatePresence>
        {createOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => { setCreateOpen(false); setForm(EMPTY_FORM); setCreateError(null) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">New Booking</h2>
                <button
                  onClick={() => { setCreateOpen(false); setForm(EMPTY_FORM); setCreateError(null) }}
                  className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-6">
                {/* Client Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Client Info</h3>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-300">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.clientName}
                      onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                      className={inputClass}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
                      <input
                        type="email"
                        value={form.clientEmail}
                        onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                        className={inputClass}
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">Phone</label>
                      <input
                        type="tel"
                        value={form.clientPhone}
                        onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                        className={inputClass}
                        placeholder="(702) 555-0100"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Event Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">
                        Event Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={form.eventType}
                        onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                        className={inputClass}
                      >
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">
                        Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={form.bookingDate}
                        onChange={(e) => setForm((f) => ({ ...f, bookingDate: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">
                        Start Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.startTime}
                        onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                        className={inputClass}
                        placeholder="6:00 PM"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">End Time</label>
                      <input
                        type="text"
                        value={form.endTime}
                        onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                        className={inputClass}
                        placeholder="10:00 PM"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">Duration (hours)</label>
                      <input
                        type="number"
                        min="1"
                        value={form.durationHours}
                        onChange={(e) => setForm((f) => ({ ...f, durationHours: e.target.value }))}
                        className={inputClass}
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">Guest Count</label>
                      <input
                        type="number"
                        min="1"
                        value={form.guestCount}
                        onChange={(e) => setForm((f) => ({ ...f, guestCount: e.target.value }))}
                        className={inputClass}
                        placeholder="20"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Vehicle</h3>
                  <select
                    value={form.vehicleId}
                    onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    {Object.entries(vehicleNames).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Locations */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Locations</h3>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-300">Pickup Location</label>
                    <input
                      type="text"
                      value={form.pickupLocation}
                      onChange={(e) => setForm((f) => ({ ...f, pickupLocation: e.target.value }))}
                      className={inputClass}
                      placeholder="MGM Grand, Las Vegas Strip"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-300">Dropoff Location</label>
                    <input
                      type="text"
                      value={form.dropoffLocation}
                      onChange={(e) => setForm((f) => ({ ...f, dropoffLocation: e.target.value }))}
                      className={inputClass}
                      placeholder="Wynn Las Vegas"
                    />
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Payment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">Total Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.totalAmount}
                        onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">Deposit Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.depositAmount}
                        onChange={(e) => setForm((f) => ({ ...f, depositAmount: e.target.value }))}
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={form.depositPaid}
                        onChange={(e) => setForm((f) => ({ ...f, depositPaid: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full border border-dark-border bg-black peer-checked:bg-gold/30 peer-focus:ring-2 peer-focus:ring-gold/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-dark-border after:bg-dark-card after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-gold/50 peer-checked:after:bg-gold" />
                    </label>
                    <span className="text-sm text-gray-300">Deposit already paid</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className={`${inputClass} resize-y`}
                    placeholder="Special requests, internal notes..."
                  />
                </div>

                {/* Error */}
                {createError && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {createError}
                  </p>
                )}

                {/* Footer */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setCreateOpen(false); setForm(EMPTY_FORM); setCreateError(null) }}
                    className="flex-1 rounded-lg border border-dark-border px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50"
                  >
                    {createLoading ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
