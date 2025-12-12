import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'داشبورد - یوتیم کیت',
  description: 'داشبورد کاربری یوتیم کیت',
  noindex: true,
  nofollow: true,
})

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

