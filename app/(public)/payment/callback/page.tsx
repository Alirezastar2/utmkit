'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyPayment = async () => {
      // NovinPal پارامترهای refId, success, code, invoiceNumber, amount را ارسال می‌کند
      const refId = searchParams.get('refId')
      const success = searchParams.get('success')
      const code = searchParams.get('code')
      const invoiceNumber = searchParams.get('invoiceNumber')
      const amount = searchParams.get('amount')

      if (!refId) {
        setStatus('failed')
        setMessage('اطلاعات پرداخت ناقص است')
        return
      }

      // success=0 یعنی پرداخت ناموفق
      if (success === '0') {
        setStatus('failed')
        setMessage('پرداخت ناموفق بود')
        return
      }

      // success=1 و code=100 یعنی پرداخت موفق
      if (success === '1' && code === '100') {
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refId,
            }),
          })

          const verifyData = await verifyResponse.json()

          if (verifyData.success) {
            setStatus('success')
            setMessage('پرداخت با موفقیت انجام شد و پلن شما ارتقا یافت')
            toast.success('پرداخت موفق! پلن شما ارتقا یافت')
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
          } else {
            setStatus('failed')
            setMessage(verifyData.error || 'خطا در تایید تراکنش')
            toast.error(verifyData.error || 'خطا در تایید تراکنش')
          }
        } catch (error: any) {
          setStatus('failed')
          setMessage(error.message || 'خطا در پردازش تراکنش')
          toast.error('خطا در پردازش تراکنش')
        }
      } else {
        // سایر کدهای خطا
        setStatus('failed')
        const errorMessages: Record<string, string> = {
          '109': 'تراکنش ناموفق بود',
          '104': 'خطای PSP',
          '107': 'PSP یافت نشد',
          '108': 'خطای سرور',
        }
        setMessage(errorMessages[code || ''] || 'پرداخت ناموفق بود')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>نتیجه پرداخت</CardTitle>
          <CardDescription>در حال بررسی وضعیت پرداخت...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">در حال بررسی...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
              <p className="text-lg font-semibold text-green-600 mb-2">پرداخت موفق</p>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                {message}
              </p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-600">
                  بازگشت به داشبورد
                </Button>
              </Link>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-12 w-12 text-red-600 mb-4" />
              <p className="text-lg font-semibold text-red-600 mb-2">پرداخت ناموفق</p>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                {message}
              </p>
              <div className="flex gap-2">
                <Link href="/pricing">
                  <Button variant="outline">بازگشت به قیمت‌ها</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>داشبورد</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
