import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateShortCode } from '@/lib/utils'
import { z } from 'zod'

const bulkLinkSchema = z.object({
  links: z.array(z.object({
    originalUrl: z.string().url('لینک معتبر نیست'),
    title: z.string().optional(),
    shortCode: z.string().regex(/^[a-zA-Z0-9]*$/).optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
    categoryId: z.string().optional(),
  })).min(1).max(100),
})

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
    const validatedData = bulkLinkSchema.parse(body)

    const createdLinks = []

    for (const linkData of validatedData.links) {
      let shortCode = linkData.shortCode || generateShortCode(6)
      
      // Ensure uniqueness
      let attempts = 0
      while (await prisma.link.findUnique({ where: { shortCode } })) {
        shortCode = generateShortCode(6)
        attempts++
        if (attempts > 10) {
          continue // Skip this link
        }
      }

      const link = await prisma.link.create({
        data: {
          userId: session.user.id,
          originalUrl: linkData.originalUrl,
          title: linkData.title || null,
          shortCode,
          utmSource: linkData.utmSource || null,
          utmMedium: linkData.utmMedium || null,
          utmCampaign: linkData.utmCampaign || null,
          utmTerm: linkData.utmTerm || null,
          utmContent: linkData.utmContent || null,
          categoryId: linkData.categoryId || null,
        },
      })

      createdLinks.push(link)
    }

    return NextResponse.json({
      message: `${createdLinks.length} لینک با موفقیت ایجاد شد`,
      links: createdLinks,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating bulk links:', error)
    return NextResponse.json(
      { error: 'خطایی در ایجاد لینک‌ها رخ داد' },
      { status: 500 }
    )
  }
}





