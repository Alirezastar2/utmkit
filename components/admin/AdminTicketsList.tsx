'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  User,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  category: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    plan: string
  }
  _count: {
    replies: number
  }
}

const statusConfig = {
  OPEN: { label: 'باز', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: MessageSquare },
  IN_PROGRESS: { label: 'در حال بررسی', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
  RESOLVED: { label: 'حل شده', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  CLOSED: { label: 'بسته', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300', icon: XCircle },
}

const priorityConfig = {
  LOW: { label: 'پایین', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
  MEDIUM: { label: 'متوسط', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  HIGH: { label: 'بالا', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  URGENT: { label: 'فوری', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function AdminTicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.category) params.append('category', filters.category)
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/admin/tickets?${params.toString()}`)
      if (!response.ok) throw new Error('خطا در دریافت تیکت‌ها')
      
      const data = await response.json()
      setTickets(data.tickets)
      setTotalPages(data.pagination.totalPages)
    } catch (error: any) {
      toast.error(error.message || 'خطا در دریافت تیکت‌ها')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [filters.status, filters.priority, filters.category, page])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  const filteredTickets = tickets.filter(ticket => {
    if (!filters.search) return true
    const search = filters.search.toLowerCase()
    return (
      ticket.subject.toLowerCase().includes(search) ||
      ticket.description.toLowerCase().includes(search) ||
      ticket.user.email.toLowerCase().includes(search) ||
      (ticket.user.name && ticket.user.name.toLowerCase().includes(search))
    )
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="جستجو در تیکت‌ها..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pr-10"
                />
              </div>
            </div>
            <div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="همه وضعیت‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="OPEN">باز</SelectItem>
                  <SelectItem value="IN_PROGRESS">در حال بررسی</SelectItem>
                  <SelectItem value="RESOLVED">حل شده</SelectItem>
                  <SelectItem value="CLOSED">بسته</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters({ ...filters, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="همه اولویت‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه اولویت‌ها</SelectItem>
                  <SelectItem value="LOW">پایین</SelectItem>
                  <SelectItem value="MEDIUM">متوسط</SelectItem>
                  <SelectItem value="HIGH">بالا</SelectItem>
                  <SelectItem value="URGENT">فوری</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">تیکتی یافت نشد</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const StatusIcon = statusConfig[ticket.status as keyof typeof statusConfig]?.icon || MessageSquare
            const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.OPEN
            const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM

            return (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {ticket.subject}
                          </h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 ml-1" />
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="outline" className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{ticket.user.name || ticket.user.email}</span>
                            <Badge variant="outline" className="mr-2 text-xs">
                              {ticket.user.plan}
                            </Badge>
                          </div>
                          <span>
                            {formatDistanceToNow(new Date(ticket.createdAt), {
                              addSuffix: true,
                              locale: faIR,
                            })}
                          </span>
                          {ticket._count.replies > 0 && (
                            <span>{ticket._count.replies} پاسخ</span>
                          )}
                          {ticket.category && (
                            <span className="capitalize">{ticket.category}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            قبلی
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            صفحه {page} از {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            بعدی
          </Button>
        </div>
      )}
    </div>
  )
}




