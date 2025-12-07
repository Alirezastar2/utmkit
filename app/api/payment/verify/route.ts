import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const NOVINO_MERCHANT_ID = process.env.NOVINO_MERCHANT_ID || '53D3AB9D-B6DB-4C07-A96E-C77CB6201E75'
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
    // NovinoPay از JSON استفاده می‌کند
    const verifyRequest = {
      merchant_id: NOVINO_MERCHANT_ID,
      amount: amount.toString(),
      authority: authority,
    }

    let response: Response
    try {
      response = await fetch(NOVINO_VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyRequest),
      })
    } catch (fetchError: any) {
      console.error('Fetch error to NovinoPay verify:', fetchError)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })
      return NextResponse.json(
        { error: 'خطا در ارتباط با درگاه پرداخت. لطفاً دوباره تلاش کنید.' },
        { status: 500 }
      )
    }

    let verifyData: any
    try {
      const responseText = await response.text()
      console.log('NovinoPay verify raw response:', {
        statusCode: response.status,
        statusText: response.statusText,
        responseText: responseText,
      })
      verifyData = JSON.parse(responseText)
    } catch (parseError: any) {
      console.error('Parse error for NovinoPay verify response:', parseError)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })
      return NextResponse.json(
        { error: 'خطا در پردازش پاسخ درگاه پرداخت. لطفاً دوباره تلاش کنید.' },
        { status: 500 }
      )
    }

    // Log response for debugging
    console.log('NovinoPay verify response:', {
      httpStatus: response.status,
      httpStatusText: response.statusText,
      novinoStatus: verifyData.status,
      message: verifyData.message,
      hasData: !!verifyData.data,
      errors: verifyData.errors,
      fullResponse: verifyData,
    })

    // Check if HTTP response is not OK
    if (!response.ok) {
      console.error('NovinoPay verify HTTP error:', {
        status: response.status,
        statusText: response.statusText,
        data: verifyData,
      })
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })
      return NextResponse.json(
        {
          error: verifyData.message || 'خطا در ارتباط با درگاه پرداخت',
          status: verifyData.status,
          errors: verifyData.errors,
        },
        { status: response.status }
      )
    }

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
          transId: verifyData.data.trans_id?.toString(),
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

      // پیام خطای دقیق‌تر بر اساس status code
      let errorMessage = verifyData.message || 'خطا در تایید تراکنش'
      
      // پیام‌های خطای خاص بر اساس status (NovinoPay)
      const errorMessages: Record<string, string> = {
        '-101': 'کد پذیرنده وارد شده نامعتبر یا غیرفعال است',
        '-102': 'IP سرور درخواست دهنده معتبر نمی‌باشد',
        '-103': 'آدرس بازگشتی با آدرس درگاه پرداخت ثبت شده همخوانی ندارد',
        '-104': 'مبلغ ارسال شده صحیح نمی‌باشد',
        '-105': 'مجموع مبلغ تراکنش و کارمزد نباید بیش از 1.000.000.000 ریال باشد',
        '-106': 'شماره کارت ارسالی معتبر نمی‌باشد',
        '-107': 'وب‌سرویس مقصد جهت اتصال معتبر نمی‌باشد',
        '-108': 'بروز خطای سیستمی - تایید تراکنش با خطا مواجه شد',
      }

      if (verifyData.status && errorMessages[verifyData.status]) {
        errorMessage = errorMessages[verifyData.status]
      }

      console.error('NovinoPay verify error response:', {
        status: verifyData.status,
        message: verifyData.message,
        errors: verifyData.errors,
        fullResponse: verifyData,
      })

      return NextResponse.json(
        {
          error: errorMessage,
          status: verifyData.status,
          message: verifyData.message,
          errors: verifyData.errors,
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





