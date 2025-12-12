'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

interface DeleteUserDialogProps {
  user: {
    id: string
    email: string
    name: string | null
  }
}

export default function DeleteUserDialog({ user }: DeleteUserDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید کاربر "${user.name || user.email}" را حذف کنید؟\n\nاین عمل غیرقابل بازگشت است و تمام لینک‌ها و داده‌های کاربر نیز حذف خواهند شد.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'خطایی در حذف کاربر رخ داد')
      }

      alert('کاربر با موفقیت حذف شد')
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
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            حذف کاربر
          </DialogTitle>
          <DialogDescription>
            آیا مطمئن هستید که می‌خواهید کاربر <strong>{user.name || user.email}</strong> را حذف کنید؟
            <br />
            <br />
            این عمل غیرقابل بازگشت است و تمام لینک‌ها، کلیک‌ها و داده‌های مرتبط با این کاربر نیز حذف خواهند شد.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            انصراف
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حذف کاربر
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

