import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminLinksPage({
  searchParams,
}: {
  searchParams: any
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        title: true,
        createdAt: true,
        isActive: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            clicks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.link.count(),
  ])

  const topLinks = await prisma.link.findMany({
    select: {
      id: true,
      shortCode: true,
      originalUrl: true,
      title: true,
      _count: {
        select: {
          clicks: true,
        },
      },
    },
    orderBy: {
      clicks: {
        _count: 'desc',
      },
    },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مدیریت لینک‌ها</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          مشاهده و مدیریت تمام لینک‌های سیستم
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل لینک‌ها</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {total.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">لینک‌های فعال</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {links.filter((l) => l.isActive).length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Links */}
      <Card>
        <CardHeader>
          <CardTitle>لینک‌های محبوب</CardTitle>
          <CardDescription>لینک‌های با بیشترین کلیک</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topLinks.map((link, index) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {link.title || link.originalUrl}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {link.shortCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {link._count.clicks.toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Links */}
      <Card>
        <CardHeader>
          <CardTitle>تمام لینک‌ها</CardTitle>
          <CardDescription>لیست تمام لینک‌های سیستم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {links.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                لینکی وجود ندارد
              </div>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {link.title || link.originalUrl}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {link.shortCode}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {link.user.name || link.user.email}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {link._count.clicks.toLocaleString('fa-IR')} کلیک
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {link.isActive ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        فعال
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        غیرفعال
                      </span>
                    )}
                    <Link href={`/links/${link.id}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

