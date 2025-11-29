'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, X } from 'lucide-react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'

export default function BulkImport() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setSuccess('')
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('لطفاً یک فایل CSV انتخاب کنید')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const links = results.data
              .filter((row: any) => row.originalUrl || row.url)
              .map((row: any) => ({
                originalUrl: row.originalUrl || row.url,
                title: row.title || row.name || '',
                shortCode: row.shortCode || '',
                utmSource: row.utmSource || row.utm_source || '',
                utmMedium: row.utmMedium || row.utm_medium || '',
                utmCampaign: row.utmCampaign || row.utm_campaign || '',
                utmTerm: row.utmTerm || row.utm_term || '',
                utmContent: row.utmContent || row.utm_content || '',
                categoryId: row.categoryId || '',
              }))

            if (links.length === 0) {
              setError('هیچ لینک معتبری در فایل یافت نشد')
              return
            }

            const response = await fetch('/api/links/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ links }),
            })

            const data = await response.json()

            if (!response.ok) {
              setError(data.error || 'خطایی در import لینک‌ها رخ داد')
              return
            }

            setSuccess(`✅ ${data.message}`)
            setFile(null)
            router.refresh()
          } catch (err) {
            setError('خطایی در پردازش فایل رخ داد')
          } finally {
            setLoading(false)
          }
        },
        error: (error) => {
          setError(`خطا در خواندن فایل: ${error.message}`)
          setLoading(false)
        },
      })
    } catch (err) {
      setError('خطایی رخ داد')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import دسته‌ای لینک‌ها</CardTitle>
        <CardDescription>
          لینک‌های خود را از فایل CSV import کنید
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 text-sm text-green-700 dark:text-green-300">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="csvFile">فایل CSV</Label>
          <div className="flex items-center gap-3">
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="csvFile"
              className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 dark:hover:border-teal-400 cursor-pointer transition-colors"
            >
              {file ? (
                <>
                  <FileText className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">فایل CSV را انتخاب کنید</span>
                </>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            فرمت CSV باید شامل ستون‌های: originalUrl (یا url), title, utmSource, utmMedium, utmCampaign باشد
          </p>
        </div>

        <Button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? 'در حال import...' : 'Import لینک‌ها'}
        </Button>
      </CardContent>
    </Card>
  )
}

function Label({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </label>
  )
}

