import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [
    totalPayments,
    successfulPayments,
    failedPayments,
    pendingPayments,
    recentPayments,
  ] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({
      where: {
        status: { in: ['SUCCESS', 'VERIFIED'] },
      },
    }),
    prisma.payment.count({
      where: {
        status: 'FAILED',
      },
    }),
    prisma.payment.count({
      where: {
        status: 'PENDING',
      },
    }),
    prisma.payment.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
  ])

  const totalRevenue = await prisma.payment.aggregate({
    where: {
      status: { in: ['SUCCESS', 'VERIFIED'] },
    },
    _sum: {
      amount: true,
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مدیریت پرداخت‌ها</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          مشاهده و مدیریت تمام پرداخت‌های سیستم
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل پرداخت‌ها</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalPayments.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پرداخت‌های موفق</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {successfulPayments.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پرداخت‌های ناموفق</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {failedPayments.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">در انتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {pendingPayments.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>کل درآمد</CardTitle>
          <CardDescription>مجموع پرداخت‌های موفق</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(totalRevenue._sum.amount || 0)}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>پرداخت‌های اخیر</CardTitle>
          <CardDescription>آخرین 10 پرداخت انجام شده</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                پرداختی وجود ندارد
              </div>
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {payment.user.name || payment.user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payment.plan} - {new Date(payment.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p
                      className={`text-xs ${
                        payment.status === 'SUCCESS' || payment.status === 'VERIFIED'
                          ? 'text-green-600 dark:text-green-400'
                          : payment.status === 'FAILED'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {payment.status === 'SUCCESS' || payment.status === 'VERIFIED'
                        ? 'موفق'
                        : payment.status === 'FAILED'
                        ? 'ناموفق'
                        : 'در انتظار'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

