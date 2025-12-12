import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'تعرفه و قیمت‌گذاری - یوتیم کیت',
  description: 'پلن‌های مختلف یوتیم کیت: رایگان، پایه و حرفه‌ای. انتخاب پلن مناسب برای کسب‌وکار شما. ویژگی‌های کامل در پلن‌های پرداختی.',
  keywords: ['قیمت لینک کوتاه', 'تعرفه UTM tracking', 'پلن لینک کوتاه', 'هزینه لینک کوتاه', 'pricing', 'اشتراک'],
  url: '/pricing',
  type: 'website',
})

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

