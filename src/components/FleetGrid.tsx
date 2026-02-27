'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import type { Vehicle } from '@/types'

const FALLBACK_IMAGE = '/images/fleet/white-bus-casino.webp'

const FILTER_TABS = ['All', 'Party Bus', 'Sprinter Limo', 'Stretch Limo', 'SUV'] as const
type FilterTab = (typeof FILTER_TABS)[number]

function VehicleCard({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card hover className="group relative flex h-full flex-col overflow-hidden p-0">
        {/* Purple-gold gradient top accent — always visible on mobile */}
        <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-gradient-to-r from-royal via-gold/60 to-royal sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100" />
        {/* Vehicle image */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={vehicle.image_url || FALLBACK_IMAGE}
            alt={`${vehicle.name} - ${vehicle.type} in Las Vegas`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute right-3 top-3">
            <Badge variant="gold">{vehicle.type}</Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          {/* Vehicle Name */}
          <h3 className="font-display text-xl font-bold text-white">
            {vehicle.name}
          </h3>

          {/* Capacity + Rate */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-white/50">
              <Users className="h-4 w-4" aria-hidden="true" />
              Up to {vehicle.capacity} guests
            </span>
          </div>

          {/* Pricing */}
          <div className="mt-3">
            <span className="text-lg font-bold text-gold">
              {formatCurrency(vehicle.hourly_rate)}/hr
            </span>
            <span className="ml-2 text-sm text-white/40">
              {vehicle.min_hours} hr min
            </span>
          </div>

          {/* Features (first 4) */}
          <ul className="mt-4 space-y-1.5">
            {vehicle.features.slice(0, 4).map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-white/60"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="mt-auto flex items-center gap-4 pt-6">
            <Link
              href={`/fleet/${vehicle.slug}`}
              className="text-sm font-semibold text-gold transition-colors hover:text-gold-light"
            >
              View Details &rarr;
            </Link>
            <Link
              href={`/quote?vehicle=${vehicle.slug}`}
              className="text-sm font-semibold text-white/50 transition-colors hover:text-white"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function FleetGrid({ vehicles }: { vehicles: Vehicle[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')

  const filteredVehicles =
    activeFilter === 'All'
      ? vehicles
      : vehicles.filter((v) => v.type === activeFilter)

  return (
    <div>
      {/* Filter Tabs — horizontally scrollable on small screens */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {FILTER_TABS.map((tab) => {
          const isActive = tab === activeFilter
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={
                isActive
                  ? 'shrink-0 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all sm:px-5'
                  : 'shrink-0 rounded-lg border border-gold/30 px-4 py-2.5 text-sm font-semibold text-gold transition-all hover:border-gold hover:bg-gold/10 sm:px-5'
              }
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Vehicle Grid */}
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredVehicles.map((vehicle, i) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-lg text-white/40">
            No vehicles found in this category.
          </p>
        </div>
      )}
    </div>
  )
}

export default FleetGrid
