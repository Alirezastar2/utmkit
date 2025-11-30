import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'مستندات API',
  description: 'مستندات کامل API یوتیم کیت برای یکپارچه‌سازی با سیستم‌های خود. ساخت لینک، دریافت آمار و مدیریت لینک‌ها از طریق API.',
  keywords: ['API', 'مستندات', 'documentation', 'یکپارچه‌سازی', 'integration', 'REST API'],
  url: '/api-docs',
  type: 'article',
})

export default function APIDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

