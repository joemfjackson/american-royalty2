'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  MessageSquare,
  Send,
  CheckCircle,
  CalendarDays,
  DollarSign,
  ArrowRight,
  Clock,
  User,
  Car,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MOCK_QUOTES, MOCK_BOOKINGS, DASHBOARD_STATS, getVehicleName } from '@/lib/admin-mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusBadgeVariant: Record<string, 'yellow' | 'gold' | 'purple' | 'green' | 'red' | 'outline'> = {
  new: 'yellow',
  contacted: 'gold',
  quoted: 'purple',
  booked: 'green',
  completed: 'green',
  cancelled: 'red',
  pending: 'yellow',
  confirmed: 'green',
  deposit_paid: 'gold',
  in_progress: 'purple',
}

const statCards = [
  {
    label: 'New Quotes',
    value: DASHBOARD_STATS.newQuotes,
    icon: FileText,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    label: 'Pending Response',
    value: DASHBOARD_STATS.pendingResponse,
    icon: MessageSquare,
    color: 'text-gold',
    bg: 'bg-gold/10',
  },
  {
    label: 'Quoted',
    value: DASHBOARD_STATS.quoted,
    icon: Send,
    color: 'text-royal-light',
    bg: 'bg-royal/10',
  },
  {
    label: 'Booked',
    value: DASHBOARD_STATS.booked,
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    label: 'Upcoming Bookings',
    value: DASHBOARD_STATS.upcomingBookings,
    icon: CalendarDays,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    label: 'Monthly Revenue',
    value: formatCurrency(DASHBOARD_STATS.monthlyRevenue),
    icon: DollarSign,
    color: 'text-gold',
    bg: 'bg-gold/10',
  },
]

export default function AdminDashboardPage() {
  const recentQuotes = MOCK_QUOTES.slice(0, 5)
  const upcomingBookings = MOCK_BOOKINGS
    .filter((b) => b.status !== 'completed' && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group relative overflow-hidden transition-all duration-300 hover:border-gold/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/quotes"
          className="inline-flex items-center gap-2 rounded-lg bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold/20"
        >
          <FileText className="h-4 w-4" />
          View All Quotes
        </Link>
        <Link
          href="/admin/calendar"
          className="inline-flex items-center gap-2 rounded-lg bg-royal/10 px-4 py-2.5 text-sm font-medium text-royal-light transition-all hover:bg-royal/20"
        >
          <CalendarDays className="h-4 w-4" />
          View Calendar
        </Link>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
        >
          <CheckCircle className="h-4 w-4" />
          Add Booking
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Quotes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-lg font-semibold text-white">Recent Quote Submissions</h2>
              <Link
                href="/admin/quotes"
                className="flex items-center gap-1 text-sm text-gold hover:text-gold-light"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-border text-left">
                    <th className="pb-3 font-medium text-gray-400">Name</th>
                    <th className="pb-3 font-medium text-gray-400">Event</th>
                    <th className="pb-3 font-medium text-gray-400">Date</th>
                    <th className="pb-3 font-medium text-gray-400">Status</th>
                    <th className="pb-3 font-medium text-gray-400"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {recentQuotes.map((quote) => (
                    <tr key={quote.id} className="group">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                            {quote.name.charAt(0)}
                          </div>
                          <span className="font-medium text-white">{quote.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">{quote.event_type}</td>
                      <td className="py-3 pr-4 text-gray-300">{formatDate(quote.event_date)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusBadgeVariant[quote.status] || 'outline'}>
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Link
                          href="/admin/quotes"
                          className="text-gold opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-lg font-semibold text-white">Upcoming Bookings</h2>
              <Link
                href="/admin/bookings"
                className="flex items-center gap-1 text-sm text-gold hover:text-gold-light"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 rounded-lg border border-dark-border p-3 transition-all hover:border-gold/20 hover:bg-white/[0.02]"
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <span className="text-xs font-bold uppercase">
                      {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-tight">
                      {new Date(booking.booking_date + 'T00:00:00').getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{booking.client_name}</p>
                      <Badge variant={statusBadgeVariant[booking.status] || 'outline'} className="shrink-0">
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {booking.event_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.start_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {getVehicleName(booking.vehicle_id)}
                      </span>
                    </div>
                  </div>
                  {booking.total_amount && (
                    <p className="font-semibold text-gold shrink-0">
                      {formatCurrency(booking.total_amount)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
