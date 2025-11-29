import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Toaster } from 'sonner'
import Providers from '@/components/providers/Providers'

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

export const metadata: Metadata = {
  title: 'یوتیم کیت - پلتفرم ساخت لینک هوشمند و ردیابی UTM',
  description: 'یوتیم کیت: ساخت لینک‌های کوتاه و ردیابی UTM برای کمپین‌های بازاریابی',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
      <html lang="fa" dir="rtl" className={iranSans.variable} suppressHydrationWarning>
        <body className={`${iranSans.className} antialiased bg-background text-foreground`}>
          <Providers>
            {children}
          </Providers>
          <Toaster position="top-center" richColors />
        </body>
      </html>
    )
}

