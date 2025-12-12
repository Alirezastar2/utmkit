import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/payment/',
          '/link-expired',
          '/settings/',
          '/tickets/',
          '/chat/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/pricing',
          '/help',
          '/api-docs',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/payment/',
          '/l/', // لینک‌های کوتاه - برای privacy
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/pricing',
          '/help',
          '/api-docs',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/payment/',
          '/l/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

