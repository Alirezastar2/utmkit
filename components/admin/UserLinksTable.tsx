'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface UserLinksTableProps {
  links: Array<{
    id: string
    title: string | null
    originalUrl: string
    shortCode: string
    createdAt: string
    _count: { clicks: number }
    category: { name: string } | null
  }>
}

export default function UserLinksTable({ links }: UserLinksTableProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        این کاربر هنوز لینکی ایجاد نکرده است
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200/60 dark:border-gray-700/60">
          <tr>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
              عنوان
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
              لینک کوتاه
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
              کلیک‌ها
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
              تاریخ ساخت
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
          {links.map((link) => (
            <tr
              key={link.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {link.title || 'بدون عنوان'}
                  </p>
                  {link.category && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {link.category.name}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  /l/{link.shortCode}
                </code>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {link._count.clicks.toLocaleString('fa-IR')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {new Date(link.createdAt).toLocaleDateString('fa-IR')}
              </td>
              <td className="px-4 py-3">
                <Link href={`/links/${link.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}






