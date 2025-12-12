import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, memberId } = await params
    
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
    const validatedData = updateMemberSchema.parse(body)

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        ...(validatedData.role !== undefined && { role: validatedData.role }),
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'خطایی در به‌روزرسانی عضو رخ داد' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, memberId } = await params
    
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

    // Don't allow removing owner
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    })

    if (member?.role === 'OWNER') {
      return NextResponse.json(
        { error: 'نمی‌توانید صاحب تیم را حذف کنید' },
        { status: 400 }
      )
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ message: 'عضو با موفقیت حذف شد' })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف عضو رخ داد' },
      { status: 500 }
    )
  }
}

