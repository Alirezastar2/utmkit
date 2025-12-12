import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateNextSendDate } from '@/lib/reports'
import { z } from 'zod'

const createReportSchema = z.object({
  name: z.string().min(1, 'نام گزارش الزامی است'),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'فرکانس باید daily، weekly یا monthly باشد' }),
  }),
  dayOfWeek: z.number().int().min(0).max(6).optional().nullable(),
  dayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'فرمت زمان باید HH:mm باشد'),
  format: z.enum(['email', 'pdf', 'both']).default('email'),
  linkIds: z.string().optional().nullable(),
  email: z.string().email('ایمیل معتبر نیست').optional().nullable(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const reports = await prisma.scheduledReport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت گزارش‌ها رخ داد' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createReportSchema.parse(body)

    // Calculate next send date
    const nextSend = calculateNextSendDate(
      validatedData.frequency,
      validatedData.dayOfWeek || null,
      validatedData.dayOfMonth || null,
      validatedData.time
    )

    const report = await prisma.scheduledReport.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        frequency: validatedData.frequency,
        dayOfWeek: validatedData.dayOfWeek || null,
        dayOfMonth: validatedData.dayOfMonth || null,
        time: validatedData.time,
        format: validatedData.format,
        linkIds: validatedData.linkIds || null,
        email: validatedData.email || session.user.email || null,
        nextSend,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'خطایی در ایجاد گزارش رخ داد' },
      { status: 500 }
    )
  }
}

