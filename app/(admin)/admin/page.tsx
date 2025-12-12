import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Link2, MousePointerClick, TrendingUp, UserCheck, Crown, MessageSquare, DollarSign, Calendar, Clock, Zap, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import AdminStatsChart from '@/components/admin/AdminStatsChart'
import TopUsersTable from '@/components/admin/TopUsersTable'
import RecentUsersList from '@/components/admin/RecentUsersList'
import TopLinksTable from '@/components/admin/TopLinksTable'
import RevenueStats from '@/components/admin/RevenueStats'
import DeviceStats from '@/components/admin/DeviceStats'
import QuickActions from '@/components/admin/QuickActions'

async function getAdminStats() {
  const now = new Date()
  const todayStart = new Date(now.setHours(0, 0, 0, 0))
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalLinks,
    totalClicks,
    activeUsers,
    usersByPlan,
    recentUsers,
    openTickets,
    // Today stats
    todayUsers,
    todayLinks,
    todayClicks,
    // Week stats
    weekUsers,
    weekLinks,
    weekClicks,
    // Month stats
    monthUsers,
    monthLinks,
    monthClicks,
    // Revenue stats
    totalRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    successfulPayments,
    // Top links
    topLinks,
    // Device stats
    deviceStats,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // Total links
    prisma.link.count(),

    // Total clicks
    prisma.click.count(),

    // Active users (users with at least one link)
    prisma.user.count({
      where: {
        links: {
          some: {},
        },
      },
    }),

    // Users by plan
    prisma.user.groupBy({
      by: ['plan'],
      _count: {
        id: true,
      },
    }),

    // Recent users (last 7 days)
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),

    // Open tickets count
    prisma.ticket.count({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
    }),

    // Today stats
    prisma.user.count({
      where: {
        createdAt: { gte: todayStart },
      },
    }),
    prisma.link.count({
      where: {
        createdAt: { gte: todayStart },
      },
    }),
    prisma.click.count({
      where: {
        createdAt: { gte: todayStart },
      },
    }),

    // Week stats
    prisma.user.count({
      where: {
        createdAt: { gte: weekStart },
      },
    }),
    prisma.link.count({
      where: {
        createdAt: { gte: weekStart },
      },
    }),
    prisma.click.count({
      where: {
        createdAt: { gte: weekStart },
      },
    }),

    // Month stats
    prisma.user.count({
      where: {
        createdAt: { gte: monthStart },
      },
    }),
    prisma.link.count({
      where: {
        createdAt: { gte: monthStart },
      },
    }),
    prisma.click.count({
      where: {
        createdAt: { gte: monthStart },
      },
    }),

    // Revenue stats
    prisma.payment.aggregate({
      where: {
        status: { in: ['SUCCESS', 'VERIFIED'] },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ['SUCCESS', 'VERIFIED'] },
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ['SUCCESS', 'VERIFIED'] },
        createdAt: { gte: weekStart },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ['SUCCESS', 'VERIFIED'] },
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: {
        status: { in: ['SUCCESS', 'VERIFIED'] },
      },
    }),

    // Top links by clicks
    prisma.link.findMany({
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        title: true,
        createdAt: true,
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
    }),

    // Device stats
    prisma.click.groupBy({
      by: ['deviceType'],
      _count: {
        id: true,
      },
    }),
  ])

  // Get clicks by day (last 30 days)
  const clicksByDayRaw = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT 
      date(createdAt) as date,
      COUNT(*) as count
    FROM Click
    WHERE createdAt >= date('now', '-30 days')
    GROUP BY date(createdAt)
    ORDER BY date(createdAt) ASC
  `

  // Get top users by clicks
  const topUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      _count: {
        select: {
          links: true,
        },
      },
    },
    orderBy: {
      links: {
        _count: 'desc',
      },
    },
    take: 10,
  })

  const topUsersWithClicks = await Promise.all(
    topUsers.map(async (user) => {
      const clicks = await prisma.click.count({
        where: {
          link: {
            userId: user.id,
          },
        },
      })
      return {
        ...user,
        totalClicks: clicks,
      }
    })
  )

  return {
    overview: {
      totalUsers,
      totalLinks,
      totalClicks,
      activeUsers,
    },
    timeStats: {
      today: { users: todayUsers, links: todayLinks, clicks: todayClicks },
      week: { users: weekUsers, links: weekLinks, clicks: weekClicks },
      month: { users: monthUsers, links: monthLinks, clicks: monthClicks },
    },
    revenue: {
      total: totalRevenue._sum.amount || 0,
      today: todayRevenue._sum.amount || 0,
      week: weekRevenue._sum.amount || 0,
      month: monthRevenue._sum.amount || 0,
      successfulPayments,
    },
    usersByPlan: usersByPlan.map((item) => ({
      plan: item.plan,
      count: item._count.id,
    })),
    recentUsers: recentUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })),
    topUsers: topUsersWithClicks.sort((a, b) => b.totalClicks - a.totalClicks),
    topLinks: topLinks.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      clicks: link._count.clicks,
    })),
    deviceStats: deviceStats.map((item) => ({
      deviceType: item.deviceType,
      count: item._count.id,
    })),
    clicksByDay: clicksByDayRaw.map((item: any) => ({
      date: item.date,
      count: Number(item.count || 0),
    })),
    openTickets,
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  const stats = await getAdminStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">پنل مدیریت</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            مدیریت و نظارت بر کاربران و سیستم
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل کاربران</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.overview.totalUsers.toLocaleString('fa-IR')}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.overview.activeUsers} کاربر فعال
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل لینک‌ها</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.overview.totalLinks.toLocaleString('fa-IR')}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              لینک ایجاد شده
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل کلیک‌ها</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.overview.totalClicks.toLocaleString('fa-IR')}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              کلیک ردیابی شده
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کاربران فعال</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.overview.activeUsers.toLocaleString('fa-IR')}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              کاربر با لینک
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-lift border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آمار امروز</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">کاربران:</span>
                <span className="text-sm font-semibold">{stats.timeStats.today.users.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">لینک‌ها:</span>
                <span className="text-sm font-semibold">{stats.timeStats.today.links.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">کلیک‌ها:</span>
                <span className="text-sm font-semibold">{stats.timeStats.today.clicks.toLocaleString('fa-IR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آمار هفته</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">کاربران:</span>
                <span className="text-sm font-semibold">{stats.timeStats.week.users.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">لینک‌ها:</span>
                <span className="text-sm font-semibold">{stats.timeStats.week.links.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">کلیک‌ها:</span>
                <span className="text-sm font-semibold">{stats.timeStats.week.clicks.toLocaleString('fa-IR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آمار ماه</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">کاربران:</span>
                <span className="text-sm font-semibold">{stats.timeStats.month.users.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">لینک‌ها:</span>
                <span className="text-sm font-semibold">{stats.timeStats.month.links.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">کلیک‌ها:</span>
                <span className="text-sm font-semibold">{stats.timeStats.month.clicks.toLocaleString('fa-IR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <RevenueStats revenue={stats.revenue} />

      {/* Users by Plan */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.usersByPlan.map((item: any) => (
          <Card key={item.plan} className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.plan === 'FREE' ? 'رایگان' : item.plan === 'BASIC' ? 'پایه' : 'حرفه‌ای'}
              </CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {item.count.toLocaleString('fa-IR')}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                کاربر
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>کلیک‌ها در 30 روز گذشته</CardTitle>
            <CardDescription>روند کلیک‌ها در یک ماه اخیر</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminStatsChart data={stats.clicksByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آمار دستگاه‌ها</CardTitle>
            <CardDescription>توزیع کلیک‌ها بر اساس نوع دستگاه</CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceStats data={stats.deviceStats} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>کاربران برتر</CardTitle>
            <CardDescription>کاربران با بیشترین لینک و کلیک</CardDescription>
          </CardHeader>
          <CardContent>
            <TopUsersTable users={stats.topUsers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لینک‌های محبوب</CardTitle>
            <CardDescription>لینک‌های با بیشترین کلیک</CardDescription>
          </CardHeader>
          <CardContent>
            <TopLinksTable links={stats.topLinks} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>کاربران جدید</CardTitle>
          <CardDescription>کاربرانی که در 7 روز گذشته ثبت‌نام کرده‌اند</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentUsersList users={stats.recentUsers} />
        </CardContent>
      </Card>

      {/* Tickets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>تیکت‌های پشتیبانی</CardTitle>
              <CardDescription>مدیریت و پاسخ به تیکت‌های کاربران</CardDescription>
            </div>
            <Link href="/admin/tickets">
              <Button variant="outline" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white border-0">
                <MessageSquare className="h-4 w-4 ml-2" />
                مدیریت تیکت‌ها
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">تیکت‌های باز:</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.openTickets.toLocaleString('fa-IR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


