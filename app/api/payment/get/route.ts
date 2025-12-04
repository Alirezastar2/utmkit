import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const refId = searchParams.get('refId') || searchParams.get('authority') // برای سازگاری با کد قدیمی

    if (!refId) {
      return NextResponse.json(
        { error: 'refId is required' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { refId },
          { authority: refId }, // برای سازگاری با کد قدیمی
        ],
        userId: session.user.id,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ payment })
  } catch (error: any) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات پرداخت' },
      { status: 500 }
    )
  }
}





