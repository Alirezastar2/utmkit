import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateShortCode } from '@/lib/utils'
import { z } from 'zod'

const createLinkSchema = z.object({
  originalUrl: z.string().url('لینک معتبر نیست'),
  title: z.string().optional(),
  shortCode: z.string().regex(/^[a-zA-Z0-9]*$/, 'کد کوتاه فقط می‌تواند شامل حروف انگلیسی و اعداد باشد').optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت لینک‌ها رخ داد' },
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
    const validatedData = createLinkSchema.parse(body)

    // Generate short code if not provided
    let shortCode = validatedData.shortCode || generateShortCode(6)
    
    // Ensure uniqueness
    let attempts = 0
    while (await prisma.link.findUnique({ where: { shortCode } })) {
      shortCode = generateShortCode(6)
      attempts++
      if (attempts > 10) {
        return NextResponse.json(
          { error: 'خطا در تولید کد کوتاه. لطفاً دوباره تلاش کنید.' },
          { status: 500 }
        )
      }
    }

    const link = await prisma.link.create({
      data: {
        userId: session.user.id,
        originalUrl: validatedData.originalUrl,
        title: validatedData.title || null,
        shortCode,
        utmSource: validatedData.utmSource || null,
        utmMedium: validatedData.utmMedium || null,
        utmCampaign: validatedData.utmCampaign || null,
        utmTerm: validatedData.utmTerm || null,
        utmContent: validatedData.utmContent || null,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating link:', error)
    return NextResponse.json(
      { error: 'خطایی در ایجاد لینک رخ داد' },
      { status: 500 }
    )
  }
}





