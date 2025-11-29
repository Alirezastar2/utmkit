import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsersTable from '@/components/admin/UsersTable'

async function getUsers(searchParams: any) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const search = searchParams.search || ''
  const role = searchParams.role || ''
  const plan = searchParams.plan || ''

  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { name: { contains: search } },
    ]
  }

  if (role) {
    where.role = role
  }

  if (plan) {
    where.plan = plan
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            links: true,
            categories: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  // Get total clicks for each user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const totalClicks = await prisma.click.count({
        where: {
          link: {
            userId: user.id,
          },
        },
      })

      return {
        ...user,
        totalClicks,
      }
    })
  )

  return {
    users: usersWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; role?: string; plan?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  const data = await getUsers(searchParams)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مدیریت کاربران</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          مشاهده و مدیریت تمام کاربران سیستم
        </p>
      </div>

      <UsersTable
        initialUsers={data.users}
        initialPagination={data.pagination}
        initialFilters={{
          search: searchParams.search || '',
          role: searchParams.role || '',
          plan: searchParams.plan || '',
        }}
      />
    </div>
  )
}


