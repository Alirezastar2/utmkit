import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, MousePointerClick } from 'lucide-react'

interface StatsCardsProps {
  totalLinks: number
  totalClicks: number
}

export default function StatsCards({ totalLinks, totalClicks }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="hover-lift bg-gradient-to-br from-white to-teal-50/30 dark:from-gray-800 dark:to-teal-900/20 border-teal-200/50 dark:border-teal-700/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">تعداد لینک‌ها</CardTitle>
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/30">
            <Link2 className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
            {totalLinks}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            لینک‌های فعال شما
          </p>
        </CardContent>
      </Card>
      <Card className="hover-lift bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-700/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">تعداد کلیک‌ها</CardTitle>
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md shadow-purple-500/30">
            <MousePointerClick className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            {totalClicks}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            مجموع کلیک‌های ثبت شده
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

