import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Zap, Gift, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PLANS, formatPrice, type PlanType } from '@/lib/plans'
import PlanBadge from '@/components/plans/PlanBadge'

export default async function PlanSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })

  const currentPlan = (user?.plan || 'FREE') as PlanType
  const planExpiresAt = user?.planExpiresAt

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مدیریت پلن</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          پلن فعلی خود را مشاهده و تغییر دهید
        </p>
      </div>

      {/* Current Plan */}
      <Card className="border-2 border-teal-500 dark:border-teal-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl dark:text-gray-100">پلن فعلی شما</CardTitle>
              <CardDescription className="mt-2">
                {PLANS[currentPlan].description}
              </CardDescription>
            </div>
            <PlanBadge plan={currentPlan} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                {formatPrice(PLANS[currentPlan].price)}
                <span className="text-lg text-gray-600 dark:text-gray-400 mr-2">تومان</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">ماهانه</div>
            </div>
            {planExpiresAt && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                تاریخ انقضا: {new Date(planExpiresAt).toLocaleDateString('fa-IR')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          پلن‌های موجود
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(PLANS).map((plan) => {
            const isCurrentPlan = plan.id === currentPlan
            const isUpgrade = plan.id !== 'FREE' && currentPlan === 'FREE'
            const isDowngrade = plan.id === 'FREE' && currentPlan !== 'FREE'

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isCurrentPlan
                    ? 'border-2 border-teal-500 dark:border-teal-400 shadow-lg'
                    : 'border border-gray-200 dark:border-gray-700'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    پلن فعلی
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xl dark:text-gray-100">{plan.nameFa}</CardTitle>
                    {plan.id === 'BASIC' && <Zap className="h-6 w-6 text-teal-500" />}
                    {plan.id === 'PRO' && <Crown className="h-6 w-6 text-purple-500" />}
                    {plan.id === 'FREE' && <Gift className="h-6 w-6 text-gray-500" />}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                      {formatPrice(plan.price)}
                      <span className="text-lg text-gray-600 dark:text-gray-400 mr-2">تومان</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">ماهانه</div>
                    {plan.priceYearly > 0 && (
                      <div className="text-sm text-teal-600 dark:text-teal-400 mt-2">
                        سالانه: {formatPrice(plan.priceYearly)} تومان
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                          ({plan.id === 'BASIC' ? '۱۰' : '۱۵'}٪ تخفیف)
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FeatureItem enabled={plan.features.unlimitedLinks} text="لینک نامحدود" />
                    <FeatureItem enabled={plan.features.advancedAnalytics} text="آمار پیشرفته" />
                    <FeatureItem enabled={plan.features.pdfExport} text="خروجی PDF/Excel" />
                    <FeatureItem enabled={plan.features.apiAccess} text="دسترسی API" />
                    <FeatureItem
                      enabled={plan.features.customDomain}
                      text={`دامنه اختصاصی ${plan.features.customDomainCount > 0 ? `(${plan.features.customDomainCount})` : ''}`}
                    />
                    <FeatureItem enabled={plan.features.whiteLabel} text="White-label" />
                    <FeatureItem
                      enabled={plan.features.prioritySupport}
                      text="پشتیبانی ویژه"
                    />
                  </div>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      پلن فعلی
                    </Button>
                  ) : (
                    <Link href={`/pricing?upgrade=${plan.id}`} className="block">
                      <Button
                        variant={isUpgrade ? 'default' : 'outline'}
                        className={`w-full ${
                          isUpgrade
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700'
                            : ''
                        }`}
                      >
                        {isUpgrade ? 'ارتقا به این پلن' : isDowngrade ? 'کاهش به رایگان' : 'تغییر پلن'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>نکته:</strong> برای تغییر پلن و پرداخت، لطفاً به صفحه{' '}
            <Link href="/pricing" className="underline font-semibold">
              قیمت‌ها
            </Link>{' '}
            مراجعه کنید. در حال حاضر سیستم پرداخت آنلاین در حال توسعه است.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function FeatureItem({ enabled, text }: { enabled: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
      ) : (
        <div className="h-4 w-4 flex-shrink-0" />
      )}
      <span className={`text-sm ${enabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
        {text}
      </span>
    </div>
  )
}





