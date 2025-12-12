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

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        // Send initial connection message
        const send = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        send({ type: 'connected', message: 'اتصال برقرار شد' })

        // Get initial stats
        const initialClicks = await prisma.click.count({
          where: { linkId: id },
        })

        send({
          type: 'stats',
          data: {
            totalClicks: initialClicks,
            timestamp: new Date().toISOString(),
          },
        })

        // Poll for new clicks every 2 seconds
        let lastClickCount = initialClicks
        const interval = setInterval(async () => {
          try {
            const currentClicks = await prisma.click.count({
              where: { linkId: id },
            })

            if (currentClicks > lastClickCount) {
              // Get recent clicks
              const recentClicks = await prisma.click.findMany({
                where: { linkId: id },
                orderBy: { createdAt: 'desc' },
                take: currentClicks - lastClickCount,
                select: {
                  id: true,
                  createdAt: true,
                  country: true,
                  city: true,
                  deviceType: true,
                  browser: true,
                },
              })

              send({
                type: 'new_clicks',
                data: {
                  count: currentClicks - lastClickCount,
                  clicks: recentClicks,
                  totalClicks: currentClicks,
                  timestamp: new Date().toISOString(),
                },
              })

              lastClickCount = currentClicks
            }

            // Send heartbeat every 30 seconds
            send({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            })
          } catch (error) {
            console.error('Error in realtime polling:', error)
            send({
              type: 'error',
              message: 'خطا در دریافت آمار',
            })
          }
        }, 2000)

        // Cleanup on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Error in realtime stream:', error)
    return NextResponse.json(
      { error: 'خطایی در اتصال real-time رخ داد' },
      { status: 500 }
    )
  }
}

