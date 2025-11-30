import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'قیمت‌ها و پلن‌ها',
  description: 'انتخاب پلن مناسب برای نیازهای خود. پلن رایگان، پایه و حرفه‌ای با ویژگی‌های مختلف برای ساخت لینک کوتاه و ردیابی UTM.',
  keywords: ['قیمت', 'پلن', 'اشتراک', 'لینک کوتاه', 'UTM tracking', 'pricing'],
  url: '/pricing',
  type: 'product',
})

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

