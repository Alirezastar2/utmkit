'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ExternalLink, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  plan: string
  planExpiresAt: string | null
  createdAt: string
  _count: {
    links: number
    categories: number
  }
  totalClicks: number
}

interface UsersTableProps {
  initialUsers: User[]
  initialPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  initialFilters: {
    search: string
    role: string
    plan: string
  }
}

export default function UsersTable({
  initialUsers,
  initialPagination,
  initialFilters,
}: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialFilters.search)
  const [role, setRole] = useState(initialFilters.role)
  const [plan, setPlan] = useState(initialFilters.plan)
  const [users] = useState(initialUsers)
  const [pagination] = useState(initialPagination)

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    if (plan) params.set('plan', plan)
    params.set('page', '1')
    router.push(`/admin/users?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return <Badge className="bg-purple-500 text-white">ادمین</Badge>
    }
    return <Badge variant="outline">کاربر</Badge>
  }

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: 'bg-gray-500',
      BASIC: 'bg-blue-500',
      PRO: 'bg-teal-500',
    }
    const labels: Record<string, string> = {
      FREE: 'رایگان',
      BASIC: 'پایه',
      PRO: 'حرفه‌ای',
    }
    return (
      <Badge className={`${colors[plan] || 'bg-gray-500'} text-white`}>
        {labels[plan] || plan}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="جستجو (ایمیل یا نام)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                className="pr-10"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="نقش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه نقش‌ها</SelectItem>
                <SelectItem value="USER">کاربر</SelectItem>
                <SelectItem value="ADMIN">ادمین</SelectItem>
              </SelectContent>
            </Select>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger>
                <SelectValue placeholder="پلن" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه پلن‌ها</SelectItem>
                <SelectItem value="FREE">رایگان</SelectItem>
                <SelectItem value="BASIC">پایه</SelectItem>
                <SelectItem value="PRO">حرفه‌ای</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleFilter} className="w-full">
              اعمال فیلتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    کاربر
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    نقش
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    پلن
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    لینک‌ها
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    کلیک‌ها
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    تاریخ ثبت‌نام
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gradient-to-r hover:from-teal-50/30 dark:hover:from-teal-900/20 hover:to-transparent transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {user.name || 'بدون نام'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">{getPlanBadge(user.plan)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {user._count.links.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {user.totalClicks.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            نمایش {((pagination.page - 1) * pagination.limit + 1).toLocaleString('fa-IR')} تا{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total).toLocaleString('fa-IR')}{' '}
            از {pagination.total.toLocaleString('fa-IR')} کاربر
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronRight className="h-4 w-4" />
              قبلی
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              صفحه {pagination.page.toLocaleString('fa-IR')} از{' '}
              {pagination.totalPages.toLocaleString('fa-IR')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              بعدی
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}





