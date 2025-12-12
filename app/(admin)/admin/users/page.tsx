import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
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
        planExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
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
  // از any استفاده می‌کنیم تا با تغییرات تایپ PageProps در نسخه‌های جدید Next سازگار بماند
  searchParams: any
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

  // Get total stats
  const [totalUsers, totalAdmins, totalFreeUsers, totalBasicUsers, totalProUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { plan: 'FREE' } }),
    prisma.user.count({ where: { plan: 'BASIC' } }),
    prisma.user.count({ where: { plan: 'PRO' } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مدیریت کاربران</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          مشاهده و مدیریت تمام کاربران سیستم
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل کاربران</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalUsers.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ادمین‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalAdmins.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رایگان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalFreeUsers.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پایه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalBasicUsers.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حرفه‌ای</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalProUsers.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div className="text-center py-12">در حال بارگذاری...</div>}>
        <UsersTable
          initialUsers={data.users}
          initialPagination={data.pagination}
          initialFilters={{
            search: searchParams.search || '',
            role: searchParams.role || 'all',
            plan: searchParams.plan || 'all',
          }}
        />
      </Suspense>
    </div>
  )
}


