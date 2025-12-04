import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'

const NOVINPAL_API_KEY = process.env.NOVINPAL_API_KEY || process.env.NOVINO_MERCHANT_ID || ''
const NOVINPAL_REQUEST_URL = 'https://api.novinpal.ir/invoice/request'
const NOVINPAL_START_URL = 'https://api.novinpal.ir/invoice/start'
// BASE_URL باید دقیقاً همان آدرسی باشد که در پنل NovinPal ثبت شده است
const BASE_URL = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://utmkit.ir').replace(/\/$/, '')
// RETURN_URL می‌تواند از متغیر محیطی خوانده شود یا به صورت خودکار ساخته شود
const RETURN_URL = process.env.PAYMENT_CALLBACK_URL || `${BASE_URL}/payment/callback`

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

    const body = await request.json()
    const { plan } = body

    if (!plan || !['BASIC', 'PRO'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be BASIC or PRO' },
        { status: 400 }
      )
    }

    const planConfig = PLANS[plan as 'BASIC' | 'PRO']
    const amount = planConfig.price

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

      // Prepare request to NovinPal
      // مهم: return_url باید دقیقاً همان آدرسی باشد که در پنل NovinPal ثبت شده است
      // NovinPal از Form-Data استفاده می‌کند
      const formData = new URLSearchParams()
      formData.append('api_key', NOVINPAL_API_KEY)
      formData.append('amount', amount.toString())
      formData.append('return_url', RETURN_URL)
      formData.append('order_id', invoiceId)
      formData.append('description', `ارتقا به پلن ${planConfig.nameFa}`)
      if (session.user.email) {
        // اگر شماره موبایل در email است، می‌توانیم استفاده کنیم
        // یا می‌توانیم فیلد mobile را اضافه کنیم
      }
      
      // Log برای دیباگ
      console.log('Payment request to NovinPal:', {
        return_url: RETURN_URL,
        amount,
        order_id: invoiceId,
        api_key: NOVINPAL_API_KEY.substring(0, 10) + '...', // فقط برای لاگ
      })

      // Send request to NovinPal (Form-Data)
      const response = await fetch(NOVINPAL_REQUEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const data = await response.json()
      
      // Log response برای دیباگ
      console.log('NovinPal response:', {
        status: data.status,
        refId: data.refId,
        errorCode: data.errorCode,
        errorDescription: data.errorDescription,
        fullResponse: data,
      })
      
      // Log return URL که ارسال شده
      console.log('Return URL sent to NovinPal:', RETURN_URL)

      if (data.status === 1 && data.refId) {
        // Update payment with refId
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            refId: data.refId.toString(),
            status: 'PENDING',
          },
        })

        // NovinPal از start URL استفاده می‌کند
        const paymentUrl = `${NOVINPAL_START_URL}/${data.refId}`

        return NextResponse.json({
          success: true,
          payment_url: paymentUrl,
          refId: data.refId,
          payment_id: payment.id,
        })
      } else {
        // Update payment status to failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        })

        // پیام خطای دقیق‌تر بر اساس error code
        let errorMessage = data.errorDescription || 'خطا در ایجاد تراکنش'
        
        // اگر خطای return URL است (errorCode 103)
        if (data.errorCode === 103 || 
            data.errorDescription?.includes('بازگشتی') ||
            data.errorDescription?.includes('return url')) {
          errorMessage = 'آدرس بازگشتی با آدرس درگاه پرداخت ثبت شده همخوانی ندارد. لطفاً با پشتیبانی تماس بگیرید.'
        }

        return NextResponse.json(
          {
            error: errorMessage,
            errorCode: data.errorCode,
            errorDescription: data.errorDescription,
            details: process.env.NODE_ENV === 'development' ? {
              return_url: RETURN_URL,
              api_key: NOVINPAL_API_KEY.substring(0, 10) + '...',
              novinpal_response: data,
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
    console.error('Payment request error:', error)
    
    // پیام خطای دقیق‌تر
    let errorMessage = 'خطا در ایجاد درخواست پرداخت'
    if (error.code === 'P2003') {
      errorMessage = 'خطا در ارتباط با دیتابیس. لطفاً دوباره وارد شوید و مجدد تلاش کنید.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            code: error.code,
            message: error.message,
          }
        })
      },
      { status: 500 }
    )
  }
}





