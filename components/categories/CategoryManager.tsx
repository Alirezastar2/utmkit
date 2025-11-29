'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Palette } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Category {
  id: string
  name: string
  color: string
  _count: { links: number }
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3b82f6' })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleCreate = async () => {
    if (!newCategory.name.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })

      if (response.ok) {
        await loadCategories()
        setNewCategory({ name: '', color: '#3b82f6' })
        setDialogOpen(false)
      }
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>دسته‌بندی‌ها</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            سازمان‌دهی لینک‌های خود با دسته‌بندی
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              دسته جدید
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ایجاد دسته‌بندی جدید</DialogTitle>
              <DialogDescription>
                یک دسته‌بندی جدید برای سازمان‌دهی لینک‌های خود ایجاد کنید
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">نام دسته‌بندی</Label>
                <Input
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="مثال: اینستاگرام"
                />
              </div>
              <div className="space-y-2">
                <Label>رنگ</Label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-10 w-10 rounded-lg border-2 transition-all ${
                        newCategory.color === color
                          ? 'border-gray-900 dark:border-gray-100 scale-110'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} disabled={loading} className="w-full">
                {loading ? 'در حال ایجاد...' : 'ایجاد'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            هنوز دسته‌بندی ایجاد نکرده‌اید
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{category.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {category._count.links} لینک
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

