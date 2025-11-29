'use client'

import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
      }}
    >
      <Copy className="h-4 w-4" />
    </Button>
  )
}





