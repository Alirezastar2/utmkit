'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface LinkDetailStatsProps {
  linkId: string
}

interface StatsData {
  totalClicks: number
  deviceStats: Record<string, number>
  refererStats: Record<string, number>
  clicksByDate: Record<string, number>
  chartData: Array<{ date: string; count: number }>
  recentClicks: Array<{
    id: string
    createdAt: string
    deviceType: string
    referer: string | null
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function LinkDetailStats({ linkId }: LinkDetailStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/links/${linkId}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [linkId])

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>
  }

  if (!stats) {
    return <div className="text-center py-8">خطا در دریافت آمار</div>
  }

  const deviceData = Object.entries(stats.deviceStats).map(([name, value]) => ({
    name: name === 'MOBILE' ? 'موبایل' : name === 'DESKTOP' ? 'دسکتاپ' : name === 'TABLET' ? 'تبلت' : 'نامشخص',
    value,
  }))

  const refererData = Object.entries(stats.refererStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>آمار کلیک‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {stats.totalClicks}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">مجموع کلیک‌ها</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>روند کلیک‌ها (۳۰ روز گذشته)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(173, 80%, 40%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
                داده‌ای برای نمایش وجود ندارد
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزیع بر اساس دستگاه</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
                داده‌ای برای نمایش وجود ندارد
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>توزیع بر اساس مرجع (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {refererData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={refererData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(173, 80%, 40%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
                داده‌ای برای نمایش وجود ندارد
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>کلیک‌های اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentClicks.length > 0 ? (
              <div className="space-y-2">
                {stats.recentClicks.map((click) => (
                  <div
                    key={click.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date(click.createdAt).toLocaleString('fa-IR')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {click.deviceType === 'MOBILE'
                          ? 'موبایل'
                          : click.deviceType === 'DESKTOP'
                          ? 'دسکتاپ'
                          : click.deviceType === 'TABLET'
                          ? 'تبلت'
                          : 'نامشخص'}
                        {click.referer && ` • ${new URL(click.referer).hostname}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                کلیکی ثبت نشده است
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

