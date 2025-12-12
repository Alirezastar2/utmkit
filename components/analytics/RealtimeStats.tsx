'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, Activity } from 'lucide-react'

interface RealtimeStatsProps {
  linkId: string
  initialClicks: number
}

interface RealtimeClick {
  id: string
  createdAt: string
  country: string | null
  city: string | null
  deviceType: string
  browser: string | null
}

interface RealtimeMessage {
  type: 'connected' | 'stats' | 'new_clicks' | 'heartbeat' | 'error'
  message?: string
  data?: {
    totalClicks?: number
    count?: number
    clicks?: RealtimeClick[]
    timestamp?: string
  }
  timestamp?: string
}

export default function RealtimeStats({ linkId, initialClicks }: RealtimeStatsProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [totalClicks, setTotalClicks] = useState(initialClicks)
  const [recentClicks, setRecentClicks] = useState<RealtimeClick[]>([])
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource(`/api/links/${linkId}/realtime`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data)

        switch (message.type) {
          case 'connected':
            setIsConnected(true)
            break

          case 'stats':
            if (message.data?.totalClicks !== undefined) {
              setTotalClicks(message.data.totalClicks)
            }
            break

          case 'new_clicks':
            if (message.data) {
              if (message.data.totalClicks !== undefined) {
                setTotalClicks(message.data.totalClicks)
              }
              if (message.data.clicks) {
                setRecentClicks((prev) => [
                  ...message.data!.clicks!.reverse(),
                  ...prev,
                ].slice(0, 10)) // Keep last 10 clicks
              }
            }
            break

          case 'error':
            setError(message.message || 'خطا در اتصال')
            break

          case 'heartbeat':
            // Just keep connection alive
            break
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setError('اتصال قطع شد')
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [linkId])

  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    setIsConnected(false)
    setError(null)
    // Reconnect will happen automatically via useEffect
    window.location.reload()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            آمار لحظه‌ای
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">متصل</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">قطع شده</span>
              </div>
            )}
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={reconnect}
                className="text-xs"
              >
                اتصال مجدد
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold text-primary">
              {totalClicks}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              مجموع کلیک‌ها
            </p>
          </div>

          {recentClicks.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                کلیک‌های اخیر (Real-time)
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentClicks.map((click) => (
                  <div
                    key={click.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 animate-pulse-once"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(click.createdAt).toLocaleTimeString('fa-IR')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {click.country && `${click.country} `}
                          {click.city && `• ${click.city} `}
                          {click.deviceType && `• ${click.deviceType}`}
                          {click.browser && ` • ${click.browser}`}
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {!isConnected && !error && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              در حال اتصال...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

