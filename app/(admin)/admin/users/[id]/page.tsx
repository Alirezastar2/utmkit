import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Edit, Trash2 } from 'lucide-react'
import UserEditDialog from '@/components/admin/UserEditDialog'
import UserLinksTable from '@/components/admin/UserLinksTable'

async function getUserData(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      planExpiresAt: true,
      theme: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          links: true,
          categories: true,
          linkTemplates: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  // Get user's links with stats
  const links = await prisma.link.findMany({
    where: { userId: id },
    include: {
      _count: {
        select: { clicks: true },
      },
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })

  // Get total clicks
  const totalClicks = await prisma.click.count({
    where: {
      link: {
        userId: id,
      },
    },
  })

  // Get clicks in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentClicks = await prisma.click.count({
    where: {
      link: {
        userId: id,
      },
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  })

  return {
    user,
    links,
    stats: {
      totalClicks,
      recentClicks,
    },
  }
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { id } = await params
  const data = await getUserData(id)

  if (!data) {
    notFound()
  }

  const { user, links, stats } = data

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return <Badge className="bg-purple-500 text-white">ادمین</Badge>
    }
    return <Badge variant="outline">کاربر</Badge>
  }

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: 'bg-gray-500',
      BASIC: 'bg-blue-500',
      PRO: 'bg-teal-500',
    }
    const labels: Record<string, string> = {
      FREE: 'رایگان',
      BASIC: 'پایه',
      PRO: 'حرفه‌ای',
    }
    return (
      <Badge className={`${colors[plan] || 'bg-gray-500'} text-white`}>
        {labels[plan] || plan}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            جزئیات کاربر
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            مشاهده و مدیریت اطلاعات کاربر
          </p>
        </div>
        <div className="flex gap-3">
          <UserEditDialog user={user} />
          <Link href="/admin/users">
            <Button variant="outline">
              <ArrowRight className="ml-2 h-4 w-4" />
              بازگشت به لیست
            </Button>
          </Link>
        </div>
      </div>

      {/* User Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات کاربر</CardTitle>
            <CardDescription>اطلاعات اصلی حساب کاربری</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                نام:
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.name || 'تعیین نشده'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ایمیل:
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                نقش:
              </label>
              <div className="mt-1">{getRoleBadge(user.role)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                پلن:
              </label>
              <div className="mt-1">{getPlanBadge(user.plan)}</div>
            </div>
            {user.planExpiresAt && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  تاریخ انقضای پلن:
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(user.planExpiresAt).toLocaleDateString('fa-IR')}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                تاریخ ثبت‌نام:
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {new Date(user.createdAt).toLocaleDateString('fa-IR')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آمار کاربر</CardTitle>
            <CardDescription>آمار کلی فعالیت کاربر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                تعداد لینک‌ها:
              </label>
              <p className="mt-1 text-lg font-bold text-primary">
                {user._count.links.toLocaleString('fa-IR')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                تعداد دسته‌بندی‌ها:
              </label>
              <p className="mt-1 text-lg font-bold text-primary">
                {user._count.categories.toLocaleString('fa-IR')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                کل کلیک‌ها:
              </label>
              <p className="mt-1 text-lg font-bold text-primary">
                {stats.totalClicks.toLocaleString('fa-IR')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                کلیک‌های 30 روز گذشته:
              </label>
              <p className="mt-1 text-lg font-bold text-primary">
                {stats.recentClicks.toLocaleString('fa-IR')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Links */}
      <Card>
        <CardHeader>
          <CardTitle>لینک‌های کاربر</CardTitle>
          <CardDescription>لیست لینک‌های ایجاد شده توسط این کاربر</CardDescription>
        </CardHeader>
        <CardContent>
          <UserLinksTable links={links} />
        </CardContent>
      </Card>
    </div>
  )
}


