'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUp, Crown, Zap, Sparkles, Check } from 'lucide-react'
import Link from 'next/link'
import { PLANS, formatPrice, type PlanType } from '@/lib/plans'
import PlanBadge from './PlanBadge'

interface PlanUpgradeCardProps {
  currentPlan: PlanType
  planExpiresAt?: Date | null
}

export default function PlanUpgradeCard({ currentPlan, planExpiresAt }: PlanUpgradeCardProps) {
  // اگر کاربر پلن PRO دارد، نیازی به نمایش نیست
  if (currentPlan === 'PRO') {
    return null
  }

  // تعیین پلن پیشنهادی
  const suggestedPlan: PlanType = currentPlan === 'FREE' ? 'BASIC' : 'PRO'
  const suggestedPlanConfig = PLANS[suggestedPlan]
  const currentPlanConfig = PLANS[currentPlan]

  // ویژگی‌های اضافی که با ارتقا دریافت می‌شود
  const upgradeFeatures = currentPlan === 'FREE' 
    ? [
        'تحلیل کامل کلیک‌ها و آمار پیشرفته',
        'گزارش‌گیری PDF و Excel',
        'دسترسی کامل به API',
        'یک دامنه اختصاصی',
        'پشتیبانی از طریق تیکت',
      ]
    : [
        'دامنه‌های اختصاصی نامحدود',
        'سفارشی‌سازی کامل برند',
        'پشتیبانی اولویت‌دار و سریع',
        'ویژگی‌های حرفه‌ای پیشرفته',
      ]

  return (
    <Card className="relative overflow-hidden border-2 border-teal-500/50 dark:border-teal-400/50 bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/30 dark:from-teal-900/20 dark:via-gray-800 dark:to-cyan-900/20 shadow-lg shadow-teal-500/10 dark:shadow-teal-500/20">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-2xl" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ارتقا به پلن {suggestedPlanConfig.nameFa}
              </CardTitle>
            </div>
            <CardDescription className="text-base mt-2">
              پلن فعلی شما: <span className="font-semibold">{currentPlanConfig.nameFa}</span>
            </CardDescription>
          </div>
          <PlanBadge plan={currentPlan} />
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* Price comparison */}
        <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-teal-200/50 dark:border-teal-700/50">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">پلن پیشنهادی</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                {formatPrice(suggestedPlanConfig.price)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">تومان</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ماهانه</div>
          </div>
          <div className="text-center">
            {suggestedPlan === 'BASIC' ? (
              <Zap className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            ) : (
              <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            )}
          </div>
        </div>

        {/* Upgrade features */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            با ارتقا دریافت می‌کنید:
          </div>
          <div className="space-y-2">
            {upgradeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4 border-t border-teal-200/50 dark:border-teal-700/50">
          <Link href={`/payment?plan=${suggestedPlan}`} className="block">
            <Button 
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30 dark:shadow-teal-500/20"
              size="lg"
            >
              <ArrowUp className="h-4 w-4 ml-2" />
              ارتقا به {suggestedPlanConfig.nameFa}
            </Button>
          </Link>
          <Link href="/pricing" className="block mt-2">
            <Button variant="outline" className="w-full" size="sm">
              مشاهده همه پلن‌ها
            </Button>
          </Link>
        </div>

        {/* Expiry info if exists */}
        {planExpiresAt && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            پلن فعلی تا {new Date(planExpiresAt).toLocaleDateString('fa-IR')} معتبر است
          </div>
        )}
      </CardContent>
    </Card>
  )
}


