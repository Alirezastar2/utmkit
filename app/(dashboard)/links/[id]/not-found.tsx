import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">
          لینک یافت نشد
        </h2>
        <p className="mt-2 text-gray-600">
          لینک مورد نظر شما وجود ندارد یا دسترسی به آن ندارید.
        </p>
        <div className="mt-6">
          <Link href="/links">
            <Button>بازگشت به لیست لینک‌ها</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}






