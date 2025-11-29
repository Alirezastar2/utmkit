import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface TopLinksListProps {
  links: Array<{
    id: string
    title: string | null
    shortCode: string
    _count: { clicks: number }
  }>
}

export default function TopLinksList({ links }: TopLinksListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-gray-200">لینک‌های پربازدید</CardTitle>
      </CardHeader>
      <CardContent>
        {links.length > 0 ? (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {link.title || 'بدون عنوان'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    /l/{link.shortCode}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{link._count.clicks}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">کلیک</div>
                  </div>
                  <Link href={`/links/${link.id}`}>
                    <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:text-gray-100">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-300">
            هنوز لینکی ایجاد نکرده‌اید
          </div>
        )}
      </CardContent>
    </Card>
  )
}

