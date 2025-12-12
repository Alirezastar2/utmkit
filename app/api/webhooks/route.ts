import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateWebhookSecret } from '@/lib/webhooks'
import { z } from 'zod'

const createWebhookSchema = z.object({
  url: z.string().url('URL معتبر نیست'),
  events: z.string().min(1, 'حداقل یک event باید انتخاب شود'),
  secret: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const webhooks = await prisma.webhook.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(webhooks)
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت webhookها رخ داد' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createWebhookSchema.parse(body)

    const webhook = await prisma.webhook.create({
      data: {
        userId: session.user.id,
        url: validatedData.url,
        events: validatedData.events,
        secret: validatedData.secret || generateWebhookSecret(),
      },
    })

    return NextResponse.json(webhook, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating webhook:', error)
    return NextResponse.json(
      { error: 'خطایی در ایجاد webhook رخ داد' },
      { status: 500 }
    )
  }
}

