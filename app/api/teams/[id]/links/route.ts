import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const shareLinkSchema = z.object({
  linkId: z.string().min(1, 'لینک الزامی است'),
})

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

    // Check if user is team member with EDITOR or higher role
    const team = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id, role: { in: ['OWNER', 'ADMIN', 'EDITOR'] } } } },
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
    const validatedData = shareLinkSchema.parse(body)

    // Check if link belongs to user or is already shared
    const link = await prisma.link.findFirst({
      where: {
        id: validatedData.linkId,
        userId: session.user.id,
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'لینک یافت نشد یا دسترسی ندارید' },
        { status: 404 }
      )
    }

    // Check if already shared
    const existingShare = await prisma.teamLink.findUnique({
      where: {
        teamId_linkId: {
          teamId: id,
          linkId: validatedData.linkId,
        },
      },
    })

    if (existingShare) {
      return NextResponse.json(
        { error: 'این لینک قبلاً به اشتراک گذاشته شده است' },
        { status: 400 }
      )
    }

    const teamLink = await prisma.teamLink.create({
      data: {
        teamId: id,
        linkId: validatedData.linkId,
      },
      include: {
        link: {
          include: {
            _count: {
              select: { clicks: true },
            },
          },
        },
      },
    })

    return NextResponse.json(teamLink, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error sharing link:', error)
    return NextResponse.json(
      { error: 'خطایی در اشتراک‌گذاری لینک رخ داد' },
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
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    
    if (!session?.user?.id || !linkId) {
      return NextResponse.json(
        { error: 'پارامترهای لازم ارسال نشده است' },
        { status: 400 }
      )
    }

    // Check if user is team member with EDITOR or higher role
    const team = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id, role: { in: ['OWNER', 'ADMIN', 'EDITOR'] } } } },
        ],
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'تیم یافت نشد یا دسترسی ندارید' },
        { status: 404 }
      )
    }

    await prisma.teamLink.delete({
      where: {
        teamId_linkId: {
          teamId: id,
          linkId,
        },
      },
    })

    return NextResponse.json({ message: 'لینک از تیم حذف شد' })
  } catch (error) {
    console.error('Error removing link:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف لینک رخ داد' },
      { status: 500 }
    )
  }
}

