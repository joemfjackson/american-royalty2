'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Calendar, Star, Clock, Car } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatItem {
  icon: LucideIcon
  value: string
  numericValue: number
  suffix: string
  label: string
}

const stats: StatItem[] = [
  { icon: Calendar, value: '500+', numericValue: 500, suffix: '+', label: 'Events' },
  { icon: Star, value: '4.9\u2605', numericValue: 4.9, suffix: '\u2605', label: 'Rating' },
  { icon: Clock, value: '24/7', numericValue: 0, suffix: '', label: 'Available' },
  { icon: Car, value: '6+', numericValue: 6, suffix: '+', label: 'Vehicles' },
]

function AnimatedValue({ stat, inView }: { stat: StatItem; inView: boolean }) {
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    if (!inView) return

    // Special case for non-numeric values
    if (stat.numericValue === 0 && stat.value === '24/7') {
      setDisplayValue('24/7')
      return
    }

    const isDecimal = stat.numericValue % 1 !== 0
    const duration = 1500
    const steps = 40
    const stepDuration = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = stat.numericValue * eased

      if (isDecimal) {
        setDisplayValue(current.toFixed(1) + stat.suffix)
      } else {
        setDisplayValue(Math.round(current).toString() + stat.suffix)
      }

      if (currentStep >= steps) {
        clearInterval(timer)
        if (isDecimal) {
          setDisplayValue(stat.numericValue.toFixed(1) + stat.suffix)
        } else {
          setDisplayValue(stat.numericValue.toString() + stat.suffix)
        }
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [inView, stat])

  return <>{displayValue}</>
}

export function TrustSignals() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

  return (
    <section
      id="trust-signals"
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      {/* Purple-gold gradient top border */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #6F2DBD60, #D6C08A, #6F2DBD60, transparent)' }} />

      {/* Radial glow background */}
      <div className="absolute inset-0 bg-dark-card/50" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/[0.05] blur-[100px]" />
        <div className="absolute right-1/3 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.03] blur-[80px]" />
      </div>

      <div className="container-max relative z-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <stat.icon className="mb-3 h-6 w-6 text-gold/70" aria-hidden="true" />
              <span className="text-3xl font-bold text-gold sm:text-4xl">
                <AnimatedValue stat={stat} inView={isInView} />
              </span>
              <span className="mt-1.5 text-sm uppercase tracking-wider text-white/50">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Purple-gold gradient bottom border */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #6F2DBD60, #D6C08A, #6F2DBD60, transparent)' }} />
    </section>
  )
}

export default TrustSignals
