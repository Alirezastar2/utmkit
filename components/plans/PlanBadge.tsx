'use client'

import { Badge } from '@/components/ui/badge'
import { Crown, Zap, Gift } from 'lucide-react'
import { type PlanType } from '@/lib/plans'

interface PlanBadgeProps {
  plan: PlanType
  className?: string
}

export default function PlanBadge({ plan, className }: PlanBadgeProps) {
  const planConfig = {
    FREE: {
      icon: Gift,
      label: 'رایگان',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
    BASIC: {
      icon: Zap,
      label: 'پایه',
      variant: 'default' as const,
      className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    },
    PRO: {
      icon: Crown,
      label: 'حرفه‌ای',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    },
  }

  const config = planConfig[plan]
  const Icon = config.icon

  return (
    <Badge className={`${config.className} ${className || ''} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}






