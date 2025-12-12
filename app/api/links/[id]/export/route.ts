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

    // Get format from query params (csv or excel)
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const timeFilter = searchParams.get('timeFilter') || 'all'

    // Calculate date range
    let start: Date | undefined
    let end: Date | undefined
    
    if (timeFilter !== 'all') {
      end = new Date()
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
      }
    }

    // Get clicks
    const clicks = await prisma.click.findMany({
      where: {
        linkId: id,
        ...(start && end && {
          createdAt: {
            gte: start,
            lte: end,
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = ['تاریخ', 'ساعت', 'IP', 'کشور', 'شهر', 'دستگاه', 'سیستم عامل', 'مرورگر', 'Referer']
      const rows = clicks.map(click => [
        new Date(click.createdAt).toLocaleDateString('fa-IR'),
        new Date(click.createdAt).toLocaleTimeString('fa-IR'),
        click.ip || '',
        click.country || 'نامشخص',
        click.city || 'نامشخص',
        click.deviceType || 'نامشخص',
        click.os || 'نامشخص',
        click.browser || 'نامشخص',
        click.referer || 'مستقیم',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n')

      // Add BOM for Excel UTF-8 support
      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csvContent

      return new NextResponse(csvWithBOM, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="link-${link.shortCode}-stats-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Excel format (CSV with Excel MIME type)
      const headers = ['تاریخ', 'ساعت', 'IP', 'کشور', 'شهر', 'دستگاه', 'سیستم عامل', 'مرورگر', 'Referer']
      const rows = clicks.map(click => [
        new Date(click.createdAt).toLocaleDateString('fa-IR'),
        new Date(click.createdAt).toLocaleTimeString('fa-IR'),
        click.ip || '',
        click.country || 'نامشخص',
        click.city || 'نامشخص',
        click.deviceType || 'نامشخص',
        click.os || 'نامشخص',
        click.browser || 'نامشخص',
        click.referer || 'مستقیم',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n')

      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csvContent

      return new NextResponse(csvWithBOM, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="link-${link.shortCode}-stats-${new Date().toISOString().split('T')[0]}.xls"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting stats:', error)
    return NextResponse.json(
      { error: 'خطایی در export آمار رخ داد' },
      { status: 500 }
    )
  }
}

