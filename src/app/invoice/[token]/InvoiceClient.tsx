'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface InvoiceClientProps {
  invoiceId: string
  token: string
  depositAmount: number
}

export function InvoiceClient({ invoiceId, token, depositAmount }: InvoiceClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create checkout session')
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-2 space-y-3">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full rounded-lg bg-gold px-6 py-4 text-base font-bold text-black transition-all hover:bg-gold-light disabled:opacity-50 animate-pulse-glow"
      >
        {loading ? 'Redirecting to payment...' : `PAY DEPOSIT  ${formatCurrency(depositAmount)}`}
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
