import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TicketDetail from '@/components/tickets/TicketDetail'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const { id } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      replies: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!ticket) {
    redirect('/tickets')
  }

  // Check if user owns the ticket or is admin
  if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/tickets')
  }

  // Transform ticket data to match component interface
  const transformedTicket = {
    ...ticket,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    replies: ticket.replies.map((reply) => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
    })),
  }

  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <TicketDetail ticket={transformedTicket} currentUserId={session.user.id} isAdmin={session.user.role === 'ADMIN'} />
    </Suspense>
  )
}




