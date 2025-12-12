'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DeviceStatsProps {
  data: Array<{
    deviceType: string
    count: number
  }>
}

const COLORS = ['#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b']

const deviceLabels: Record<string, string> = {
  MOBILE: 'موبایل',
  DESKTOP: 'دسکتاپ',
  TABLET: 'تبلت',
  UNKNOWN: 'نامشخص',
}

export default function DeviceStats({ data }: DeviceStatsProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        داده‌ای برای نمایش وجود ندارد
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: deviceLabels[item.deviceType] || item.deviceType,
    value: item.count,
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [
              `${value.toLocaleString('fa-IR')} (${((value / total) * 100).toFixed(1)}%)`,
              'کلیک',
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div
            key={item.deviceType}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {deviceLabels[item.deviceType] || item.deviceType}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {item.count.toLocaleString('fa-IR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

