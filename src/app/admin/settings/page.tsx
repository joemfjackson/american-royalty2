'use client'

import { motion } from 'framer-motion'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { isStripeConfigured } from '@/lib/actions/settings'
import { useState, useEffect } from 'react'

function SettingsContent() {
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    async function load() {
      const configured = await isStripeConfigured()
      setStripeConfigured(configured)
    }
    load()
  }, [])

  if (stripeConfigured === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your payment processing and integrations
        </p>
      </div>

      {/* Stripe Configuration */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-royal/10 p-3">
            <CreditCard className="h-6 w-6 text-royal-light" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Stripe Payments</h2>
              <Badge variant={stripeConfigured ? 'green' : 'yellow'}>
                {stripeConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Payments are processed directly through your Stripe account.
              Stripe&apos;s standard processing fee (2.9% + $0.30) applies.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-dark-border pt-6">
          <div className="rounded-lg border border-dark-border bg-black/50 p-4">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Payment Status</span>
                <span className="flex items-center gap-2 font-medium text-white">
                  {stripeConfigured ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Ready to accept payments
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-400" />
                      API key not configured
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Processing</span>
                <span className="font-medium text-white">Direct to your account</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open Stripe Dashboard
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function AdminSettingsPage() {
  return <SettingsContent />
}
