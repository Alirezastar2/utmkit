import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PLANS, type PlanType } from '@/lib/plans'

const updatePlanSchema = z.object({
  plan: z.enum(['FREE', 'BASIC', 'PRO']),
  period: z.enum(['monthly', 'yearly']).optional().default('monthly'),
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, planExpiresAt: true },
    })

    return NextResponse.json({
      plan: user?.plan || 'FREE',
      planExpiresAt: user?.planExpiresAt,
    })
  } catch (error) {
    console.error('Error fetching user plan:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت پلن کاربر رخ داد' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updatePlanSchema.parse(body)

    // Calculate expiration date
    const now = new Date()
    const expiresAt = new Date(now)
    if (validatedData.period === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    }

    // Update user plan
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan: validatedData.plan as PlanType,
        planExpiresAt: validatedData.plan === 'FREE' ? null : expiresAt,
      },
      select: { plan: true, planExpiresAt: true },
    })

    return NextResponse.json({
      message: 'پلن با موفقیت به‌روزرسانی شد',
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating user plan:', error)
    return NextResponse.json(
      { error: 'خطایی در به‌روزرسانی پلن رخ داد' },
      { status: 500 }
    )
  }
}






