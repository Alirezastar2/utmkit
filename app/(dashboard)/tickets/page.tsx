import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, Filter } from 'lucide-react'
import Link from 'next/link'
import TicketsList from '@/components/tickets/TicketsList'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function TicketsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">تیکت‌های پشتیبانی</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            مدیریت و پیگیری تیکت‌های پشتیبانی خود
          </p>
        </div>
        <Link href="/tickets/new">
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
            <Plus className="h-4 w-4 ml-2" />
            تیکت جدید
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <TicketsList />
      </Suspense>
    </div>
  )
}





