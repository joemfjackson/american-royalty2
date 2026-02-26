import type { Metadata } from 'next'
import { BRAND } from '@/lib/constants'

interface GenerateMetadataOptions {
  /** Page title (will be appended with " | American Royalty Las Vegas" via template) */
  title: string
  /** Meta description — aim for 150-160 characters */
  description: string
  /** Canonical path, e.g. "/fleet/the-sovereign" (no trailing slash) */
  path?: string
  /** OpenGraph image URL — falls back to default site OG image */
  image?: string
  /** Additional keywords to merge with defaults */
  keywords?: string[]
  /** OpenGraph type — defaults to "website" */
  ogType?: 'website' | 'article'
  /** Set noIndex to true for pages that should not be indexed */
  noIndex?: boolean
}

/**
 * Helper function that generates a consistent Metadata object for any page.
 *
 * Usage in a page file:
 *   import { generatePageMetadata } from '@/components/seo/PageMeta'
 *
 *   export const metadata = generatePageMetadata({
 *     title: 'Our Fleet',
 *     description: 'Browse our luxury party buses and limousines...',
 *     path: '/fleet',
 *   })
 *
 * Or inside generateMetadata():
 *   export async function generateMetadata({ params }) {
 *     return generatePageMetadata({ title: vehicle.name, ... })
 *   }
 */
export function generatePageMetadata({
  title,
  description,
  path,
  image,
  keywords = [],
  ogType = 'website',
  noIndex = false,
}: GenerateMetadataOptions): Metadata {
  const url = path ? `${BRAND.siteUrl}${path}` : undefined

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: ogType,
      siteName: BRAND.name,
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
