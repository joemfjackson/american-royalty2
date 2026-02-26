'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Car,
  MapPin,
  X,
  CalendarDays,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MOCK_BOOKINGS, getVehicleName } from '@/lib/admin-mock-data'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Booking } from '@/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Color assignments per vehicle for calendar pills
const vehicleColors: Record<string, { bg: string; text: string; border: string }> = {
  '1': { bg: 'bg-gold/15', text: 'text-gold', border: 'border-gold/30' },           // The Sovereign
  '2': { bg: 'bg-royal/15', text: 'text-royal-light', border: 'border-royal/30' },   // Crown Jewel
  '3': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' }, // Royal Sprinter
  '4': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' }, // The Monarch
  '5': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' }, // Black Diamond
  '6': { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' }, // The Empire
}

const statusBadgeVariant: Record<string, 'yellow' | 'gold' | 'purple' | 'green' | 'red' | 'outline'> = {
  pending: 'yellow',
  confirmed: 'green',
  deposit_paid: 'gold',
  in_progress: 'purple',
  completed: 'green',
  cancelled: 'red',
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function AdminCalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    MOCK_BOOKINGS.forEach((b) => {
      if (b.status !== 'cancelled') {
        if (!map[b.booking_date]) map[b.booking_date] = []
        map[b.booking_date].push(b)
      }
    })
    return map
  }, [])

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const days: { date: number; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = []

    // Previous month padding
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const m = String(prevMonth + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      days.push({
        date: d,
        dateStr: `${prevYear}-${m}-${dd}`,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(currentMonth + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      const dateStr = `${currentYear}-${m}-${dd}`
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: true,
        isToday:
          d === today.getDate() &&
          currentMonth === today.getMonth() &&
          currentYear === today.getFullYear(),
      })
    }

    // Next month padding (fill to 42 cells for 6 rows)
    const remaining = 42 - days.length
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    for (let d = 1; d <= remaining; d++) {
      const m = String(nextMonth + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      days.push({
        date: d,
        dateStr: `${nextYear}-${m}-${dd}`,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return days
  }, [currentYear, currentMonth, today])

  const selectedDayBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : []

  const upcomingBookings = useMemo(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return MOCK_BOOKINGS
      .filter((b) => b.booking_date >= todayStr && b.status !== 'cancelled')
      .sort((a, b) => a.booking_date.localeCompare(b.booking_date))
      .slice(0, 5)
  }, [today])

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-0 overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between border-b border-dark-border p-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={goToToday}
                  className="rounded-md bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  Today
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPrevMonth}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-dark-border">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const dayBookings = bookingsByDate[day.dateStr] || []
                const isSelected = selectedDate === day.dateStr
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`min-h-[80px] cursor-pointer border-b border-r border-dark-border p-1.5 transition-colors sm:min-h-[100px] sm:p-2 ${
                      !day.isCurrentMonth ? 'bg-black/30' : ''
                    } ${isSelected ? 'bg-gold/5' : 'hover:bg-white/[0.02]'} ${
                      day.isToday ? 'bg-gold/[0.03]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          day.isToday
                            ? 'bg-gold text-black'
                            : day.isCurrentMonth
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}
                      >
                        {day.date}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="text-[10px] font-medium text-gray-500 sm:hidden">
                          {dayBookings.length}
                        </span>
                      )}
                    </div>

                    {/* Booking pills - hidden on very small screens */}
                    <div className="mt-1 hidden space-y-0.5 sm:block">
                      {dayBookings.slice(0, 2).map((booking) => {
                        const colors = vehicleColors[booking.vehicle_id || ''] || {
                          bg: 'bg-gray-500/15',
                          text: 'text-gray-400',
                          border: 'border-gray-500/30',
                        }
                        return (
                          <button
                            key={booking.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedBooking(booking)
                            }}
                            className={`w-full truncate rounded-md border px-1.5 py-0.5 text-left text-[10px] font-medium transition-all hover:opacity-80 ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {booking.start_time} {booking.client_name.split(' ')[0]}
                          </button>
                        )
                      })}
                      {dayBookings.length > 2 && (
                        <p className="text-[10px] text-gray-500 pl-1">
                          +{dayBookings.length - 2} more
                        </p>
                      )}
                    </div>

                    {/* Mobile dot indicator */}
                    {dayBookings.length > 0 && (
                      <div className="mt-1 flex gap-0.5 sm:hidden">
                        {dayBookings.slice(0, 3).map((b) => {
                          const colors = vehicleColors[b.vehicle_id || ''] || {
                            bg: 'bg-gray-400',
                            text: '',
                            border: '',
                          }
                          return (
                            <div
                              key={b.id}
                              className={`h-1.5 w-1.5 rounded-full ${colors.bg}`}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected date bookings */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              {selectedDate ? formatDate(selectedDate) : "Select a Date"}
            </h3>
            {selectedDate ? (
              selectedDayBookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full rounded-lg border border-dark-border p-3 text-left transition-all hover:border-gold/20 hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{booking.client_name}</p>
                        <Badge variant={statusBadgeVariant[booking.status] || 'outline'} className="text-[10px]">
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="mt-1.5 space-y-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {booking.start_time} - {booking.end_time || 'TBD'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Car className="h-3 w-3" />
                          {getVehicleName(booking.vehicle_id)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          {booking.guest_count} guests
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-gray-500">
                  <CalendarDays className="mb-2 h-8 w-8" />
                  <p className="text-sm">No bookings on this date</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center py-6 text-gray-500">
                <CalendarDays className="mb-2 h-8 w-8" />
                <p className="text-sm">Click a date to see bookings</p>
              </div>
            )}
          </Card>

          {/* Upcoming bookings */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Upcoming
            </h3>
            <div className="space-y-2">
              {upcomingBookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all hover:bg-white/[0.03]"
                >
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <span className="text-[9px] font-bold uppercase leading-none">
                      {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold leading-tight">
                      {new Date(booking.booking_date + 'T00:00:00').getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{booking.client_name}</p>
                    <p className="text-xs text-gray-400">{booking.event_type}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Legend */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Vehicles
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '1', name: 'Sovereign' },
                { id: '2', name: 'Crown Jewel' },
                { id: '3', name: 'Royal Sprinter' },
                { id: '4', name: 'Monarch' },
                { id: '5', name: 'Black Diamond' },
                { id: '6', name: 'Empire' },
              ].map((v) => {
                const colors = vehicleColors[v.id]
                return (
                  <div key={v.id} className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${colors.bg} border ${colors.border}`} />
                    <span className="text-xs text-gray-400">{v.name}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Booking detail modal */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedBooking.client_name}</h2>
                  <p className="text-sm text-gray-400">{selectedBooking.event_type}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <Badge variant={statusBadgeVariant[selectedBooking.status] || 'outline'}>
                    {selectedBooking.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Date</span>
                  <span className="text-white">{formatDate(selectedBooking.booking_date)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Time</span>
                  <span className="text-white">
                    {selectedBooking.start_time} - {selectedBooking.end_time || 'TBD'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Vehicle</span>
                  <span className="text-white">{getVehicleName(selectedBooking.vehicle_id)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Guests</span>
                  <span className="text-white">{selectedBooking.guest_count || 'N/A'}</span>
                </div>
                {selectedBooking.pickup_location && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Pickup</span>
                    <span className="text-white">{selectedBooking.pickup_location}</span>
                  </div>
                )}
                {selectedBooking.total_amount && (
                  <div className="flex items-center justify-between text-sm border-t border-dark-border pt-3">
                    <span className="text-gray-400">Total</span>
                    <span className="font-semibold text-gold">{formatCurrency(selectedBooking.total_amount)}</span>
                  </div>
                )}
                {selectedBooking.notes && (
                  <div className="border-t border-dark-border pt-3">
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-300">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
