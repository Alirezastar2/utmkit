import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export default function LinkExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50/30 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">لینک منقضی شده</CardTitle>
          <CardDescription>
            متأسفانه این لینک منقضی شده یا غیرفعال است
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            اگر شما صاحب این لینک هستید، لطفاً به حساب کاربری خود وارد شوید و لینک را فعال کنید.
          </p>
          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                بازگشت به صفحه اصلی
              </Button>
            </Link>
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full">
                ورود به حساب کاربری
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






