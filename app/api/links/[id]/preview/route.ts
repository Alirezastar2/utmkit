import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    })

    if (!link) {
      return NextResponse.json(
        { error: 'لینک یافت نشد' },
        { status: 404 }
      )
    }

    // Fetch Open Graph metadata from the original URL
    try {
      const response = await fetch(link.originalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UTMKit/1.0; +https://utmkit.ir)',
        },
        redirect: 'follow',
      })

      const html = await response.text()
      
      // Extract Open Graph tags
      const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1] ||
                     html.match(/<title>([^<]+)<\/title>/i)?.[1] ||
                     link.title ||
                     null

      const ogDescription = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] ||
                          html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] ||
                          link.description ||
                          null

      const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ||
                  html.match(/<meta\s+property=["']og:image:url["']\s+content=["']([^"']+)["']/i)?.[1] ||
                  null

      const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)?.[1] ||
                  link.originalUrl ||
                  null

      return NextResponse.json({
        title: ogTitle,
        description: ogDescription,
        image: ogImage,
        url: ogUrl,
        originalUrl: link.originalUrl,
      })
    } catch (error) {
      // If fetching fails, return basic info
      return NextResponse.json({
        title: link.title,
        description: link.description,
        image: null,
        url: link.originalUrl,
        originalUrl: link.originalUrl,
        error: 'امکان دریافت metadata وجود ندارد',
      })
    }
  } catch (error) {
    console.error('Error fetching preview:', error)
    return NextResponse.json(
      { error: 'خطایی در دریافت preview رخ داد' },
      { status: 500 }
    )
  }
}

