'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PLANS, formatPrice } from '@/lib/plans'

export const dynamic = 'force-dynamic'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const plan = searchParams.get('plan') as 'BASIC' | 'PRO' | null

  useEffect(() => {
    if (!plan || !['BASIC', 'PRO'].includes(plan)) {
      router.push('/pricing')
    }
  }, [plan, router])

  const handlePayment = async () => {
    if (!plan) return

    setLoading(true)
    try {
      const response = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Log error for debugging
        console.error('Payment request error:', {
          status: response.status,
          error: data.error,
          message: data.message,
          statusCode: data.status,
          errors: data.errors,
          details: data.details,
        })
        
        // Show detailed error message
        const errorMessage = data.error || data.message || 'خطا در ایجاد درخواست پرداخت'
        toast.error(errorMessage, {
          description: data.errors ? JSON.stringify(data.errors) : undefined,
          duration: 5000,
        })
        setLoading(false)
        return
      }

      if (data.success && data.payment_url) {
        // Redirect to payment gateway
        window.location.href = data.payment_url
      } else {
        toast.error(data.error || 'خطا در ایجاد درخواست پرداخت')
        setLoading(false)
      }
    } catch (error: any) {
      toast.error('خطا در ایجاد درخواست پرداخت')
      setLoading(false)
    }
  }

  if (!plan || !['BASIC', 'PRO'].includes(plan)) {
    return null
  }

  const planConfig = PLANS[plan]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">پرداخت</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          تکمیل پرداخت و ارتقا به پلن {planConfig.nameFa}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جزئیات پرداخت</CardTitle>
          <CardDescription>
            اطلاعات پلن انتخابی و مبلغ پرداخت
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">پلن انتخابی:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {planConfig.nameFa}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">مبلغ:</span>
              <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {formatPrice(planConfig.price)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">مدت اعتبار:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ۱ ماه
              </span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex gap-4">
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    در حال انتقال به درگاه...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 ml-2" />
                    پرداخت و انتقال به درگاه
                  </>
                )}
              </Button>
              <Link href="/pricing">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  بازگشت
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              با کلیک روی دکمه پرداخت، به درگاه امن نوینو پی هدایت خواهید شد.
              <br />
              پرداخت شما با بالاترین استانداردهای امنیتی انجام می‌شود.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
