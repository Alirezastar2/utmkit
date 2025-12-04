'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Zap, Crown, Gift } from 'lucide-react'
import Link from 'next/link'
import { PLANS, formatPrice, type PlanType } from '@/lib/plans'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const handlePlanSelect = (plan: 'BASIC' | 'PRO') => {
    if (session?.user) {
      // User is logged in, redirect to payment page
      router.push(`/payment?plan=${plan}`)
    } else {
      // User is not logged in, redirect to register with plan
      router.push(`/auth/register?plan=${plan}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              انتخاب پلن مناسب
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            پلن مناسب برای نیازهای خود را انتخاب کنید و لینک‌های خود را به صورت حرفه‌ای مدیریت کنید
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {/* Free Plan */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {PLANS.FREE.nameFa}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {PLANS.FREE.description}
              </CardDescription>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                  {formatPrice(PLANS.FREE.price)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 mr-2">تومان</span>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">رایگان</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureItem enabled={PLANS.FREE.features.unlimitedLinks} text="لینک نامحدود" />
              <FeatureItem enabled={PLANS.FREE.features.unlimitedLinks} text="کوتاه‌کننده لینک فارسی" />
              <FeatureItem enabled={true} text="داشبورد تحلیل کلیک‌ها (پایه)" />
              <FeatureItem enabled={PLANS.FREE.features.pdfExport} text="گزارش‌گیری PDF/Excel" />
              <FeatureItem enabled={PLANS.FREE.features.apiAccess} text="دسترسی API" />
              <FeatureItem enabled={PLANS.FREE.features.customDomain} text="دامنه اختصاصی" />
              <FeatureItem enabled={PLANS.FREE.features.whiteLabel} text="سفارشی‌سازی برند" />
              <FeatureItem enabled={true} text="پشتیبانی عمومی" />
              <Link href={session?.user ? "/dashboard" : "/auth/register"} className="block">
                <Button variant="outline" className="w-full mt-6">
                  {session?.user ? 'پلن فعلی شما' : 'شروع رایگان'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Basic Plan - Popular */}
          <Card className="relative border-2 border-teal-500 dark:border-teal-400 shadow-xl shadow-teal-500/20 scale-105 hover:scale-110 transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              محبوب‌ترین
            </div>
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {PLANS.BASIC.nameFa}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {PLANS.BASIC.description}
              </CardDescription>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                  {formatPrice(PLANS.BASIC.price)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 mr-2">تومان</span>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">ماهانه</div>
                <div className="text-sm text-teal-600 dark:text-teal-400 mt-2">
                  سالانه: {formatPrice(PLANS.BASIC.priceYearly)} تومان
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">(۱۰٪ تخفیف)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureItem enabled={PLANS.BASIC.features.unlimitedLinks} text="لینک نامحدود" />
              <FeatureItem enabled={PLANS.BASIC.features.unlimitedLinks} text="کوتاه‌کننده لینک فارسی" />
              <FeatureItem enabled={PLANS.BASIC.features.advancedAnalytics} text="داشبورد تحلیل کامل" />
              <FeatureItem enabled={PLANS.BASIC.features.pdfExport} text="گزارش‌گیری PDF/Excel" />
              <FeatureItem enabled={PLANS.BASIC.features.apiAccess} text="دسترسی API" />
              <FeatureItem enabled={PLANS.BASIC.features.customDomain} text={`دامنه اختصاصی (${PLANS.BASIC.features.customDomainCount})`} />
              <FeatureItem enabled={PLANS.BASIC.features.whiteLabel} text="سفارشی‌سازی برند" />
              <FeatureItem enabled={true} text="پشتیبانی عادی (تیکت)" />
              <Button
                onClick={() => handlePlanSelect('BASIC')}
                className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              >
                {session?.user ? 'پرداخت و ارتقا' : 'انتخاب پلن پایه'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-purple-500 dark:border-purple-400 shadow-xl shadow-purple-500/20 hover:scale-105 transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              حرفه‌ای
            </div>
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {PLANS.PRO.nameFa}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {PLANS.PRO.description}
              </CardDescription>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                  {formatPrice(PLANS.PRO.price)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 mr-2">تومان</span>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">ماهانه</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                  سالانه: {formatPrice(PLANS.PRO.priceYearly)} تومان
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">(۱۵٪ تخفیف)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureItem enabled={PLANS.PRO.features.unlimitedLinks} text="لینک نامحدود" />
              <FeatureItem enabled={PLANS.PRO.features.unlimitedLinks} text="کوتاه‌کننده لینک فارسی" />
              <FeatureItem enabled={PLANS.PRO.features.advancedAnalytics} text="داشبورد تحلیل کامل" />
              <FeatureItem enabled={PLANS.PRO.features.pdfExport} text="گزارش‌گیری PDF/Excel" />
              <FeatureItem enabled={PLANS.PRO.features.apiAccess} text="دسترسی API" />
              <FeatureItem enabled={PLANS.PRO.features.customDomain} text={`دامنه اختصاصی (${PLANS.PRO.features.customDomainCount === 999 ? 'نامحدود' : PLANS.PRO.features.customDomainCount})`} />
              <FeatureItem enabled={PLANS.PRO.features.whiteLabel} text="سفارشی‌سازی برند" />
              <FeatureItem enabled={true} text="پشتیبانی اولویت‌دار" />
              <Button
                onClick={() => handlePlanSelect('PRO')}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {session?.user ? 'پرداخت و ارتقا' : 'انتخاب پلن حرفه‌ای'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">چگونه می‌توانم پلن خود را تغییر دهم؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                می‌توانید در هر زمان پلن خود را ارتقا دهید. مبلغ اضافی به صورت تناسبی محاسبه می‌شود.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">آیا می‌توانم پلن خود را لغو کنم؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                بله، می‌توانید در هر زمان پلن خود را لغو کنید. پلن شما تا پایان دوره پرداخت شده فعال خواهد ماند.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">پشتیبانی چگونه است؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                پلن رایگان: مستندات عمومی | پلن پایه: پشتیبانی تیکت | پلن حرفه‌ای: پشتیبانی اولویت‌دار
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">آیا پرداخت امن است؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                بله، تمام پرداخت‌ها از طریق درگاه امن نوین‌پال انجام می‌شود و اطلاعات کارت شما ذخیره نمی‌شود.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ enabled, text }: { enabled: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
      ) : (
        <X className="h-5 w-5 text-gray-400 flex-shrink-0" />
      )}
      <span className={enabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 line-through'}>
        {text}
      </span>
    </div>
  )
}
