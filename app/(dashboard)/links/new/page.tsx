import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LinkForm from '@/components/links/LinkForm'

export default async function NewLinkPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ساخت لینک جدید</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          لینک کوتاه و قابل ردیابی با پارامترهای UTM بسازید
        </p>
      </div>

      <LinkForm />
    </div>
  )
}

