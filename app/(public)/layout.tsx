import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'یوتیم کیت - پلتفرم ساخت لینک هوشمند و ردیابی UTM',
  description: 'پلتفرم حرفه‌ای ساخت لینک کوتاه و ردیابی UTM برای کمپین‌های بازاریابی. ساخت لینک‌های کوتاه، ردیابی کلیک‌ها، آمار دقیق و QR Code برای کسب‌وکارهای ایرانی.',
})

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

