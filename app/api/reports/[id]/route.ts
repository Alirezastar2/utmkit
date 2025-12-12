import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateNextSendDate } from '@/lib/reports'
import { z } from 'zod'

const updateReportSchema = z.object({
  name: z.string().min(1).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional().nullable(),
  dayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  format: z.enum(['email', 'pdf', 'both']).optional(),
  linkIds: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  isActive: z.boolean().optional(),
})

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

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت گزارش رخ داد' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await request.json()
    const validatedData = updateReportSchema.parse(body)

    // Recalculate next send if frequency or time changed
    let nextSend = report.nextSend
    if (validatedData.frequency || validatedData.time || validatedData.dayOfWeek !== undefined || validatedData.dayOfMonth !== undefined) {
      nextSend = calculateNextSendDate(
        validatedData.frequency || report.frequency,
        validatedData.dayOfWeek !== undefined ? validatedData.dayOfWeek : report.dayOfWeek,
        validatedData.dayOfMonth !== undefined ? validatedData.dayOfMonth : report.dayOfMonth,
        validatedData.time || report.time
      )
    }

    const updatedReport = await prisma.scheduledReport.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.frequency !== undefined && { frequency: validatedData.frequency }),
        ...(validatedData.dayOfWeek !== undefined && { dayOfWeek: validatedData.dayOfWeek }),
        ...(validatedData.dayOfMonth !== undefined && { dayOfMonth: validatedData.dayOfMonth }),
        ...(validatedData.time !== undefined && { time: validatedData.time }),
        ...(validatedData.format !== undefined && { format: validatedData.format }),
        ...(validatedData.linkIds !== undefined && { linkIds: validatedData.linkIds }),
        ...(validatedData.email !== undefined && { email: validatedData.email }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        ...(nextSend && { nextSend }),
      },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'خطایی در به‌روزرسانی گزارش رخ داد' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.scheduledReport.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'گزارش با موفقیت حذف شد' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف گزارش رخ داد' },
      { status: 500 }
    )
  }
}

