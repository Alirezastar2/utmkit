'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, Check } from 'lucide-react'

interface LinkFormProps {
  link?: {
    id: string
    originalUrl: string
    title: string | null
    description: string | null
    shortCode: string
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    utmTerm: string | null
    utmContent: string | null
    password: string | null
    expiresAt: Date | null
    isActive: boolean
    categoryId: string | null
  }
}

export default function LinkForm({ link }: LinkFormProps = {}) {
  const router = useRouter()
  const isEditMode = !!link
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successDialog, setSuccessDialog] = useState(false)
  const [createdLink, setCreatedLink] = useState<{
    shortUrl: string
    originalUrl: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    originalUrl: link?.originalUrl || '',
    title: link?.title || '',
    description: link?.description || '',
    shortCode: link?.shortCode || '',
    utmSource: link?.utmSource || '',
    utmMedium: link?.utmMedium || '',
    utmCampaign: link?.utmCampaign || '',
    utmTerm: link?.utmTerm || '',
    utmContent: link?.utmContent || '',
    password: '',
    expiresAt: link?.expiresAt ? new Date(link.expiresAt).toISOString().split('T')[0] : '',
    isActive: link?.isActive ?? true,
    categoryId: link?.categoryId || '',
  })

  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null }>>([])

  useEffect(() => {
    // Load categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(console.error)

    // Load templates
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTemplates(data)
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEditMode ? `/api/links/${link.id}` : '/api/links'
      const method = isEditMode ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
          password: formData.password || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || `خطایی در ${isEditMode ? 'ویرایش' : 'ایجاد'} لینک رخ داد`)
        return
      }

      if (isEditMode) {
        router.push('/links')
        router.refresh()
      } else {
        const shortUrl = `${window.location.origin}/l/${data.shortCode}`
        setCreatedLink({
          shortUrl,
          originalUrl: data.originalUrl,
        })
        setSuccessDialog(true)
        
        // Reset form
        setFormData({
          originalUrl: '',
          title: '',
          description: '',
          shortCode: '',
          utmSource: '',
          utmMedium: '',
          utmCampaign: '',
          utmTerm: '',
          utmContent: '',
          password: '',
          expiresAt: '',
          isActive: true,
          categoryId: '',
        })
      }

      // Refresh links list
      router.refresh()
    } catch (err) {
      setError('خطایی رخ داد. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink.shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'ویرایش لینک' : 'اطلاعات لینک'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'اطلاعات لینک را ویرایش کنید' : 'لینک اصلی و پارامترهای UTM را وارد کنید'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="originalUrl">
                لینک اصلی <span className="text-red-500">*</span>
              </Label>
              <Input
                id="originalUrl"
                type="url"
                placeholder="https://example.com/page"
                value={formData.originalUrl}
                onChange={(e) =>
                  setFormData({ ...formData, originalUrl: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">عنوان (اختیاری)</Label>
              <Input
                id="title"
                type="text"
                placeholder="مثال: لینک کمپین تابستانه"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات (اختیاری)</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 dark:focus-visible:ring-teal-400/20 focus-visible:border-teal-500 dark:focus-visible:border-teal-400 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="توضیحات اضافی درباره این لینک..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="shortCode">کد کوتاه سفارشی (اختیاری)</Label>
                <Input
                  id="shortCode"
                  type="text"
                  placeholder="در صورت خالی بودن، به صورت خودکار تولید می‌شود"
                  value={formData.shortCode}
                  onChange={(e) =>
                    setFormData({ ...formData, shortCode: e.target.value })
                  }
                  disabled={loading}
                  pattern="[a-zA-Z0-9]+"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  فقط حروف انگلیسی و اعداد مجاز است
                </p>
              </div>
            )}

            {templates.length > 0 && !isEditMode && (
              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">Templateهای ذخیره شده</h3>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <Button
                      key={template.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          utmSource: template.utmSource || '',
                          utmMedium: template.utmMedium || '',
                          utmCampaign: template.utmCampaign || '',
                        })
                      }}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">پارامترهای UTM</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="utmSource">utm_source</Label>
                  <Input
                    id="utmSource"
                    type="text"
                    placeholder="مثال: instagram, whatsapp"
                    value={formData.utmSource}
                    onChange={(e) =>
                      setFormData({ ...formData, utmSource: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utmMedium">utm_medium</Label>
                  <Input
                    id="utmMedium"
                    type="text"
                    placeholder="مثال: story, post, message"
                    value={formData.utmMedium}
                    onChange={(e) =>
                      setFormData({ ...formData, utmMedium: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utmCampaign">utm_campaign</Label>
                  <Input
                    id="utmCampaign"
                    type="text"
                    placeholder="مثال: summer-sale-2024"
                    value={formData.utmCampaign}
                    onChange={(e) =>
                      setFormData({ ...formData, utmCampaign: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utmTerm">utm_term (اختیاری)</Label>
                  <Input
                    id="utmTerm"
                    type="text"
                    value={formData.utmTerm}
                    onChange={(e) =>
                      setFormData({ ...formData, utmTerm: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="utmContent">utm_content (اختیاری)</Label>
                  <Input
                    id="utmContent"
                    type="text"
                    placeholder="مثال: banner-top, cta-button"
                    value={formData.utmContent}
                    onChange={(e) =>
                      setFormData({ ...formData, utmContent: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">تنظیمات پیشرفته</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور (اختیاری)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="برای محافظت از لینک، رمز عبور وارد کنید"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    کاربران برای باز کردن لینک باید رمز عبور را وارد کنند
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">تاریخ انقضا (اختیاری)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500">
                    لینک پس از این تاریخ غیرفعال می‌شود
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-teal-600 dark:text-teal-400 focus:ring-teal-500 dark:focus:ring-teal-400"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    لینک فعال است
                  </Label>
                </div>
              </div>
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="categoryId">دسته‌بندی (اختیاری)</Label>
                <select
                  id="categoryId"
                  className="flex h-11 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 dark:focus-visible:ring-teal-400/20 focus-visible:border-teal-500 dark:focus-visible:border-teal-400 transition-all"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  disabled={loading}
                >
                  <option value="">بدون دسته‌بندی</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? (isEditMode ? 'در حال ذخیره...' : 'در حال ساخت...') 
                : (isEditMode ? 'ذخیره تغییرات' : 'ساخت لینک')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>لینک با موفقیت ایجاد شد!</DialogTitle>
            <DialogDescription>
              لینک کوتاه شما آماده استفاده است
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>لینک کوتاه:</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 text-sm">
                  {createdLink?.shortUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>لینک اصلی:</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                {createdLink?.originalUrl}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSuccessDialog(false)}
              >
                بستن
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setSuccessDialog(false)
                  router.push('/links')
                }}
              >
                مشاهده لینک‌ها
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

