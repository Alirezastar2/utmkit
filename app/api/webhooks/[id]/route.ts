import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateWebhookSchema = z.object({
  url: z.string().url('URL معتبر نیست').optional(),
  events: z.string().min(1, 'حداقل یک event باید انتخاب شود').optional(),
  isActive: z.boolean().optional(),
  secret: z.string().optional(),
})

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

    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(webhook)
  } catch (error) {
    console.error('Error fetching webhook:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت webhook رخ داد' },
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

    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook یافت نشد' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateWebhookSchema.parse(body)

    const updatedWebhook = await prisma.webhook.update({
      where: { id },
      data: {
        ...(validatedData.url !== undefined && { url: validatedData.url }),
        ...(validatedData.events !== undefined && { events: validatedData.events }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        ...(validatedData.secret !== undefined && { secret: validatedData.secret }),
      },
    })

    return NextResponse.json(updatedWebhook)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating webhook:', error)
    return NextResponse.json(
      { error: 'خطایی در به‌روزرسانی webhook رخ داد' },
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

    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook یافت نشد' },
        { status: 404 }
      )
    }

    await prisma.webhook.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Webhook با موفقیت حذف شد' })
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف webhook رخ داد' },
      { status: 500 }
    )
  }
}

