'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Unlink,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  getStripeConnectionStatus,
  disconnectStripeAccount,
  type StripeConnectionInfo,
} from '@/lib/actions/settings'

function SettingsContent() {
  const searchParams = useSearchParams()
  const [connectionInfo, setConnectionInfo] = useState<StripeConnectionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [disconnectConfirm, setDisconnectConfirm] = useState(false)

  useEffect(() => {
    const stripeError = searchParams.get('stripe_error')
    const stripeSuccess = searchParams.get('stripe_success')
    if (stripeError) setError(stripeError)
    if (stripeSuccess) setSuccess('Stripe account connected successfully!')

    async function load() {
      try {
        const info = await getStripeConnectionStatus()
        setConnectionInfo(info)
      } catch (err) {
        console.error('Failed to load settings:', err)
        setError('Failed to load settings.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [searchParams])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      const result = await disconnectStripeAccount()
      if (result.success) {
        setConnectionInfo({
          connected: false,
          accountId: null,
          accountName: null,
          accountEmail: null,
          livemode: null,
        })
        setSuccess('Stripe account disconnected.')
        setDisconnectConfirm(false)
      } else {
        setError(result.error || 'Failed to disconnect.')
      }
    } catch (err) {
      console.error('Disconnect failed:', err)
      setError('Failed to disconnect Stripe account.')
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
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

      {/* Flash messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm text-emerald-400">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-emerald-400 hover:text-emerald-300"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Stripe Connect Section */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-royal/10 p-3">
            <CreditCard className="h-6 w-6 text-royal-light" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Stripe Connect</h2>
              <Badge variant={connectionInfo?.connected ? 'green' : 'yellow'}>
                {connectionInfo?.connected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Connect your Stripe account to accept payments directly. Deposits
              and invoice payments will be processed through your connected account.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-dark-border pt-6">
          {connectionInfo?.connected ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-dark-border bg-black/50 p-4">
                <div className="grid gap-3 text-sm">
                  {connectionInfo.accountName && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Business Name</span>
                      <span className="font-medium text-white">
                        {connectionInfo.accountName}
                      </span>
                    </div>
                  )}
                  {connectionInfo.accountEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium text-white">
                        {connectionInfo.accountEmail}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Account ID</span>
                    <span className="font-mono text-xs text-gray-300">
                      {connectionInfo.accountId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Mode</span>
                    <Badge variant={connectionInfo.livemode ? 'green' : 'yellow'}>
                      {connectionInfo.livemode ? 'Live' : 'Test'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Stripe Dashboard
                </a>

                {disconnectConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {disconnecting ? 'Disconnecting...' : 'Confirm Disconnect'}
                    </button>
                    <button
                      onClick={() => setDisconnectConfirm(false)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDisconnectConfirm(true)}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-dark-border bg-black/50 p-4">
                <p className="text-sm text-gray-400">
                  No Stripe account is currently connected. Click the button
                  below to authorize your Stripe account and start accepting
                  payments.
                </p>
              </div>

              <a
                href="/api/stripe/connect"
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
              >
                <CreditCard className="h-4 w-4" />
                Connect with Stripe
              </a>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
