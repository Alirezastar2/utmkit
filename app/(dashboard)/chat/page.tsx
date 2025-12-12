import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ChatBot from '@/components/chat/ChatBot'

export default async function ChatPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">چت بات</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          با دستیار هوشمند یوتیم کیت گفتگو کنید
        </p>
      </div>

      <div className="h-[calc(100vh-12rem)]">
        <ChatBot />
      </div>
    </div>
  )
}

