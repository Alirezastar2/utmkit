import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyDomain } from '@/lib/domains'

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

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'دامنه یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...domain,
      dnsRecords: domain.dnsRecords ? JSON.parse(domain.dnsRecords) : null,
    })
  } catch (error) {
    console.error('Error fetching domain:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت دامنه رخ داد' },
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

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'دامنه یافت نشد' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { isActive } = body

    const updatedDomain = await prisma.customDomain.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(updatedDomain)
  } catch (error) {
    console.error('Error updating domain:', error)
    return NextResponse.json(
      { error: 'خطایی در به‌روزرسانی دامنه رخ داد' },
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

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'دامنه یافت نشد' },
        { status: 404 }
      )
    }

    await prisma.customDomain.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'دامنه با موفقیت حذف شد' })
  } catch (error) {
    console.error('Error deleting domain:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف دامنه رخ داد' },
      { status: 500 }
    )
  }
}

