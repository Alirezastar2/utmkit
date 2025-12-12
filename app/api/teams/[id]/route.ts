import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
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

    const team = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
        sharedLinks: {
          include: {
            link: {
              include: {
                _count: {
                  select: { clicks: true },
                },
              },
            },
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'تیم یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت تیم رخ داد' },
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

    // Check if user is owner or admin
    const team = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id, role: { in: ['OWNER', 'ADMIN'] } } } },
        ],
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'تیم یافت نشد یا دسترسی ندارید' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateTeamSchema.parse(body)

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedTeam)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'خطایی در به‌روزرسانی تیم رخ داد' },
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

    // Only owner can delete team
    const team = await prisma.team.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'تیم یافت نشد یا دسترسی ندارید' },
        { status: 404 }
      )
    }

    await prisma.team.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'تیم با موفقیت حذف شد' })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف تیم رخ داد' },
      { status: 500 }
    )
  }
}

