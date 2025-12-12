import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken, generateDNSRecords } from '@/lib/domains'
import { z } from 'zod'

const createDomainSchema = z.object({
  domain: z.string().min(1, 'دامنه الزامی است').regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'فرمت دامنه معتبر نیست'),
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

    const domains = await prisma.customDomain.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت دامنه‌ها رخ داد' },
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
    const validatedData = createDomainSchema.parse(body)

    // Normalize domain (remove protocol, www, trailing slash)
    const normalizedDomain = validatedData.domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase()

    // Check if domain already exists
    const existing = await prisma.customDomain.findUnique({
      where: { domain: normalizedDomain },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'این دامنه قبلاً ثبت شده است' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const dnsRecords = generateDNSRecords(normalizedDomain, verificationToken)

    const domain = await prisma.customDomain.create({
      data: {
        userId: session.user.id,
        domain: normalizedDomain,
        verificationToken,
        dnsRecords: JSON.stringify(dnsRecords),
      },
    })

    return NextResponse.json({
      ...domain,
      dnsRecords,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating domain:', error)
    return NextResponse.json(
      { error: 'خطایی در ثبت دامنه رخ داد' },
      { status: 500 }
    )
  }
}

