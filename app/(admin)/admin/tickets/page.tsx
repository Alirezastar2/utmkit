import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminTicketsList from '@/components/admin/AdminTicketsList'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminTicketsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مدیریت تیکت‌ها</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          مدیریت و پاسخ به تیکت‌های کاربران
        </p>
      </div>

      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <AdminTicketsList />
      </Suspense>
    </div>
  )
}




