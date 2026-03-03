'use client'

import { useState } from 'react'

interface QuotePayClientProps {
  quoteToken: string
  depositAmount: number
}

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function QuotePayClient({ quoteToken, depositAmount }: QuotePayClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
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
        setError(data.error || 'Failed to create checkout session')
        return
      }

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
        {loading ? 'Redirecting to payment...' : `BOOK NOW — PAY DEPOSIT ${formatCurrency(depositAmount)}`}
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
