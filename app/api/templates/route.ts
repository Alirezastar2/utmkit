import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'نام template الزامی است'),
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

    const templates = await prisma.linkTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت templateها رخ داد' },
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
    const validatedData = createTemplateSchema.parse(body)

    const template = await prisma.linkTemplate.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        utmSource: validatedData.utmSource || null,
        utmMedium: validatedData.utmMedium || null,
        utmCampaign: validatedData.utmCampaign || null,
        utmTerm: validatedData.utmTerm || null,
        utmContent: validatedData.utmContent || null,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'خطایی در ایجاد template رخ داد' },
      { status: 500 }
    )
  }
}





