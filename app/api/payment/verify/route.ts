import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const NOVINO_MERCHANT_ID = process.env.NOVINO_MERCHANT_ID || '73D08668-BE7A-4B26-854C-14968226A2C9'
const NOVINO_VERIFY_URL = 'https://api.novinopay.com/payment/ipg/v2/verification'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { authority, amount } = body

    if (!authority || !amount) {
      return NextResponse.json(
        { error: 'Authority and amount are required' },
        { status: 400 }
      )
    }

    // Find payment by authority
    const payment = await prisma.payment.findFirst({
      where: {
        authority,
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

    // Verify with NovinoPay
    const verifyRequest = {
      merchant_id: NOVINO_MERCHANT_ID,
      amount: amount.toString(),
      authority: authority,
    }

    const response = await fetch(NOVINO_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyRequest),
    })

    const verifyData = await response.json()

    if (verifyData.status === '100' && verifyData.data) {
      // Update payment
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'VERIFIED',
          refId: verifyData.data.ref_id,
          cardPan: verifyData.data.card_pan,
          buyerIp: verifyData.data.buyer_ip,
          paymentTime: verifyData.data.payment_time
            ? new Date(verifyData.data.payment_time * 1000)
            : null,
          verifiedAt: new Date(),
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
          error: verifyData.message || 'خطا در تایید تراکنش',
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





