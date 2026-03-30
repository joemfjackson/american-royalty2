'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CheckCircle } from 'lucide-react'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function PaymentForm({ depositAmount, isFullPayment }: { depositAmount: number; isFullPayment: boolean }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://www.americanroyaltylasvegas.com',
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message || 'Payment failed. Please try again.')
      setProcessing(false)
    } else if (result.paymentIntent?.status === 'succeeded') {
      setSuccess(true)
      setProcessing(false)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          send_to: 'AW-18039620267/nhKHCM7IhI8cEKuF-51D',
          value: depositAmount,
          currency: 'USD',
        })
      }
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-6 text-center mt-2">
        <CheckCircle className="mx-auto h-10 w-10 text-emerald-400" />
        <h3 className="mt-3 text-lg font-bold text-white">You&apos;re Booked!</h3>
        <p className="mt-2 text-sm text-gray-400">
          Your {isFullPayment ? 'payment' : 'deposit'} of {formatCurrency(depositAmount)} has been received.
        </p>
        <p className="mt-1 text-sm text-gray-400">
          We&apos;ll send a confirmation email with your booking details.
        </p>
        <a href="/" className="mt-5 inline-block rounded-lg border border-emerald-500/30 px-6 py-2 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/10">
          Return to Home
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="rounded-lg border border-dark-border bg-black p-4">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-lg bg-gold px-6 py-4 text-base font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing payment...' : `${isFullPayment ? 'PAY' : 'PAY DEPOSIT'} ${formatCurrency(depositAmount)}`}
      </button>
      <p className="text-center text-xs text-gray-600">
        Secure payment powered by Stripe
      </p>
    </form>
  )
}

interface QuotePayClientProps {
  quoteToken: string
  depositAmount: number
  isFullPayment: boolean
}

export function QuotePayClient({ quoteToken, depositAmount, isFullPayment }: QuotePayClientProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitiatePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/quote-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to set up payment')
        return
      }

      setClientSecret(data.clientSecret)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (clientSecret && stripePromise) {
    return (
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
        <PaymentForm depositAmount={depositAmount} isFullPayment={isFullPayment} />
      </Elements>
    )
  }

  return (
    <div className="pt-2 space-y-3">
      <button
        onClick={handleInitiatePayment}
        disabled={loading}
        className="w-full rounded-lg bg-gold px-6 py-4 text-base font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 animate-pulse-glow"
      >
        {loading ? 'Setting up payment...' : `BOOK NOW — ${isFullPayment ? 'PAY' : 'PAY DEPOSIT'} ${formatCurrency(depositAmount)}`}
      </button>

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}

      <p className="text-center text-xs text-gray-600">
        Secure payment powered by Stripe
      </p>
    </div>
  )
}
