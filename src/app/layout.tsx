import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileCTA } from '@/components/layout/MobileCTA'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylv.com'),
  title: {
    default: 'American Royalty | Las Vegas Party Bus & Limousine Service',
    template: '%s | American Royalty Las Vegas',
  },
  description:
    'Premium party bus and limousine rental in Las Vegas. Bachelor & bachelorette parties, weddings, nightlife, corporate events. 8-40 passengers. Book your VIP ride today.',
  keywords: [
    'party bus Las Vegas',
    'Las Vegas party bus',
    'party bus rental Las Vegas',
    'limo service Las Vegas',
    'limousine Las Vegas',
    'limo rental Las Vegas',
    'bachelor party bus Las Vegas',
    'bachelorette party bus Las Vegas',
    'wedding limo Las Vegas',
    'Las Vegas nightlife transportation',
  ],
  authors: [{ name: 'American Royalty' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'American Royalty',
    title: 'American Royalty | Las Vegas Party Bus & Limousine Service',
    description:
      'Premium party bus and limousine rental in Las Vegas. Bachelor & bachelorette parties, weddings, nightlife, corporate events. Book your VIP ride today.',
    images: [{ url: '/images/logo.png', width: 1200, height: 630, alt: 'American Royalty' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'American Royalty | Las Vegas Party Bus & Limousine Service',
    description:
      'Premium party bus and limousine rental in Las Vegas. Book your VIP ride today.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/images/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        {/* Preload hero image so browser fetches it immediately */}
        <link
          rel="preload"
          href="/images/hero/bus-exterior-casino-mobile.webp"
          as="image"
          type="image/webp"
          media="(max-width: 640px)"
        />
        <link
          rel="preload"
          href="/images/hero/bus-exterior-casino.webp"
          as="image"
          type="image/webp"
          media="(min-width: 641px)"
        />
      </head>
      <body className="font-body">
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
      </body>
    </html>
  )
}
