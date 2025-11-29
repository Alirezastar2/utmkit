'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NewTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM',
    category: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'خطا در ایجاد تیکت')
      }

      const ticket = await response.json()
      toast.success('تیکت با موفقیت ایجاد شد')
      router.push(`/tickets/${ticket.id}`)
    } catch (error: any) {
      toast.error(error.message || 'خطا در ایجاد تیکت')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ایجاد تیکت جدید</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          تیکت جدید خود را ایجاد کنید و با تیم پشتیبانی در ارتباط باشید
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات تیکت</CardTitle>
          <CardDescription>
            لطفاً اطلاعات تیکت خود را با دقت وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">موضوع *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="مثال: مشکل در ساخت لینک"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">دسته‌بندی</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">مشکل فنی</SelectItem>
                  <SelectItem value="billing">صورتحساب و پرداخت</SelectItem>
                  <SelectItem value="feature">درخواست ویژگی جدید</SelectItem>
                  <SelectItem value="other">سایر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">اولویت</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
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

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="لطفاً مشکل یا سوال خود را به طور کامل شرح دهید..."
                rows={8}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    در حال ایجاد...
                  </>
                ) : (
                  <>
                    ایجاد تیکت
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                انصراف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}




