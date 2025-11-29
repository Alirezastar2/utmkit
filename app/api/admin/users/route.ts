import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const plan = searchParams.get('plan') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (plan) {
      where.plan = plan
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          planExpiresAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              links: true,
              categories: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Get total clicks for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalClicks = await prisma.click.count({
          where: {
            link: {
              userId: user.id,
            },
          },
        })

        return {
          ...user,
          totalClicks,
        }
      })
    )

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    if (error.message.includes('دسترسی غیرمجاز')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت لیست کاربران رخ داد' },
      { status: 500 }
    )
  }
}





