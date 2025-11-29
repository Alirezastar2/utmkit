import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canExport } from '@/lib/plan-checks'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    // Check if user can export
    const canUserExport = await canExport(session.user.id)
    if (!canUserExport) {
      return NextResponse.json(
        { error: 'این قابلیت فقط در پلن‌های پایه و حرفه‌ای در دسترس است. لطفاً پلن خود را ارتقا دهید.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { clicks: true },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (format === 'csv') {
      const csvHeaders = [
        'عنوان',
        'لینک اصلی',
        'لینک کوتاه',
        'دسته‌بندی',
        'تعداد کلیک',
        'UTM Source',
        'UTM Medium',
        'UTM Campaign',
        'تاریخ ساخت',
        'تاریخ انقضا',
        'وضعیت',
      ]

      const csvRows = links.map(link => [
        link.title || '',
        link.originalUrl,
            `${process.env.NEXTAUTH_URL || 'https://utmkit.ir'}/l/${link.shortCode}`,
        link.category?.name || '',
        link._count.clicks.toString(),
        link.utmSource || '',
        link.utmMedium || '',
        link.utmCampaign || '',
        new Date(link.createdAt).toLocaleDateString('fa-IR'),
        link.expiresAt ? new Date(link.expiresAt).toLocaleDateString('fa-IR') : '',
        link.isActive ? 'فعال' : 'غیرفعال',
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="links-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json(links)
  } catch (error) {
    console.error('Error exporting links:', error)
    return NextResponse.json(
      { error: 'خطایی در export لینک‌ها رخ داد' },
      { status: 500 }
    )
  }
}

