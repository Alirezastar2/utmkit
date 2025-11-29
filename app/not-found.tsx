import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          صفحه یافت نشد
        </h2>
        <p className="mt-2 text-gray-600">
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button>بازگشت به صفحه اصلی</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}





