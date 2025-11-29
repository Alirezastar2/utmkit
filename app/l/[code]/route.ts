import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildFinalUrl, parseUserAgent } from '@/lib/utils'
import { headers } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    // Find link by short code
    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    })

    if (!link) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if link is active
    if (!link.isActive) {
      return NextResponse.redirect(new URL('/link-expired', request.url))
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.redirect(new URL('/link-expired', request.url))
    }

    // Check password protection
    if (link.password) {
      const url = new URL(request.url)
      const providedPassword = url.searchParams.get('p')
      
      if (providedPassword !== link.password) {
        // Show password form
        return new NextResponse(
          `<!DOCTYPE html>
          <html dir="rtl" lang="fa">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>لینک محافظت شده</title>
            <style>
              body { font-family: system-ui; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
              .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-width: 400px; width: 100%; }
              h1 { text-align: center; color: #333; margin-bottom: 1.5rem; }
              input { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 1rem; }
              button { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; }
              button:hover { opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔒 لینک محافظت شده</h1>
              <p style="text-align: center; color: #666; margin-bottom: 1.5rem;">این لینک با رمز عبور محافظت شده است</p>
              <form method="GET">
                <input type="password" name="p" placeholder="رمز عبور را وارد کنید" required autofocus>
                <button type="submit">ادامه</button>
              </form>
            </div>
          </body>
          </html>`,
          {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }
        )
      }
    }

    // Get request headers for logging
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || null
    const referer = headersList.get('referer') || null
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'

    // Parse user agent
    const { deviceType, os, browser } = parseUserAgent(userAgent)

    // Log the click
    await prisma.click.create({
      data: {
        linkId: link.id,
        ip: ip.split(',')[0].trim(), // Get first IP if multiple
        userAgent,
        referer,
        deviceType,
        os,
        browser,
      },
    })

    // Build final URL with UTM parameters
    const finalUrl = buildFinalUrl(link.originalUrl, {
      utmSource: link.utmSource,
      utmMedium: link.utmMedium,
      utmCampaign: link.utmCampaign,
      utmTerm: link.utmTerm,
      utmContent: link.utmContent,
    })

    // Redirect to final URL
    return NextResponse.redirect(finalUrl)
  } catch (error) {
    console.error('Error in redirect handler:', error)
    // On error, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }
}

