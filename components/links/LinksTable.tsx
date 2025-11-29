'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Copy, Check, Edit, Trash2, Download } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import LinksSearch from './LinksSearch'

interface LinksTableProps {
  links: Array<{
    id: string
    title: string | null
    originalUrl: string
    shortCode: string
    createdAt: Date
    expiresAt: Date | null
    isActive: boolean
    categoryId: string | null
    category: { id: string; name: string; color: string | null } | null
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    utmTerm?: string | null
    utmContent?: string | null
    _count: { clicks: number }
  }>
  categories: Array<{ id: string; name: string }>
}

export default function LinksTable({ links, categories }: LinksTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<{
    categoryId?: string
    isActive?: boolean
    hasExpired?: boolean
  }>({})

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          (link.title?.toLowerCase().includes(query)) ||
          link.originalUrl.toLowerCase().includes(query) ||
          link.shortCode.toLowerCase().includes(query) ||
          link.utmSource?.toLowerCase().includes(query) ||
          link.utmMedium?.toLowerCase().includes(query) ||
          link.utmCampaign?.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.categoryId && link.categoryId !== filters.categoryId) {
        return false
      }

      // Active filter
      if (filters.isActive !== undefined && link.isActive !== filters.isActive) {
        return false
      }

      // Expired filter
      if (filters.hasExpired !== undefined) {
        const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
        if (filters.hasExpired !== isExpired) return false
      }

      return true
    })
  }, [links, searchQuery, filters])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (links.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">هنوز لینکی ایجاد نکرده‌اید</p>
          <Link href="/links/new">
            <Button>ساخت اولین لینک</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <LinksSearch
        onSearch={setSearchQuery}
        onFilterChange={setFilters}
        categories={categories}
      />

      {filteredLinks.length === 0 && links.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">هیچ لینکی با فیلترهای انتخابی یافت نشد</p>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  عنوان
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  لینک اصلی
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  لینک کوتاه
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  تعداد کلیک
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  تاریخ ساخت
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
              {filteredLinks.map((link) => {
                const shortUrl = `${process.env.NEXTAUTH_URL || 'https://utmkit.ir'}/l/${link.shortCode}`
                return (
                  <tr key={link.id} className="hover:bg-gradient-to-r hover:from-teal-50/30 dark:hover:from-teal-900/20 hover:to-transparent transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {link.category && link.category.color && (
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: link.category.color }}
                            title={link.category.name}
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {link.title || 'بدون عنوان'}
                        </span>
                        {!link.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            غیرفعال
                          </span>
                        )}
                        {link.expiresAt && new Date(link.expiresAt) < new Date() && (
                          <span className="text-xs px-2 py-0.5 rounded bg-orange-200 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                            منقضی شده
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate max-w-xs block"
                      >
                        {link.originalUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded">
                          {shortUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(shortUrl, link.id)}
                        >
                          {copiedId === link.id ? (
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-gray-100">
                      {link._count.clicks}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(link.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/links/${link.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="ml-2 h-4 w-4" />
                            جزئیات
                          </Button>
                        </Link>
                        <Link href={`/links/${link.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

