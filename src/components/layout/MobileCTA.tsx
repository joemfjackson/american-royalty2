'use client'

import { Phone } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BRAND } from '@/lib/constants'

export function MobileCTA() {
  const pathname = usePathname()

  // Hide on admin pages and quote page (already has form)
  if (pathname.startsWith('/admin') || pathname === '/quote') return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-royal/40 bg-black/95 shadow-[0_-4px_20px_rgba(111,45,189,0.25)] backdrop-blur-lg sm:hidden">
      <div className="flex items-stretch">
        <a
          href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`}
          className="flex flex-1 items-center justify-center gap-2 py-3.5 font-semibold text-white transition-colors active:bg-white/5"
        >
          <Phone className="h-4 w-4 text-gold" />
          <span className="text-sm">Call Now</span>
        </a>
        <div className="w-px bg-dark-border" />
        <Link
          href="/quote"
          className="flex flex-1 items-center justify-center gap-2 bg-gold py-3.5 font-semibold text-black transition-colors active:bg-gold-light"
        >
          <span className="text-sm">Get a Quote</span>
        </Link>
      </div>
    </div>
  )
}
