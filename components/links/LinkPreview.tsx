'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Image as ImageIcon } from 'lucide-react'

interface LinkPreviewProps {
  linkId: string
}

interface PreviewData {
  title: string | null
  description: string | null
  image: string | null
  url: string | null
  originalUrl: string
  error?: string
}

export default function LinkPreview({ linkId }: LinkPreviewProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch(`/api/links/${linkId}/preview`)
        if (response.ok) {
          const data = await response.json()
          setPreview(data)
        }
      } catch (error) {
        console.error('Error fetching preview:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [linkId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>پیش‌نمایش لینک</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            در حال بارگذاری...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preview) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>پیش‌نمایش لینک</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {preview.image ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={preview.image}
                alt={preview.title || 'Preview'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div className="w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}

          <div className="space-y-2">
            {preview.title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {preview.title}
              </h3>
            )}

            {preview.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {preview.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{preview.originalUrl}</span>
            </div>
          </div>

          {preview.error && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {preview.error}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

