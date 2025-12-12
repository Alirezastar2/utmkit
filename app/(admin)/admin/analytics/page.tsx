import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">آمار و گزارش‌ها</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          گزارش‌های تفصیلی و تحلیل داده‌ها
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            گزارش‌های تفصیلی
          </CardTitle>
          <CardDescription>
            این بخش به زودی در دسترس خواهد بود
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>گزارش‌های تفصیلی در حال توسعه است</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

