import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const NOVINPAL_API_KEY = process.env.NOVINPAL_API_KEY || process.env.NOVINO_MERCHANT_ID || ''
const NOVINPAL_VERIFY_URL = 'https://api.novinpal.ir/invoice/verify'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { refId } = body

    if (!refId) {
      return NextResponse.json(
        { error: 'refId is required' },
        { status: 400 }
      )
    }

    // Find payment by refId
    const payment = await prisma.payment.findFirst({
      where: {
        refId: refId.toString(),
        userId: session.user.id,
        status: { in: ['PENDING', 'SUCCESS'] },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (payment.status === 'VERIFIED') {
      return NextResponse.json({
        success: true,
        message: 'تراکنش قبلاً تایید شده است',
        payment,
      })
    }

    // Verify with NovinPal
    // NovinPal از Form-Data استفاده می‌کند
    const formData = new URLSearchParams()
    formData.append('api_key', NOVINPAL_API_KEY)
    formData.append('ref_id', refId.toString())

    const response = await fetch(NOVINPAL_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const verifyData = await response.json()

    if (verifyData.status === 1) {
      // Update payment
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'VERIFIED',
          refId: verifyData.refId?.toString(),
          cardPan: verifyData.cardNumber,
          paymentTime: verifyData.paidAt ? new Date(verifyData.paidAt) : null,
          verifiedAt: new Date(),
          transId: verifyData.refNumber,
        },
      })

      // Update user plan
      const planExpiresAt = new Date()
      planExpiresAt.setMonth(planExpiresAt.getMonth() + 1) // 1 month subscription

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          plan: payment.plan,
          planExpiresAt,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'پرداخت با موفقیت انجام شد',
        payment: updatedPayment,
        plan: payment.plan,
      })
    } else {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })

      return NextResponse.json(
        {
          error: verifyData.errorDescription || 'خطا در تایید تراکنش',
          errorCode: verifyData.errorCode,
          status: verifyData.status,
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'خطا در تایید تراکنش' },
      { status: 500 }
    )
  }
}





