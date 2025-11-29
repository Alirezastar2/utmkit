import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  plan: z.enum(['FREE', 'BASIC', 'PRO']).optional(),
  planExpiresAt: z.string().datetime().nullable().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            links: true,
            categories: true,
            linkTemplates: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 })
    }

    // Get user's links with stats
    const links = await prisma.link.findMany({
      where: { userId: id },
      include: {
        _count: {
          select: { clicks: true },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Get total clicks
    const totalClicks = await prisma.click.count({
      where: {
        link: {
          userId: id,
        },
      },
    })

    // Get clicks in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentClicks = await prisma.click.count({
      where: {
        link: {
          userId: id,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    return NextResponse.json({
      user,
      links,
      stats: {
        totalClicks,
        recentClicks,
      },
    })
  } catch (error: any) {
    if (error.message.includes('دسترسی غیرمجاز')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت اطلاعات کاربر رخ داد' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if email is being updated and if it's unique
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'این ایمیل قبلاً استفاده شده است' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.email !== undefined && { email: validatedData.email }),
        ...(validatedData.role !== undefined && { role: validatedData.role }),
        ...(validatedData.plan !== undefined && { plan: validatedData.plan }),
        ...(validatedData.planExpiresAt !== undefined && {
          planExpiresAt: validatedData.planExpiresAt
            ? new Date(validatedData.planExpiresAt)
            : null,
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    if (error.message.includes('دسترسی غیرمجاز')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'خطایی در به‌روزرسانی کاربر رخ داد' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    // Prevent deleting yourself
    const session = await getServerSession(authOptions)
    if (session?.user?.id === id) {
      return NextResponse.json(
        { error: 'نمی‌توانید حساب کاربری خود را حذف کنید' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'کاربر با موفقیت حذف شد' })
  } catch (error: any) {
    if (error.message.includes('دسترسی غیرمجاز')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف کاربر رخ داد' },
      { status: 500 }
    )
  }
}





