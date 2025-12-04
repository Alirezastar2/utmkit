import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'

const NOVINO_MERCHANT_ID = process.env.NOVINO_MERCHANT_ID || '73D08668-BE7A-4B26-854C-14968226A2C9'
const NOVINO_REQUEST_URL = 'https://api.novinopay.com/payment/ipg/v2/request'
// BASE_URL باید دقیقاً همان آدرسی باشد که در پنل NovinoPay ثبت شده است
const BASE_URL = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://utmkit.ir').replace(/\/$/, '')
// CALLBACK_URL می‌تواند از متغیر محیطی خوانده شود یا به صورت خودکار ساخته شود
const CALLBACK_URL = process.env.PAYMENT_CALLBACK_URL || `${BASE_URL}/payment/callback`

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // بررسی وجود کاربر در دیتابیس
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    })

    if (!user) {
      console.error('User not found in database:', {
        sessionUserId: session.user.id,
        sessionUserEmail: session.user.email,
      })
      return NextResponse.json(
        { error: 'کاربر یافت نشد. لطفاً دوباره وارد شوید.' },
        { status: 401 }
      )
    }

    // لاگ برای دیباگ Foreign key constraint
    console.log('Creating payment for user:', {
      userId: user.id,
      userEmail: user.email,
      sessionUserId: session.user.id,
      sessionUserEmail: session.user.email,
      userIdMatch: user.id === session.user.id,
    })
    
    // بررسی مجدد وجود user قبل از ایجاد payment
    const userExists = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    })
    
    if (!userExists) {
      console.error('User disappeared from database before payment creation:', user.id)
      return NextResponse.json(
        { error: 'خطا در ارتباط با دیتابیس. لطفاً دوباره تلاش کنید.' },
        { status: 500 }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch (parseError: any) {
      console.error('Error parsing request body:', parseError)
      return NextResponse.json(
        { error: 'خطا در پردازش درخواست. لطفاً دوباره تلاش کنید.' },
        { status: 400 }
      )
    }

    const { plan } = body

    if (!plan || !['BASIC', 'PRO'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be BASIC or PRO' },
        { status: 400 }
      )
    }

    const planConfig = PLANS[plan as 'BASIC' | 'PRO']
    const amount = planConfig.price

    // بررسی merchant_id
    if (!NOVINO_MERCHANT_ID || NOVINO_MERCHANT_ID === '') {
      console.error('NOVINO_MERCHANT_ID is not set')
      return NextResponse.json(
        { error: 'تنظیمات درگاه پرداخت کامل نیست. لطفاً با پشتیبانی تماس بگیرید.' },
        { status: 500 }
      )
    }

    // بررسی مبلغ (NovinoPay حداقل 10000 ریال نیاز دارد)
    if (amount < 10000) {
      return NextResponse.json(
        { error: 'مبلغ پرداخت باید حداقل ۱۰,۰۰۰ ریال باشد.' },
        { status: 400 }
      )
    }

    // Generate invoice ID
    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Create payment record
    try {
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          plan,
          amount,
          invoiceId,
          status: 'PENDING',
        },
      })

      // Prepare request to NovinoPay
      // مهم: callback_url باید دقیقاً همان آدرسی باشد که در پنل NovinoPay ثبت شده است
      // NovinoPay از JSON استفاده می‌کند
      const novinoRequest = {
        merchant_id: NOVINO_MERCHANT_ID,
        amount: amount,
        callback_url: CALLBACK_URL,
        callback_method: 'GET',
        invoice_id: invoiceId,
        description: `ارتقا به پلن ${planConfig.nameFa}`,
        email: session.user.email || undefined,
        name: session.user.name || undefined,
      }
      
      // Log برای دیباگ
      console.log('Payment request to NovinoPay:', {
        callback_url: CALLBACK_URL,
        amount,
        invoice_id: invoiceId,
        merchant_id: NOVINO_MERCHANT_ID.substring(0, 10) + '...',
      })

      // Send request to NovinoPay (JSON)
      let response: Response
      try {
        response = await fetch(NOVINO_REQUEST_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novinoRequest),
        })
      } catch (fetchError: any) {
        console.error('Fetch error to NovinoPay:', fetchError)
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        })
        return NextResponse.json(
          { error: 'خطا در ارتباط با درگاه پرداخت. لطفاً دوباره تلاش کنید.' },
          { status: 500 }
        )
      }

      // Parse response
      let data: any
      try {
        const responseText = await response.text()
        console.log('NovinoPay raw response:', responseText)
        data = JSON.parse(responseText)
      } catch (parseError: any) {
        console.error('Parse error for NovinoPay response:', parseError)
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        })
        return NextResponse.json(
          { error: 'خطا در پردازش پاسخ درگاه پرداخت. لطفاً دوباره تلاش کنید.' },
          { status: 500 }
        )
      }
      
      // Log response برای دیباگ
      console.log('NovinoPay response:', {
        status: data.status,
        message: data.message,
        hasData: !!data.data,
        fullResponse: data,
      })
      
      // Log callback URL که ارسال شده
      console.log('Callback URL sent to NovinoPay:', CALLBACK_URL)

      if (data.status === '100' && data.data) {
        // Update payment with authority and trans_id
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            authority: data.data.authority,
            transId: data.data.trans_id?.toString(),
            status: 'PENDING',
          },
        })

        return NextResponse.json({
          success: true,
          payment_url: data.data.payment_url,
          authority: data.data.authority,
          payment_id: payment.id,
        })
      } else {
        // Update payment status to failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        })

        // پیام خطای دقیق‌تر بر اساس status code
        let errorMessage = data.message || 'خطا در ایجاد تراکنش'
        
        // پیام‌های خطای خاص بر اساس status (NovinoPay)
        const errorMessages: Record<string, string> = {
          '-101': 'کد پذیرنده وارد شده نامعتبر یا غیرفعال است',
          '-102': 'IP سرور درخواست دهنده معتبر نمی‌باشد',
          '-103': 'آدرس بازگشتی با آدرس درگاه پرداخت ثبت شده همخوانی ندارد. لطفاً با پشتیبانی تماس بگیرید.',
          '-104': 'مبلغ ارسال شده صحیح نمی‌باشد',
          '-105': 'مجموع مبلغ تراکنش و کارمزد نباید بیش از 1.000.000.000 ریال باشد',
          '-106': 'شماره کارت ارسالی معتبر نمی‌باشد',
          '-107': 'وب‌سرویس مقصد جهت اتصال معتبر نمی‌باشد',
          '-108': 'بروز خطای سیستمی - ایجاد تراکنش با خطا مواجه شد',
        }

        if (data.status && errorMessages[data.status]) {
          errorMessage = errorMessages[data.status]
        } else if (data.message?.includes('بازگشتی') || 
                   data.message?.includes('callback') ||
                   data.status === '-103') {
          errorMessage = 'آدرس بازگشتی با آدرس درگاه پرداخت ثبت شده همخوانی ندارد. لطفاً با پشتیبانی تماس بگیرید.'
        }

        return NextResponse.json(
          {
            error: errorMessage,
            status: data.status,
            message: data.message,
            details: process.env.NODE_ENV === 'development' ? {
              callback_url: CALLBACK_URL,
              merchant_id_set: !!NOVINO_MERCHANT_ID && NOVINO_MERCHANT_ID !== '',
              novino_response: data,
            } : undefined,
          },
          { status: 400 }
        )
      }
    } catch (createError: any) {
      // اگر خطای Foreign key constraint است، اطلاعات بیشتری لاگ کن
      if (createError.code === 'P2003' || createError.message?.includes('Foreign key constraint')) {
        console.error('Foreign key constraint error:', {
          code: createError.code,
          message: createError.message,
          meta: createError.meta,
          userId: user.id,
          sessionUserId: session.user.id,
        })
        
        // بررسی مجدد وجود کاربر
        const userCheck = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, email: true },
        })
        
        console.error('User verification after FK error:', {
          userExists: !!userCheck,
          userId: user.id,
        })
      }
      throw createError
    }
  } catch (error: any) {
    console.error('Payment request error:', {
      error: error,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      name: error?.name,
    })
    
    // پیام خطای دقیق‌تر
    let errorMessage = 'خطا در ایجاد درخواست پرداخت'
    if (error.code === 'P2003') {
      errorMessage = 'خطا در ارتباط با دیتابیس. لطفاً دوباره وارد شوید و مجدد تلاش کنید.'
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'خطا در پردازش اطلاعات. لطفاً دوباره تلاش کنید.'
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'خطا در ارتباط با درگاه پرداخت. لطفاً دوباره تلاش کنید.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            code: error.code,
            message: error.message,
            name: error.name,
          }
        })
      },
      { status: 500 }
    )
  }
}





