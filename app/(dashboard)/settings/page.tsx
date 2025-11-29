import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CategoryManager from '@/components/categories/CategoryManager'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">تنظیمات</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">مدیریت حساب کاربری و تنظیمات</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات حساب کاربری</CardTitle>
          <CardDescription>
            اطلاعات حساب کاربری شما
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نام:</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {session.user.name || 'تعیین نشده'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ایمیل:</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{session.user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تغییر رمز عبور</CardTitle>
          <CardDescription>
            این قابلیت به زودی اضافه خواهد شد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            امکان تغییر رمز عبور در نسخه‌های بعدی اضافه خواهد شد.
          </p>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">پلن و اشتراک</CardTitle>
          <CardDescription>
            مدیریت پلن و اشتراک خود
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/plan">
            <Button variant="outline" className="w-full">
              <CreditCard className="ml-2 h-4 w-4" />
              مشاهده و مدیریت پلن
            </Button>
          </Link>
        </CardContent>
      </Card>

      <CategoryManager />
    </div>
  )
}

