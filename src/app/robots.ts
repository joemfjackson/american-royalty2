import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BRAND.siteUrl

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
