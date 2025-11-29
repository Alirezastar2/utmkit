import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  try {
    await requireAdmin()

    const [
      totalUsers,
      totalLinks,
      totalClicks,
      activeUsers,
      usersByPlan,
      recentUsers,
      clicksByDay,
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

      // Clicks by day (last 30 days)
      prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT 
          date(createdAt) as date,
          COUNT(*) as count
        FROM Click
        WHERE createdAt >= date('now', '-30 days')
        GROUP BY date(createdAt)
        ORDER BY date(createdAt) ASC
      `,
    ])

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

    return NextResponse.json({
      overview: {
        totalUsers,
        totalLinks,
        totalClicks,
        activeUsers,
      },
      usersByPlan: usersByPlan.map((item) => ({
        plan: item.plan,
        count: item._count.id,
      })),
      recentUsers,
      topUsers: topUsersWithClicks.sort((a, b) => b.totalClicks - a.totalClicks),
      clicksByDay: clicksByDay.map((item: any) => ({
        date: item.date,
        count: Number(item.count || 0),
      })),
    })
  } catch (error: any) {
    if (error.message.includes('دسترسی غیرمجاز')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت آمار رخ داد' },
      { status: 500 }
    )
  }
}

