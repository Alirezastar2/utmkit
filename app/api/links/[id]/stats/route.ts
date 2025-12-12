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

    // Get time filter from query params
    const { searchParams } = new URL(request.url)
    const timeFilter = searchParams.get('timeFilter') || '30d' // today, 7d, 30d, custom
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let start: Date
    let end: Date = new Date()
    
    switch (timeFilter) {
      case 'today':
        start = new Date()
        start.setHours(0, 0, 0, 0)
        break
      case '7d':
        start = new Date()
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start = new Date()
        start.setDate(start.getDate() - 30)
        break
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate)
          end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
        } else {
          start = new Date()
          start.setDate(start.getDate() - 30)
        }
        break
      default:
        start = new Date()
        start.setDate(start.getDate() - 30)
    }

    // Get all clicks for this link with time filter
    const clicks = await prisma.click.findMany({
      where: {
        linkId: id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
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

    // Geographic stats
    const countryStats = clicks.reduce((acc, click) => {
      const country = click.country || 'نامشخص'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const cityStats = clicks.reduce((acc, click) => {
      const city = click.city || 'نامشخص'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Peak hours (group by hour of day)
    const peakHours = clicks.reduce((acc, click) => {
      const hour = new Date(click.createdAt).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Convert peak hours to array and sort
    const peakHoursArray = Object.entries(peakHours)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        label: `${hour}:00`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 hours

    // Top countries
    const topCountries = Object.entries(countryStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      totalClicks: clicks.length,
      deviceStats,
      refererStats,
      clicksByDate,
      chartData: chartDataArray,
      recentClicks: clicks.slice(0, 10),
      geographic: {
        countryStats,
        cityStats,
        topCountries,
      },
      peakHours: peakHoursArray,
      timeRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        filter: timeFilter,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت آمار رخ داد' },
      { status: 500 }
    )
  }
}

