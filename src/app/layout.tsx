import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import Script from 'next/script'
import '@/styles/globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.americanroyaltylasvegas.com'),
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
  alternates: {
    canonical: 'https://www.americanroyaltylasvegas.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.americanroyaltylasvegas.com',
    siteName: 'American Royalty',
    title: 'American Royalty | Las Vegas Party Bus & Limousine Service',
    description:
      'Premium party bus and limousine rental in Las Vegas. Bachelor & bachelorette parties, weddings, nightlife, corporate events. Book your VIP ride today.',
    images: [{ url: '/images/hero/bus-exterior-casino.webp', width: 1200, height: 630, alt: 'American Royalty party bus in Las Vegas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'American Royalty | Las Vegas Party Bus & Limousine Service',
    description:
      'Premium party bus and limousine rental in Las Vegas. Bachelor & bachelorette parties, weddings, nightlife, corporate events. Book your VIP ride today.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/images/logo.png',
  },
  verification: {
    google: 'cQI0ja030Fru049rr5WHWRtE6-dvdW8WiAIo2C3w0Vg',
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
        {/* Google Ads (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18039620267"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18039620267');
          `}
        </Script>

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
        {children}
      </body>
    </html>
  )
}
