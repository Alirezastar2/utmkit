'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface QRCodeDisplayProps {
  shortCode: string
  title?: string | null
}

export default function QRCodeDisplay({ shortCode, title }: QRCodeDisplayProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQR = async () => {
      try {
        const response = await fetch(`/api/qrcode/${shortCode}`)
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setQrUrl(url)
        }
      } catch (error) {
        console.error('Error loading QR code:', error)
      } finally {
        setLoading(false)
      }
    }
    loadQR()
  }, [shortCode])

  const handleDownload = () => {
    if (qrUrl) {
      const link = document.createElement('a')
      link.href = qrUrl
      link.download = `qrcode-${shortCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        ) : qrUrl ? (
          <>
            <div className="flex justify-center">
              <div className="rounded-lg border-4 border-white p-4 bg-white shadow-lg">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="h-64 w-64"
                />
              </div>
            </div>
            {title && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">{title}</p>
            )}
            <Button
              onClick={handleDownload}
              className="w-full"
              variant="outline"
            >
              <Download className="ml-2 h-4 w-4" />
              دانلود QR Code
            </Button>
          </>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            خطا در بارگذاری QR Code
          </div>
        )}
      </CardContent>
    </Card>
  )
}

