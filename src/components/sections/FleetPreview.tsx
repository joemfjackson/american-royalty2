'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { Card } from '@/components/ui/Card'
import { MOCK_VEHICLES } from '@/lib/constants'
import type { Vehicle } from '@/types'

const vehicleEmoji: Record<Vehicle['type'], string> = {
  'Party Bus': '\uD83D\uDE8C',
  'Sprinter Limo': '\uD83D\uDE90',
  'Stretch Limo': '\uD83D\uDE95',
}

const topVehicles = MOCK_VEHICLES.slice(0, 3)

function VehicleCard({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <Card hover className="flex h-full flex-col overflow-hidden p-0">
        {/* Placeholder image area */}
        <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-dark-card via-royal/10 to-dark-card">
          <span className="text-6xl" role="img" aria-label={vehicle.type}>
            {vehicleEmoji[vehicle.type]}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
            {vehicle.type}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-bold text-white">{vehicle.name}</h3>

          <div className="mt-2 flex items-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden="true" />
              Up to {vehicle.capacity}
            </span>
            <span className="text-gold font-semibold">
              ${vehicle.hourly_rate}/hr
            </span>
          </div>

          {/* Features preview */}
          <div className="mt-4 flex flex-wrap gap-2">
            {vehicle.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-dark-border bg-dark px-3 py-1 text-xs text-white/60"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-5">
            <Link
              href={`/fleet/${vehicle.slug}`}
              className="text-sm font-semibold text-gold transition-colors hover:text-gold-light"
            >
              View Details &rarr;
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function FleetPreview() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center">
          <SectionTag>Our Fleet</SectionTag>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            The <span className="gold-gradient-text">Royal Fleet</span>
          </h2>
          <GoldLine className="mx-auto mt-4" width="80px" />
          <p className="mx-auto mt-4 max-w-2xl text-white/50">
            From intimate stretch limousines to our massive 40-passenger party
            bus, every vehicle in our fleet is built for the ultimate Las Vegas
            experience.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {topVehicles.map((vehicle, i) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/fleet" className="btn-outline">
            View All Vehicles
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FleetPreview
