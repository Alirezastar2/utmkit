import { Metadata } from 'next'

// تنظیمات اصلی SEO
export const siteConfig = {
  name: 'یوتیم کیت',
  nameEn: 'UTMKit',
  description: 'پلتفرم حرفه‌ای ساخت لینک کوتاه و ردیابی UTM برای کمپین‌های بازاریابی. ساخت لینک‌های کوتاه، ردیابی کلیک‌ها، آمار دقیق و QR Code برای کسب‌وکارهای ایرانی.',
  descriptionEn: 'Professional URL shortener and UTM tracking platform for marketing campaigns. Create short links, track clicks, detailed analytics, and QR codes for Iranian businesses.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://utmkit.ir',
  ogImage: '/og-image.jpg',
  twitterHandle: '@utmkit',
  locale: 'fa_IR',
  keywords: [
    'لینک کوتاه',
    'کوتاه کننده لینک',
    'ردیابی UTM',
    'UTM tracking',
    'لینک کوتاه فارسی',
    'آمار بازاریابی',
    'کمپین بازاریابی',
    'لینک کوتاه اینستاگرام',
    'لینک کوتاه تلگرام',
    'لینک کوتاه واتساپ',
    'URL shortener',
    'link shortener',
    'marketing analytics',
    'campaign tracking',
    'UTM parameters',
    'بازاریابی دیجیتال',
    'تحلیل ترافیک',
    'QR Code',
    'لینک کوتاه اختصاصی',
    'داشبورد آمار'
  ],
}

// تابع برای ساخت metadata کامل
export function generateMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  nofollow = false,
}: {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  nofollow?: boolean
}): Metadata {
  const fullTitle = title 
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} - ${siteConfig.description}`
  
  const fullDescription = description || siteConfig.description
  const fullUrl = url || siteConfig.url
  const ogImage = image || `${siteConfig.url}${siteConfig.ogImage}`
  const allKeywords = keywords 
    ? [...siteConfig.keywords, ...keywords].join(', ')
    : siteConfig.keywords.join(', ')

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: type === 'article' ? 'article' : type === 'product' ? 'product' : 'website',
      locale: siteConfig.locale,
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    category: 'technology',
    classification: 'Business',
    other: {
      'application-name': siteConfig.name,
      'apple-mobile-web-app-title': siteConfig.name,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'mobile-web-app-capable': 'yes',
      'theme-color': '#14b8a6',
    },
  }
}

// Structured Data برای Organization
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    alternateName: siteConfig.nameEn,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      // لینک‌های شبکه‌های اجتماعی را اینجا اضافه کنید
      // 'https://twitter.com/utmkit',
      // 'https://instagram.com/utmkit',
      // 'https://linkedin.com/company/utmkit',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'پشتیبانی',
      email: 'support@utmkit.ir',
      availableLanguage: ['Persian', 'English'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Iran',
    },
  }
}

// Structured Data برای WebSite
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Structured Data برای SoftwareApplication
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IRR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  }
}

// Structured Data برای Service
export function getServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'URL Shortening and UTM Tracking',
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Iran',
    },
    description: siteConfig.description,
  }
}

// Structured Data برای FAQPage
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Structured Data برای BreadcrumbList
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

