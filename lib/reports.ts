import { prisma } from './prisma'

export interface ReportData {
  totalClicks: number
  links: Array<{
    id: string
    shortCode: string
    title: string | null
    clicks: number
    countryStats: Record<string, number>
    deviceStats: Record<string, number>
  }>
  period: {
    start: Date
    end: Date
  }
}

/**
 * Generate report data for a user
 */
export async function generateReportData(
  userId: string,
  linkIds: string[] | null = null,
  startDate?: Date,
  endDate?: Date
): Promise<ReportData> {
  // Default to last 7 days if no dates provided
  const end = endDate || new Date()
  const start = startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get links
  const links = await prisma.link.findMany({
    where: {
      userId,
      ...(linkIds && linkIds.length > 0 && { id: { in: linkIds } }),
    },
    include: {
      _count: {
        select: { clicks: true },
      },
    },
  })

  // Get clicks for the period
  const clicks = await prisma.click.findMany({
    where: {
      link: {
        userId,
        ...(linkIds && linkIds.length > 0 && { id: { in: linkIds } }),
      },
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      link: true,
    },
  })

  // Calculate stats per link
  const linkStats = await Promise.all(
    links.map(async (link) => {
      const linkClicks = clicks.filter((c) => c.linkId === link.id)

      // Country stats
      const countryStats = linkClicks.reduce((acc, click) => {
        const country = click.country || 'نامشخص'
        acc[country] = (acc[country] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Device stats
      const deviceStats = linkClicks.reduce((acc, click) => {
        const device = click.deviceType || 'نامشخص'
        acc[device] = (acc[device] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        id: link.id,
        shortCode: link.shortCode,
        title: link.title,
        clicks: linkClicks.length,
        countryStats,
        deviceStats,
      }
    })
  )

  return {
    totalClicks: clicks.length,
    links: linkStats,
    period: {
      start,
      end,
    },
  }
}

/**
 * Calculate next send date based on frequency
 */
export function calculateNextSendDate(
  frequency: string,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
  time?: string
): Date {
  const now = new Date()
  const [hours, minutes] = time ? time.split(':').map(Number) : [9, 0]
  
  let nextDate = new Date()

  switch (frequency) {
    case 'daily':
      nextDate.setDate(now.getDate() + 1)
      break

    case 'weekly':
      if (dayOfWeek !== null && dayOfWeek !== undefined) {
        const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7 || 7
        nextDate.setDate(now.getDate() + daysUntilNext)
      } else {
        nextDate.setDate(now.getDate() + 7)
      }
      break

    case 'monthly':
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        nextDate.setMonth(now.getMonth() + 1)
        nextDate.setDate(dayOfMonth)
      } else {
        nextDate.setMonth(now.getMonth() + 1)
        nextDate.setDate(1)
      }
      break

    default:
      nextDate.setDate(now.getDate() + 1)
  }

  nextDate.setHours(hours, minutes, 0, 0)

  return nextDate
}

/**
 * Generate HTML report
 */
export function generateHTMLReport(data: ReportData): string {
  const periodText = `${data.period.start.toLocaleDateString('fa-IR')} تا ${data.period.end.toLocaleDateString('fa-IR')}`

  return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>گزارش آمار لینک‌ها</title>
  <style>
    body {
      font-family: 'IRANSansX', 'Iranian Sans', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .summary-item:last-child {
      border-bottom: none;
    }
    .link-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .link-card h3 {
      margin-top: 0;
      color: #0d9488;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
    }
    .stat-box h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #666;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 13px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 گزارش آمار لینک‌ها</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${periodText}</p>
  </div>

  <div class="summary">
    <h2 style="margin-top: 0;">خلاصه گزارش</h2>
    <div class="summary-item">
      <span>تعداد کل کلیک‌ها:</span>
      <strong>${data.totalClicks.toLocaleString('fa-IR')}</strong>
    </div>
    <div class="summary-item">
      <span>تعداد لینک‌ها:</span>
      <strong>${data.links.length}</strong>
    </div>
    <div class="summary-item">
      <span>بازه زمانی:</span>
      <strong>${periodText}</strong>
    </div>
  </div>

  ${data.links.map(link => `
    <div class="link-card">
      <h3>${link.title || link.shortCode}</h3>
      <p style="color: #666; margin: 5px 0 15px 0;">
        <code>utmkit.ir/l/${link.shortCode}</code>
      </p>
      <div style="font-size: 18px; font-weight: bold; color: #0d9488; margin-bottom: 15px;">
        ${link.clicks.toLocaleString('fa-IR')} کلیک
      </div>
      
      <div class="stats-grid">
        ${Object.keys(link.countryStats).length > 0 ? `
          <div class="stat-box">
            <h4>کشورها</h4>
            ${Object.entries(link.countryStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([country, count]) => `
                <div class="stat-item">
                  <span>${country}</span>
                  <strong>${count}</strong>
                </div>
              `).join('')}
          </div>
        ` : ''}
        
        ${Object.keys(link.deviceStats).length > 0 ? `
          <div class="stat-box">
            <h4>دستگاه‌ها</h4>
            ${Object.entries(link.deviceStats)
              .map(([device, count]) => `
                <div class="stat-item">
                  <span>${device === 'MOBILE' ? 'موبایل' : device === 'DESKTOP' ? 'دسکتاپ' : device === 'TABLET' ? 'تبلت' : device}</span>
                  <strong>${count}</strong>
                </div>
              `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('')}

  <div class="footer">
    <p>این گزارش به صورت خودکار توسط UTMKit تولید شده است.</p>
    <p>برای مدیریت گزارش‌ها به داشبورد خود مراجعه کنید.</p>
  </div>
</body>
</html>
  `.trim()
}

