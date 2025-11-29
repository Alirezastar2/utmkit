'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Loader2,
  User,
  Shield
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { toast } from 'sonner'

interface TicketReply {
  id: string
  message: string
  userId: string
  isAdmin: boolean
  createdAt: string
}

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
  }
  replies: TicketReply[]
}

interface TicketDetailProps {
  ticket: Ticket
  currentUserId: string
  isAdmin: boolean
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

export default function TicketDetail({ ticket: initialTicket, currentUserId, isAdmin }: TicketDetailProps) {
  const router = useRouter()
  const [ticket, setTicket] = useState(initialTicket)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(ticket.status)
  const [priority, setPriority] = useState(ticket.priority)

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`)
      if (!response.ok) throw new Error('خطا در دریافت تیکت')
      const data = await response.json()
      setTicket(data)
      setStatus(data.status)
      setPriority(data.priority)
    } catch (error: any) {
      toast.error(error.message || 'خطا در دریافت تیکت')
    }
  }

  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error('لطفاً پیام خود را وارد کنید')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: reply }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'خطا در ارسال پاسخ')
      }

      setReply('')
      toast.success('پاسخ با موفقیت ارسال شد')
      fetchTicket()
    } catch (error: any) {
      toast.error(error.message || 'خطا در ارسال پاسخ')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!isAdmin) return

    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'خطا در به‌روزرسانی وضعیت')
      }

      setStatus(newStatus)
      toast.success('وضعیت به‌روزرسانی شد')
      fetchTicket()
    } catch (error: any) {
      toast.error(error.message || 'خطا در به‌روزرسانی وضعیت')
    } finally {
      setLoading(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    if (!isAdmin) return

    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'خطا در به‌روزرسانی اولویت')
      }

      setPriority(newPriority)
      toast.success('اولویت به‌روزرسانی شد')
      fetchTicket()
    } catch (error: any) {
      toast.error(error.message || 'خطا در به‌روزرسانی اولویت')
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.OPEN
  const priorityInfo = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{ticket.subject}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            تیکت #{ticket.id.slice(-8)}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/tickets')}>
          بازگشت به لیست
        </Button>
      </div>

      {/* Ticket Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>اطلاعات تیکت</CardTitle>
            <div className="flex gap-2">
              <Badge className={statusInfo.color}>
                <statusInfo.icon className="h-3 w-3 ml-1" />
                {statusInfo.label}
              </Badge>
              <Badge variant="outline" className={priorityInfo.color}>
                {priorityInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">کاربر:</p>
            <p className="font-medium">{ticket.user.name || ticket.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">توضیحات:</p>
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{ticket.description}</p>
          </div>
          {ticket.category && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">دسته‌بندی:</p>
              <p className="capitalize">{ticket.category}</p>
            </div>
          )}
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              ایجاد شده: {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
                locale: faIR,
              })}
            </span>
            <span>
              به‌روزرسانی شده: {formatDistanceToNow(new Date(ticket.updatedAt), {
                addSuffix: true,
                locale: faIR,
              })}
            </span>
          </div>
          {isAdmin && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">وضعیت</label>
                <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">باز</SelectItem>
                    <SelectItem value="IN_PROGRESS">در حال بررسی</SelectItem>
                    <SelectItem value="RESOLVED">حل شده</SelectItem>
                    <SelectItem value="CLOSED">بسته</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">اولویت</label>
                <Select value={priority} onValueChange={handlePriorityChange} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">پایین</SelectItem>
                    <SelectItem value="MEDIUM">متوسط</SelectItem>
                    <SelectItem value="HIGH">بالا</SelectItem>
                    <SelectItem value="URGENT">فوری</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replies */}
      <Card>
        <CardHeader>
          <CardTitle>پاسخ‌ها ({ticket.replies.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.replies.map((reply) => (
            <div
              key={reply.id}
              className={`p-4 rounded-lg border ${
                reply.isAdmin
                  ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800'
                  : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {reply.isAdmin ? (
                    <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {reply.isAdmin ? 'پشتیبانی' : ticket.user.name || ticket.user.email}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(reply.createdAt), {
                    addSuffix: true,
                    locale: faIR,
                  })}
                </span>
              </div>
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{reply.message}</p>
            </div>
          ))}

          {/* Reply Form */}
          <div className="pt-4 border-t">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
              rows={4}
              className="mb-4"
            />
            <Button
              onClick={handleReply}
              disabled={loading || !reply.trim()}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                <>
                  ارسال پاسخ
                  <ArrowRight className="h-4 w-4 mr-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




