'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/components/theme/ThemeProvider'
import { useEffect, useState } from 'react'

interface ClicksChartProps {
  clicksData: { createdAt: Date }[]
}

export default function ClicksChart({ clicksData }: ClicksChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Group clicks by date
  const clicksByDate = clicksData.reduce((acc, click) => {
    const date = new Date(click.createdAt).toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
    })
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(clicksByDate)
    .map(([date, count]) => ({ date, count }))
    .slice(-30) // Last 30 days

  const isDark = mounted && theme === 'dark'
  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const textColor = isDark ? '#d1d5db' : '#6b7280'
  const lineColor = isDark ? '#2dd4bf' : '#0d9488'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-gray-200">روند کلیک‌ها (۳۰ روز گذشته)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                stroke={textColor}
                tick={{ fill: textColor }}
              />
              <YAxis 
                stroke={textColor}
                tick={{ fill: textColor }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDark ? '#d1d5db' : '#374151',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={lineColor}
                strokeWidth={2}
                dot={{ fill: lineColor, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-300">
            داده‌ای برای نمایش وجود ندارد
          </div>
        )}
      </CardContent>
    </Card>
  )
}

