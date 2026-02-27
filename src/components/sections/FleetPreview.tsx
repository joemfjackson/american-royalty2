'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { Card } from '@/components/ui/Card'
import { MOCK_VEHICLES } from '@/lib/constants'
import type { Vehicle } from '@/types'

const vehicleImages: Record<string, string> = {
  'the-sovereign': '/images/fleet/white-bus-casino.webp',
  'the-crown-jewel': '/images/fleet/black-bus-mgm.webp',
  'royal-sprinter': '/images/fleet/interior-pink-blue.webp',
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
        {/* Vehicle image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={vehicleImages[vehicle.slug] || '/images/fleet/white-bus-casino.webp'}
            alt={`${vehicle.name} - ${vehicle.type} exterior`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-gold backdrop-blur-sm">
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
