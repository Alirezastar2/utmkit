import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'مستندات API - یوتیم کیت',
  description: 'مستندات کامل REST API یوتیم کیت برای یکپارچه‌سازی با سیستم‌های خود. ساخت لینک، دریافت آمار، مدیریت لینک‌ها و Webhooks از طریق API. شامل مثال‌های کد و راهنمای کامل.',
  keywords: ['API', 'مستندات API', 'REST API', 'documentation', 'یکپارچه‌سازی', 'integration', 'API key', 'Webhooks'],
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

