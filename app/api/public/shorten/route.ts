import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateShortCode } from '@/lib/utils'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const shortenLinkSchema = z.object({
  originalUrl: z.string().url('لینک معتبر نیست'),
  shortCode: z.string().regex(/^[a-zA-Z0-9]*$/, 'کد کوتاه فقط می‌تواند شامل حروف انگلیسی و اعداد باشد').optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = shortenLinkSchema.parse(body)

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

    // Find or create a guest user for public links
    let guestUser = await prisma.user.findUnique({
      where: { email: 'guest@utmkit.ir' },
    })

    if (!guestUser) {
      // Create guest user if doesn't exist
      // Use a secure random password that won't be used
      const hashedPassword = await bcrypt.hash('guest_' + Date.now(), 10)
      
      guestUser = await prisma.user.create({
        data: {
          email: 'guest@utmkit.ir',
          name: 'Guest User',
          password: hashedPassword,
          plan: 'FREE',
        },
      })
    }

    const link = await prisma.link.create({
      data: {
        userId: guestUser.id,
        originalUrl: validatedData.originalUrl,
        title: null,
        shortCode,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
      },
    })

    const shortUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://utmkit.ir'}/l/${link.shortCode}`

    return NextResponse.json({
      success: true,
      shortUrl,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating public link:', error)
    return NextResponse.json(
      { error: 'خطایی در ایجاد لینک رخ داد' },
      { status: 500 }
    )
  }
}


