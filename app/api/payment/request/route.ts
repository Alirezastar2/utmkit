import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'

const NOVINO_MERCHANT_ID = process.env.NOVINO_MERCHANT_ID || '73D08668-BE7A-4B26-854C-14968226A2C9'
const NOVINO_API_URL = 'https://api.novinopay.com/payment/ipg/v2/request'
const BASE_URL = process.env.NEXTAUTH_URL || 'https://utmkit.ir'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        plan,
        amount,
        invoiceId,
        status: 'PENDING',
      },
    })

    // Prepare request to NovinoPay
    const novinoRequest = {
      merchant_id: NOVINO_MERCHANT_ID,
      amount: amount,
      callback_url: `${BASE_URL}/payment/callback`,
      callback_method: 'GET',
      invoice_id: invoiceId,
      description: `ارتقا به پلن ${planConfig.nameFa}`,
      email: session.user.email || undefined,
      name: session.user.name || undefined,
    }

    // Send request to NovinoPay
    const response = await fetch(NOVINO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novinoRequest),
    })

    const data = await response.json()

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

      return NextResponse.json(
        {
          error: data.message || 'خطا در ایجاد تراکنش',
          status: data.status,
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Payment request error:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد درخواست پرداخت' },
      { status: 500 }
    )
  }
}





