import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileCTA } from '@/components/layout/MobileCTA'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-black focus:font-semibold"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="min-h-screen pb-14 sm:pb-0">{children}</main>
      <Footer />
      <MobileCTA />
    </>
  )
}
