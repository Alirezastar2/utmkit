'use client'

import { Button } from '@/components/ui/button'
import { Users, MessageSquare, Zap } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/admin/users">
        <Button variant="outline" size="sm" className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20">
          <Users className="h-4 w-4" />
          کاربران
        </Button>
      </Link>
      <Link href="/admin/tickets">
        <Button variant="outline" size="sm" className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20">
          <MessageSquare className="h-4 w-4" />
          تیکت‌ها
        </Button>
      </Link>
    </div>
  )
}

