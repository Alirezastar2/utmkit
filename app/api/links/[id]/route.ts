import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { triggerWebhooks } from '@/lib/webhooks'

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

    const link = await prisma.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'لینک یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(link)
  } catch (error) {
    console.error('Error fetching link:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت لینک رخ داد' },
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

    const link = await prisma.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'لینک یافت نشد' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { title, description, originalUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, expiresAt, isActive, categoryId, maxClicks } = body

    const updatedLink = await prisma.link.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(originalUrl !== undefined && { originalUrl }),
        ...(utmSource !== undefined && { utmSource }),
        ...(utmMedium !== undefined && { utmMedium }),
        ...(utmCampaign !== undefined && { utmCampaign }),
        ...(utmTerm !== undefined && { utmTerm }),
        ...(utmContent !== undefined && { utmContent }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(maxClicks !== undefined && { maxClicks: maxClicks ? parseInt(maxClicks) : null }),
      },
    })

    // Trigger webhook for link_updated event
    triggerWebhooks(session.user.id, 'link_updated', {
      linkId: updatedLink.id,
      shortCode: updatedLink.shortCode,
      timestamp: updatedLink.updatedAt.toISOString(),
    })

    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json(
      { error: 'خطایی در به‌روزرسانی لینک رخ داد' },
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

    const link = await prisma.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'لینک یافت نشد' },
        { status: 404 }
      )
    }

    // Get link data before deletion for webhook
    const linkData = {
      id: link.id,
      shortCode: link.shortCode,
    }

    await prisma.link.delete({
      where: { id },
    })

    // Trigger webhook for link_deleted event
    triggerWebhooks(session.user.id, 'link_deleted', {
      linkId: linkData.id,
      shortCode: linkData.shortCode,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ message: 'لینک با موفقیت حذف شد' })
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { error: 'خطایی در حذف لینک رخ داد' },
      { status: 500 }
    )
  }
}

