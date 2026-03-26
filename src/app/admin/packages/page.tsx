'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Calendar, Users, DollarSign, Trash2, MapPin, Clock, ImageIcon } from 'lucide-react'
import { getPackageBookings, deletePackageBooking } from '@/lib/actions/admin'
import type { PackageBooking } from '@/types'

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AdminPackagesPage() {
  const [bookings, setBookings] = useState<PackageBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    getPackageBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deletePackageBooking(id)
      setBookings((prev) => prev.filter((b) => b.id !== id))
      setDeleteId(null)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Package Bookings</h1>
          <p className="mt-1 text-sm text-gray-400">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/packages/photos"
          className="inline-flex items-center gap-2 rounded-lg border border-dark-border bg-dark-card px-4 py-2 text-sm font-medium text-gold transition-all hover:border-gold/30"
        >
          <ImageIcon className="h-4 w-4" />
          Manage Photos
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dark-border bg-dark-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-400">No package bookings yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Bookings from /packages will appear here when customers pay.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-dark-border bg-dark-card p-4 transition-all hover:border-dark-border/80"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{b.package_name}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.payment_status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      {b.payment_status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {b.tier_label}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {b.event_date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {b.event_time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {b.pickup_location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatCurrency(b.price)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {b.client_name} · {b.client_email} · {b.client_phone}
                  </div>
                  {b.special_requests && (
                    <p className="text-xs text-gray-500 italic">
                      &ldquo;{b.special_requests}&rdquo;
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setDeleteId(b.id)}
                  className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Delete confirmation */}
              {deleteId === b.id && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                  <p className="flex-1 text-xs text-red-400">Delete this booking permanently?</p>
                  <button
                    onClick={() => setDeleteId(null)}
                    className="rounded px-3 py-1 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
