import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/_next']
    },
    sitemap: `${SITE_CONFIG.siteUrl}/sitemap.xml`
  }
}
