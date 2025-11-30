import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Toaster } from 'sonner'
import Providers from '@/components/providers/Providers'
import { generateMetadata as genMeta, getOrganizationSchema, getWebsiteSchema, getSoftwareApplicationSchema, getServiceSchema } from '@/lib/seo'

const iranSans = localFont({
  src: [
    {
      path: '../fonts/IRANSansX-UltraLight.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/IRANSansX-Thin.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../fonts/IRANSansX-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/IRANSansX-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/IRANSansX-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/IRANSansX-DemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/IRANSansX-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/IRANSansX-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../fonts/IRANSansX-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-iransans',
  display: 'swap',
})

export const metadata: Metadata = genMeta({
  title: 'یوتیم کیت - پلتفرم ساخت لینک هوشمند و ردیابی UTM',
  description: 'پلتفرم حرفه‌ای ساخت لینک کوتاه و ردیابی UTM برای کمپین‌های بازاریابی. ساخت لینک‌های کوتاه، ردیابی کلیک‌ها، آمار دقیق و QR Code برای کسب‌وکارهای ایرانی.',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = getOrganizationSchema()
  const websiteSchema = getWebsiteSchema()
  const softwareSchema = getSoftwareApplicationSchema()
  const serviceSchema = getServiceSchema()

  return (
    <html lang="fa" dir="rtl" className={iranSans.variable} suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      </head>
      <body className={`${iranSans.className} antialiased bg-background text-foreground`}>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}

