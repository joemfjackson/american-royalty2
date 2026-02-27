'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { EVENT_TYPES, MOCK_VEHICLES } from '@/lib/constants'
import { BRAND } from '@/lib/constants'

const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  event_type: z.string().min(1, 'Please select an event type'),
  preferred_vehicle: z.string().optional(),
  event_date: z.string().min(1, 'Please select an event date'),
  pickup_time: z.string().optional(),
  guest_count: z.string().optional(),
  duration_hours: z.string().optional(),
  pickup_location: z.string().optional(),
  dropoff_location: z.string().optional(),
  details: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

const eventOptions = EVENT_TYPES.map((type) => ({
  value: type,
  label: type,
}))

const vehicleOptions = MOCK_VEHICLES.map((v) => ({
  value: v.slug,
  label: `${v.name} — ${v.type} (up to ${v.capacity} guests)`,
}))

function QuoteFormInner() {
  const searchParams = useSearchParams()
  const prefilledVehicle = searchParams.get('vehicle') || ''
  const prefilledEvent = searchParams.get('event') || ''

  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      event_type: prefilledEvent,
      preferred_vehicle: prefilledVehicle,
      event_date: '',
      pickup_time: '',
      pickup_location: '',
      dropoff_location: '',
      details: '',
    },
  })

  const onSubmit = async (data: QuoteFormData) => {
    setServerError('')
    try {
      const payload = {
        ...data,
        guest_count: data.guest_count ? Number(data.guest_count) : undefined,
        duration_hours: data.duration_hours ? Number(data.duration_hours) : undefined,
      }
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className="card-dark glow-gold mx-auto max-w-2xl p-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
          <CheckCircle className="h-10 w-10 text-gold" />
        </div>
        <h3 className="mt-6 text-2xl font-bold text-white">Quote Request Received!</h3>
        <p className="mt-4 text-lg text-white/60">
          Thank you for choosing American Royalty. Our team will review your request and contact you
          within <span className="font-semibold text-gold">2 hours</span>.
        </p>
        <p className="mt-3 text-sm text-white/40">
          Need immediate assistance? Call us at{' '}
          <a href={`tel:${BRAND.phone}`} className="text-gold hover:underline">
            {BRAND.phone}
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-dark mx-auto max-w-4xl p-5 sm:p-8 md:p-10">
      {/* Server error */}
      {serverError && (
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{serverError}</p>
        </div>
      )}

      {/* Contact Info */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Full Name *"
          placeholder="John Smith"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email Address *"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone Number *"
          type="tel"
          placeholder="(702) 555-1234"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Select
          label="Event Type *"
          placeholder="Select an event type"
          options={eventOptions}
          error={errors.event_type?.message}
          {...register('event_type')}
        />
      </div>

      {/* Event Details */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Select
          label="Preferred Vehicle"
          placeholder="Select a vehicle (optional)"
          options={vehicleOptions}
          error={errors.preferred_vehicle?.message}
          {...register('preferred_vehicle')}
        />
        <Input
          label="Event Date *"
          type="date"
          error={errors.event_date?.message}
          {...register('event_date')}
        />
        <Input
          label="Pickup Time"
          type="time"
          error={errors.pickup_time?.message}
          {...register('pickup_time')}
        />
        <Input
          label="Number of Guests"
          type="number"
          placeholder="e.g. 15"
          min={1}
          max={100}
          error={errors.guest_count?.message}
          {...register('guest_count')}
        />
        <Input
          label="Duration (hours)"
          type="number"
          placeholder="e.g. 4"
          min={1}
          max={24}
          error={errors.duration_hours?.message}
          {...register('duration_hours')}
        />
        <Input
          label="Pickup Location"
          placeholder="Hotel, address, or venue"
          error={errors.pickup_location?.message}
          {...register('pickup_location')}
        />
      </div>

      {/* Drop-off + Details */}
      <div className="mt-8 space-y-6">
        <Input
          label="Drop-off Location"
          placeholder="Hotel, address, or venue"
          error={errors.dropoff_location?.message}
          {...register('dropoff_location')}
        />
        <Textarea
          label="Additional Details"
          placeholder="Tell us about your event — special requests, itinerary ideas, stops you'd like to make, etc."
          rows={5}
          error={errors.details?.message}
          {...register('details')}
        />
      </div>

      {/* Submit */}
      <div className="mt-10">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Request Your Quote'
          )}
        </Button>
        <p className="mt-4 text-sm text-white/40">
          No commitment required. We&apos;ll respond within 2 hours with a personalized quote.
        </p>
      </div>
    </form>
  )
}

export function QuoteForm() {
  return (
    <Suspense
      fallback={
        <div className="card-dark mx-auto max-w-4xl p-8 sm:p-10">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        </div>
      }
    >
      <QuoteFormInner />
    </Suspense>
  )
}

export default QuoteForm
