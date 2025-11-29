'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface LinksSearchProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: {
    categoryId?: string
    isActive?: boolean
    hasExpired?: boolean
  }) => void
  categories: Array<{ id: string; name: string }>
}

export default function LinksSearch({ onSearch, onFilterChange, categories }: LinksSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    categoryId: '',
    isActive: undefined as boolean | undefined,
    hasExpired: undefined as boolean | undefined,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      categoryId: '',
      isActive: undefined,
      hasExpired: undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          type="text"
          placeholder="جستجو در عنوان، URL یا UTM..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        {categories.length > 0 && (
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs mb-2 block">دسته‌بندی</Label>
            <select
              className="flex h-10 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 dark:focus-visible:ring-teal-400/20 focus-visible:border-teal-500 dark:focus-visible:border-teal-400"
              value={filters.categoryId}
              onChange={(e) =>
                setFilters({ ...filters, categoryId: e.target.value })
              }
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs mb-2 block">وضعیت</Label>
          <select
            className="flex h-10 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 dark:focus-visible:ring-teal-400/20 focus-visible:border-teal-500 dark:focus-visible:border-teal-400"
            value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
            onChange={(e) =>
              setFilters({
                ...filters,
                isActive: e.target.value === '' ? undefined : e.target.value === 'active',
              })
            }
          >
            <option value="">همه</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>

        {(searchQuery || filters.categoryId || filters.isActive !== undefined) && (
          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters}>
              <X className="ml-2 h-4 w-4" />
              پاک کردن فیلترها
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

