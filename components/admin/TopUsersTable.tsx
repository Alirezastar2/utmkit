'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface TopUsersTableProps {
  users: Array<{
    id: string
    email: string
    name: string | null
    _count: { links: number }
    totalClicks: number
  }>
}

export default function TopUsersTable({ users }: TopUsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        هنوز کاربری وجود ندارد
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {users.slice(0, 5).map((user, index) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user._count.links} لینک • {user.totalClicks.toLocaleString('fa-IR')} کلیک
              </p>
            </div>
          </div>
          <Link href={`/admin/users/${user.id}`}>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}






