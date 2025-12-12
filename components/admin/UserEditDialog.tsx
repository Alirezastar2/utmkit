'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit, Loader2 } from 'lucide-react'

interface UserEditDialogProps {
  user: {
    id: string
    email: string
    name: string | null
    role: string
    plan: string
    planExpiresAt: string | null
  }
}

export default function UserEditDialog({ user }: UserEditDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    role: user.role || 'USER',
    plan: user.plan || 'FREE',
    planExpiresAt: user.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '',
  })

  // Reset form data when dialog opens or user changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: user.name || '',
        email: user.email,
        role: user.role || 'USER',
        plan: user.plan || 'FREE',
        planExpiresAt: user.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '',
      })
    }
  }, [open, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planExpiresAt: formData.planExpiresAt || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'خطایی در به‌روزرسانی کاربر رخ داد')
      }

      alert('کاربر با موفقیت به‌روزرسانی شد')
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="ویرایش کاربر">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ویرایش کاربر</DialogTitle>
          <DialogDescription>
            اطلاعات کاربر را ویرایش کنید و تغییرات را ذخیره کنید.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">نام</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="نام کاربر"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">نقش</Label>
            <Select value={formData.role || 'USER'} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">کاربر</SelectItem>
                <SelectItem value="ADMIN">ادمین</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">پلن</Label>
            <Select value={formData.plan || 'FREE'} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">رایگان</SelectItem>
                <SelectItem value="BASIC">پایه</SelectItem>
                <SelectItem value="PRO">حرفه‌ای</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="planExpiresAt">تاریخ انقضای پلن (اختیاری)</Label>
            <Input
              id="planExpiresAt"
              type="date"
              value={formData.planExpiresAt}
              onChange={(e) => setFormData({ ...formData, planExpiresAt: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ذخیره تغییرات
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

