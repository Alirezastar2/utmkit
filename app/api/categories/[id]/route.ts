import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'دسته‌بندی با موفقیت حذف شد' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف دسته‌بندی رخ داد' },
      { status: 500 }
    )
  }
}

