import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const link = await prisma.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'لینک یافت نشد' },
        { status: 404 }
      )
    }

    // Get all clicks for this link
    const clicks = await prisma.click.findMany({
      where: { linkId: id },
      orderBy: { createdAt: 'desc' },
    })

    // Group by device type
    const deviceStats = clicks.reduce((acc, click) => {
      acc[click.deviceType] = (acc[click.deviceType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by referer
    const refererStats = clicks.reduce((acc, click) => {
      const referer = click.referer 
        ? new URL(click.referer).hostname 
        : 'مستقیم'
      acc[referer] = (acc[referer] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by date (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const clicksByDate = clicks
      .filter(click => click.createdAt >= sevenDaysAgo)
      .reduce((acc, click) => {
        const date = new Date(click.createdAt).toLocaleDateString('fa-IR')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Group by date for chart (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const chartData = clicks
      .filter(click => click.createdAt >= thirtyDaysAgo)
      .map(click => ({
        date: new Date(click.createdAt).toLocaleDateString('fa-IR', {
          month: 'short',
          day: 'numeric',
        }),
        count: 1,
      }))
      .reduce((acc, item) => {
        acc[item.date] = (acc[item.date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const chartDataArray = Object.entries(chartData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      totalClicks: clicks.length,
      deviceStats,
      refererStats,
      clicksByDate,
      chartData: chartDataArray,
      recentClicks: clicks.slice(0, 10),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت آمار رخ داد' },
      { status: 500 }
    )
  }
}

