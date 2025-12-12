import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addMemberSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('VIEWER'),
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
    })

    if (!team) {
      return NextResponse.json(
        { error: 'تیم یافت نشد' },
        { status: 404 }
      )
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId: id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت اعضا رخ داد' },
      { status: 500 }
    )
  }
}

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
    const validatedData = addMemberSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این ایمیل یافت نشد' },
        { status: 404 }
      )
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: id,
          userId: user.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'این کاربر قبلاً به تیم اضافه شده است' },
        { status: 400 }
      )
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: id,
        userId: user.id,
        role: validatedData.role,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error adding member:', error)
    return NextResponse.json(
      { error: 'خطایی در اضافه کردن عضو رخ داد' },
      { status: 500 }
    )
  }
}

