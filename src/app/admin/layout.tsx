'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SessionProvider, useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Car,
  Star,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Quotes', href: '/admin/quotes', icon: FileText },
  { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList },
  { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays },
  { label: 'Fleet', href: '/admin/fleet', icon: Car },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
]

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { status } = useSession()

  // For the login page, render without sidebar or auth check
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-black">{children}</div>
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  // Not authenticated — redirect to login
  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-dark-border bg-dark-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-dark-border px-5">
          <Image
            src="/images/logo.png"
            alt="American Royalty"
            width={120}
            height={48}
            className="h-9 w-auto"
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-gold/60">Admin</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-gold/10 text-gold'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-gold' : ''}`} />
                    {item.label}
                    {active && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-dark-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-dark-border bg-dark-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">
              {NAV_ITEMS.find((item) => isActive(item.href))?.label || 'Admin Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-400 transition-colors hover:text-gold"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400 sm:flex"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  )
}
