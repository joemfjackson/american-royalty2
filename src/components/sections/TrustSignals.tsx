import { Calendar, Star, Clock, Car } from 'lucide-react'

const stats = [
  { icon: Calendar, value: '500+', label: 'Events' },
  { icon: Star, value: '4.9\u2605', label: 'Rating' },
  { icon: Clock, value: '24/7', label: 'Available' },
  { icon: Car, value: '6+', label: 'Vehicles' },
]

export function TrustSignals() {
  return (
    <section className="relative border-y border-dark-border bg-dark-card/50">
      <div className="container-max px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <stat.icon className="mb-2 h-5 w-5 text-gold/60" aria-hidden="true" />
              <span className="text-2xl font-bold text-gold sm:text-3xl">
                {stat.value}
              </span>
              <span className="mt-1 text-sm uppercase tracking-wider text-white/50">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustSignals
