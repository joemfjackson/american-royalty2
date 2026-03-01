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
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getBookings, getVehicleNames, updateBookingStatus } from '@/lib/actions/admin'
import { formatDate, formatCurrency } from '@/lib/utils'
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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [vehicleNames, setVehicleNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

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
      <div>
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="mt-1 text-sm text-gray-400">
          {bookings.length} total bookings
        </p>
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-dark-border bg-dark-card shadow-2xl"
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
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Client info */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Client
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                        {selectedBooking.client_name.charAt(0)}
                      </div>
                      <p className="font-medium text-white">{selectedBooking.client_name}</p>
                    </div>
                    {selectedBooking.client_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="h-4 w-4 text-gray-500" />
                        {selectedBooking.client_email}
                      </div>
                    )}
                    {selectedBooking.client_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone className="h-4 w-4 text-gray-500" />
                        {selectedBooking.client_phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking details grid */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-dark-border p-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" /> Date
                      </div>
                      <p className="mt-1 text-sm font-medium text-white">
                        {formatDate(selectedBooking.booking_date)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-dark-border p-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" /> Time
                      </div>
                      <p className="mt-1 text-sm font-medium text-white">
                        {selectedBooking.start_time} - {selectedBooking.end_time || 'TBD'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-dark-border p-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Car className="h-3 w-3" /> Vehicle
                      </div>
                      <p className="mt-1 text-sm font-medium text-white">
                        {getVehicleName(selectedBooking.vehicle_id)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-dark-border p-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="h-3 w-3" /> Guests
                      </div>
                      <p className="mt-1 text-sm font-medium text-white">
                        {selectedBooking.guest_count || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                {(selectedBooking.pickup_location || selectedBooking.dropoff_location) && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                      Locations
                    </h3>
                    <div className="space-y-2">
                      {selectedBooking.pickup_location && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          <span className="text-gray-300">
                            <span className="text-gray-500">Pickup:</span> {selectedBooking.pickup_location}
                          </span>
                        </div>
                      )}
                      {selectedBooking.dropoff_location && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                          <span className="text-gray-300">
                            <span className="text-gray-500">Dropoff:</span> {selectedBooking.dropoff_location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Financial
                  </h3>
                  <div className="space-y-2 rounded-lg border border-dark-border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total Amount</span>
                      <span className="font-semibold text-white">
                        {selectedBooking.total_amount ? formatCurrency(selectedBooking.total_amount) : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Deposit Required</span>
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
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                      Notes
                    </h3>
                    <p className="rounded-lg border border-dark-border bg-black/50 p-3 text-sm text-gray-300">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {/* Status change */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Update Status
                  </h3>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value as BookingStatus)}
                    className="w-full rounded-lg border border-dark-border bg-black px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
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
    </div>
  )
}
