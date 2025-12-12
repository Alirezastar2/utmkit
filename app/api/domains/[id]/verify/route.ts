import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyDomain } from '@/lib/domains'

export async function POST(
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

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'دامنه یافت نشد' },
        { status: 404 }
      )
    }

    // Verify domain
    const isVerified = await verifyDomain(domain.domain, domain.verificationToken)

    if (isVerified) {
      await prisma.customDomain.update({
        where: { id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      })

      return NextResponse.json({
        verified: true,
        message: 'دامنه با موفقیت تأیید شد',
      })
    } else {
      return NextResponse.json(
        {
          verified: false,
          message: 'دامنه تأیید نشد. لطفاً DNS records را بررسی کنید.',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error verifying domain:', error)
    return NextResponse.json(
      { error: 'خطایی در تأیید دامنه رخ داد' },
      { status: 500 }
    )
  }
}

