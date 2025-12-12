import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReportData, generateHTMLReport } from '@/lib/reports'

export async function POST(
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

    const report = await prisma.scheduledReport.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'گزارش یافت نشد' },
        { status: 404 }
      )
    }

    // Calculate date range based on frequency
    const end = new Date()
    let start = new Date()

    switch (report.frequency) {
      case 'daily':
        start.setDate(end.getDate() - 1)
        break
      case 'weekly':
        start.setDate(end.getDate() - 7)
        break
      case 'monthly':
        start.setMonth(end.getMonth() - 1)
        break
    }

    // Generate report data
    const linkIds = report.linkIds ? report.linkIds.split(',') : null
    const reportData = await generateReportData(
      session.user.id,
      linkIds,
      start,
      end
    )

    // Generate HTML
    const html = generateHTMLReport(reportData)

    // Update last sent time
    await prisma.scheduledReport.update({
      where: { id },
      data: { lastSent: new Date() },
    })

    // Return HTML report
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'خطایی در تولید گزارش رخ داد' },
      { status: 500 }
    )
  }
}

