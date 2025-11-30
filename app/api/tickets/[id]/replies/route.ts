import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all replies for a ticket
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check if user owns the ticket or is admin
    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const replies = await prisma.ticketReply.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(replies)
  } catch (error) {
    console.error('Error fetching replies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    )
  }
}

// Create a reply for a ticket
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check if user owns the ticket or is admin
    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isAdmin = session.user.role === 'ADMIN'

    // Create reply
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        message,
        isAdmin,
      },
    })

    // Update ticket status if admin replied
    if (isAdmin && ticket.status === 'OPEN') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      })
    }

    // If user replied, mark as open
    if (!isAdmin && ticket.status === 'RESOLVED') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'OPEN' },
      })
    }

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}





