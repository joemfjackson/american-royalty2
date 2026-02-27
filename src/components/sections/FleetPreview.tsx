'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import type { Vehicle } from '@/types'

const vehicleImages: Record<string, string> = {
  'the-sovereign': '/images/fleet/white-bus-casino.webp',
  'the-crown-jewel': '/images/fleet/black-bus-mgm.webp',
  'royal-sprinter': '/images/fleet/interior-pink-blue.webp',
}

function VehicleCard({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-royal/20 bg-dark-card shadow-[0_10px_40px_rgba(111,45,189,0.35),0_4px_15px_rgba(111,45,189,0.2),0_2px_6px_rgba(0,0,0,0.5)] -translate-y-0.5 transition-all duration-300 sm:translate-y-0 sm:border-dark-border sm:shadow-none sm:hover:-translate-y-1.5 sm:hover:border-royal/40 sm:hover:shadow-[0_15px_50px_rgba(111,45,189,0.4),0_6px_20px_rgba(111,45,189,0.25),0_2px_8px_rgba(0,0,0,0.5)]">
        {/* Purple-gold gradient top accent — always visible on mobile */}
        <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-gradient-to-r from-royal via-gold/60 to-royal sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100" />
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
          {/* Price tag overlay */}
          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-3 py-1.5 text-sm font-bold text-gold backdrop-blur-sm border border-gold/20">
            From ${vehicle.hourly_rate}/hr
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-bold text-white">{vehicle.name}</h3>

          <div className="mt-2 flex items-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden="true" />
              Up to {vehicle.capacity}
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
              className="group/link inline-flex items-center gap-1 text-sm font-semibold text-gold transition-colors hover:text-gold-light"
            >
              View Details
              <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function FleetPreview({ vehicles }: { vehicles: Vehicle[] }) {
  const topVehicles = vehicles.slice(0, 3)

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Purple ambient glow */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-royal/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[400px] w-[400px] rounded-full bg-royal/[0.04] blur-[100px]" />
      <div className="container-max relative">
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
