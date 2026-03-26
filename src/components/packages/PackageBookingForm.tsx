'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { PackageConfig } from '@/lib/packages'
import { CheckCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface BookingFormProps {
  pkg: PackageConfig
  selectedTierIndex: number
  clientSecret: string
  formData: {
    name: string
    email: string
    phone: string
    date: string
    time: string
    pickup: string
    requests: string
  }
}

function CheckoutForm({ pkg, selectedTierIndex, clientSecret, formData }: BookingFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const tier = pkg.pricing[selectedTierIndex]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/packages/${pkg.slug}`,
        receipt_email: formData.email,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message || 'Payment failed')
      setProcessing(false)
    } else if (result.paymentIntent?.status === 'succeeded') {
      // Fire Google Ads conversion
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any
        if (typeof w.gtag === 'function') {
          w.gtag('event', 'conversion', {
            send_to: 'AW-18039620267/nhKHCM7IhI8cEKuF-5lD',
            value: tier.price,
            currency: 'USD',
          })
          w.gtag('event', 'conversion', {
            send_to: 'AW-18039620267/7KD1CMqj3Y8cEKuF-5lD',
            value: tier.price,
            currency: 'USD',
          })
        }
      } catch { /* gtag not loaded */ }

      setSuccess(true)
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
        <h3 className="mt-4 text-lg font-bold text-white">You&apos;re Booked!</h3>
        <p className="mt-2 text-sm text-gray-400">
          Confirmation sent to <span className="text-white">{formData.email}</span>
        </p>
        <div className="mt-4 rounded-lg border border-dark-border bg-dark-card p-3 text-left text-sm">
          <p className="text-gray-400">
            Package: <span className="text-white">{pkg.name}</span>
          </p>
          <p className="text-gray-400">
            Date: <span className="text-white">{formData.date}</span>
          </p>
          <p className="text-gray-400">
            Party Size: <span className="text-white">{tier.tier}</span>
          </p>
          <p className="text-gray-400">
            Paid: <span className="text-emerald-400 font-semibold">{formatCurrency(tier.price)}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-dark-border bg-black p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : `Pay ${formatCurrency(tier.price)} & Confirm`}
      </button>
      <p className="text-center text-xs text-gray-500">
        Secure payment powered by Stripe
      </p>
    </form>
  )
}

export function PackageBookingForm({ pkg }: { pkg: PackageConfig }) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    pickup: '',
    dropoff: '',
    requests: '',
  })

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const isFormValid =
    selectedTier !== null &&
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.date &&
    formData.time &&
    formData.pickup &&
    formData.dropoff

  const handleCreatePayment = async () => {
    if (!isFormValid || selectedTier === null) return
    setLoading(true)

    try {
      const tier = pkg.pricing[selectedTier]
      const res = await fetch('/api/packages/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageSlug: pkg.slug,
          tierIndex: selectedTier,
          ...formData,
        }),
      })
      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        console.error('Failed to create payment intent:', data.error)
      }
    } catch (err) {
      console.error('Payment setup failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-dark-border bg-dark-card overflow-hidden">
      <div className="bg-gradient-to-r from-gold/10 to-royal/10 border-b border-dark-border p-5">
        <h2 className="text-lg font-bold text-white">Book This Package</h2>
        <p className="mt-1 text-xs text-gray-400">Select party size and fill in details</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Tier selection */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Party Size
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {pkg.pricing.map((tier, i) => (
              <button
                key={tier.tier}
                type="button"
                onClick={() => {
                  setSelectedTier(i)
                  setClientSecret(null)
                }}
                className={`rounded-lg border p-3 text-left transition-all ${
                  selectedTier === i
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-dark-border text-gray-400 hover:border-gray-600'
                }`}
              >
                <p className="text-xs font-medium">{tier.tier}</p>
                <p className="text-sm font-bold">${tier.price}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedTier !== null && !clientSecret && (
          <>
            {/* Form fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-400">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Pickup Time</label>
                <select
                  value={formData.time}
                  onChange={(e) => updateField('time', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                >
                  <option value="">Select pickup time</option>
                  {Array.from({ length: 24 * 4 }, (_, i) => {
                    const h = Math.floor(i / 4)
                    const m = (i % 4) * 15
                    const period = h >= 12 ? 'PM' : 'AM'
                    const h12 = h % 12 || 12
                    const label = `${h12}:${m.toString().padStart(2, '0')} ${period}`
                    return (
                      <option key={i} value={label}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Pickup Location</label>
                <input
                  type="text"
                  placeholder="Hotel name or address"
                  value={formData.pickup}
                  onChange={(e) => updateField('pickup', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Drop-off Location</label>
                <input
                  type="text"
                  placeholder="Hotel name or address"
                  value={formData.dropoff}
                  onChange={(e) => updateField('dropoff', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Special Requests (optional)</label>
                <textarea
                  rows={2}
                  value={formData.requests}
                  onChange={(e) => updateField('requests', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleCreatePayment}
              disabled={!isFormValid || loading}
              className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up payment...' : `Continue to Payment — $${pkg.pricing[selectedTier].price}`}
            </button>
          </>
        )}

        {clientSecret && selectedTier !== null && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#D6C08A',
                  colorBackground: '#0A0A0A',
                  colorText: '#ffffff',
                  colorDanger: '#ef4444',
                  borderRadius: '8px',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                },
              },
            }}
          >
            <CheckoutForm
              pkg={pkg}
              selectedTierIndex={selectedTier}
              clientSecret={clientSecret}
              formData={formData}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
