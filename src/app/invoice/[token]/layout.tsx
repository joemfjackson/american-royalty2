import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Invoice — American Royalty',
  robots: { index: false, follow: false },
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Brand header */}
      <header className="border-b border-dark-border py-6">
        <div className="mx-auto max-w-2xl px-4 flex justify-center">
          <Image
            src="/images/logo.png"
            alt="American Royalty"
            width={160}
            height={160}
            className="h-auto w-[160px]"
            priority
          />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border py-6">
        <div className="mx-auto max-w-2xl px-4 text-center text-sm text-gray-500">
          <p>Questions? Call <a href="tel:+17026664037" className="text-gold hover:text-gold-light">(702) 666-4037</a></p>
          <p className="mt-1">
            <a href="mailto:admin@americanroyaltylasvegas.com" className="text-gold hover:text-gold-light">
              admin@americanroyaltylasvegas.com
            </a>
          </p>
          <p className="mt-3 text-xs text-gray-600">American Royalty Las Vegas</p>
        </div>
      </footer>
    </div>
  )
}
