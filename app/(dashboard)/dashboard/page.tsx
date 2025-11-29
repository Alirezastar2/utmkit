import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatsCards from '@/components/analytics/StatsCards'
import ClicksChart from '@/components/analytics/ClicksChart'
import TopLinksList from '@/components/analytics/TopLinksList'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Get user stats
  const [totalLinks, totalClicks, topLinks] = await Promise.all([
    prisma.link.count({
      where: { userId: session.user.id },
    }),
    prisma.click.count({
      where: {
        link: {
          userId: session.user.id,
        },
      },
    }),
    prisma.link.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: {
        clicks: {
          _count: 'desc',
        },
      },
      take: 5,
    }),
  ])

  // Get clicks for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const clicksData = await prisma.click.findMany({
    where: {
      link: {
        userId: session.user.id,
      },
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">داشبورد</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          خلاصه آمار و عملکرد لینک‌های شما
        </p>
      </div>

      <StatsCards totalLinks={totalLinks} totalClicks={totalClicks} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ClicksChart clicksData={clicksData} />
        <TopLinksList links={topLinks} />
      </div>
    </div>
  )
}

