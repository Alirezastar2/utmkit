'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface RecentUsersListProps {
  users: Array<{
    id: string
    email: string
    name: string | null
    createdAt: string
  }>
}

export default function RecentUsersList({ users }: RecentUsersListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        کاربر جدیدی در 7 روز گذشته ثبت‌نام نکرده است
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email} • {new Date(user.createdAt).toLocaleDateString('fa-IR')}
            </p>
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





