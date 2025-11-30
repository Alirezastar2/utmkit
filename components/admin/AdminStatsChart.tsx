'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AdminStatsChartProps {
  data: Array<{ date: string; count: number }>
}

export default function AdminStatsChart({ data }: AdminStatsChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
    کلیک: item.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="کلیک"
          stroke="hsl(173, 80%, 40%)"
          strokeWidth={2}
          dot={{ fill: 'hsl(173, 80%, 40%)', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}






