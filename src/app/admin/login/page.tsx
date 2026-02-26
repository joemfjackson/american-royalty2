'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ''
  )
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSupabaseConfigured()) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (authError) {
          setError(authError.message)
          setLoading(false)
          return
        }
      } else {
        // Mock auth
        if (email === 'admin@americanroyalty.com' && password === 'admin123') {
          localStorage.setItem('admin_logged_in', 'true')
        } else {
          setError('Invalid email or password')
          setLoading(false)
          return
        }
      }

      router.push('/admin')
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-royal/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-dark-border bg-dark-card p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <Crown className="h-8 w-8 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to manage American Royalty
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@americanroyalty.com"
                required
                className="w-full rounded-lg border border-dark-border bg-black px-4 py-3 text-white placeholder:text-gray-500 transition-colors focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-dark-border bg-black px-4 py-3 pr-12 text-white placeholder:text-gray-500 transition-colors focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gold px-6 py-3 font-semibold text-black transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Mock auth hint */}
          {!isSupabaseConfigured() && (
            <div className="mt-6 rounded-lg border border-gold/20 bg-gold/5 p-3">
              <p className="text-xs text-gold/80">
                <span className="font-semibold">Demo Mode:</span> Use{' '}
                <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-gold">
                  admin@americanroyalty.com
                </code>{' '}
                /{' '}
                <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-gold">
                  admin123
                </code>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
