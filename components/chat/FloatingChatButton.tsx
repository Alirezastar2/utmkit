'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Bot, X } from 'lucide-react'
import ChatBot from './ChatBot'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePathname } from 'next/navigation'

export default function FloatingChatButton() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Don't show on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  // Only show for authenticated users
  if (!session?.user) {
    return null
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30 dark:shadow-teal-500/20 flex items-center justify-center p-0"
        size="lg"
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Bot className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              دستیار هوشمند یوتیم کیت
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0">
            <ChatBot />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

