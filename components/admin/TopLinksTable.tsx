'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink, TrendingUp } from 'lucide-react'

interface TopLinksTableProps {
  links: Array<{
    id: string
    shortCode: string
    originalUrl: string
    title: string | null
    createdAt: string
    clicks: number
  }>
}

export default function TopLinksTable({ links }: TopLinksTableProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        هنوز لینکی وجود ندارد
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {links.slice(0, 5).map((link, index) => (
        <div
          key={link.id}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-sm font-bold flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {link.title || link.originalUrl}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {link.shortCode}
                </p>
                <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">{link.clicks.toLocaleString('fa-IR')}</span>
                </div>
              </div>
            </div>
          </div>
          <Link href={`/links/${link.id}`} target="_blank">
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}

