'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react'

interface RevenueStatsProps {
  revenue: {
    total: number
    today: number
    week: number
    month: number
    successfulPayments: number
  }
}

export default function RevenueStats({ revenue }: RevenueStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover-lift border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">کل درآمد</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(revenue.total)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {revenue.successfulPayments.toLocaleString('fa-IR')} پرداخت موفق
          </p>
        </CardContent>
      </Card>

      <Card className="hover-lift border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">درآمد امروز</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(revenue.today)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            پرداخت‌های امروز
          </p>
        </CardContent>
      </Card>

      <Card className="hover-lift border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">درآمد هفته</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(revenue.week)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            پرداخت‌های هفته
          </p>
        </CardContent>
      </Card>

      <Card className="hover-lift border-l-4 border-l-pink-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">درآمد ماه</CardTitle>
          <BarChart3 className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(revenue.month)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            پرداخت‌های ماه
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

