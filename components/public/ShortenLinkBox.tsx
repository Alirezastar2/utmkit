'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check, Link2, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function ShortenLinkBox() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast.error('لطفاً یک لینک وارد کنید')
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      toast.error('لطفاً یک لینک معتبر وارد کنید')
      return
    }

    setLoading(true)
    setShortUrl(null)

    try {
      const response = await fetch('/api/public/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: url }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'خطا در کوتاه کردن لینک')
        return
      }

      setShortUrl(data.shortUrl)
      toast.success('لینک با موفقیت کوتاه شد!')
    } catch (error) {
      console.error('Error shortening link:', error)
      toast.error('خطایی رخ داد. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      toast.success('لینک کوتاه کپی شد!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-2 border-teal-500/50 dark:border-teal-400/50 bg-gradient-to-br from-white to-teal-50/30 dark:from-gray-800 dark:to-teal-900/20 shadow-xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            لینک خود را کوتاه کنید
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="https://example.com/very-long-url..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="h-12 text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-12 px-8 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال کوتاه کردن...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 ml-2" />
                  کوتاه کن
                </>
              )}
            </Button>
          </div>
        </form>

        {shortUrl && (
          <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">لینک کوتاه شما:</p>
                <p className="text-lg font-semibold text-teal-600 dark:text-teal-400 break-all">
                  {shortUrl}
                </p>
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 ml-2 text-green-600" />
                    کپی شد!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 ml-2" />
                    کپی
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          بدون نیاز به ثبت‌نام، لینک خود را کوتاه کنید و به اشتراک بگذارید
        </p>
      </CardContent>
    </Card>
  )
}


