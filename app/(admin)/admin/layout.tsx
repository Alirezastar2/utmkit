import AdminLayoutComponent from '@/components/admin/AdminLayout'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'پنل مدیریت - یوتیم کیت',
  description: 'پنل مدیریت یوتیم کیت',
  noindex: true,
  nofollow: true,
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>
}


