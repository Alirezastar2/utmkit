import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Link2, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Rocket,
  Star,
  Clock,
  Lock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Metadata } from 'next'
import { generateMetadata as genMeta, getBreadcrumbSchema } from '@/lib/seo'
import ShortenLinkBox from '@/components/public/ShortenLinkBox'

export const metadata: Metadata = genMeta({
  title: 'یوتیم کیت - پلتفرم ساخت لینک هوشمند و ردیابی UTM',
  description: 'پلتفرم حرفه‌ای ساخت لینک کوتاه و ردیابی UTM برای کمپین‌های بازاریابی. ساخت لینک‌های کوتاه، ردیابی کلیک‌ها، آمار دقیق و QR Code برای کسب‌وکارهای ایرانی.',
  url: '/',
})

export default function LandingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'خانه', url: '/' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main>
          {/* Hero Section */}
          <section className="container mx-auto px-4 pt-12 pb-24 md:pt-16 md:pb-32 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 px-4 py-2 text-sm font-medium text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-700/50 shadow-sm">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>پلتفرم حرفه‌ای ردیابی لینک</span>
            </div>
            
            <h1 className="mb-10 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
                پلتفرم ساخت لینک هوشمند
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-200 block mt-2">و ردیابی UTM</span>
            </h1>
            
            <p className="mx-auto mb-14 max-w-2xl text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
              لینک‌های کوتاه و قابل ردیابی برای کمپین‌های بازاریابی خود بسازید.
              <br />
              <span className="font-semibold text-teal-600 dark:text-teal-400">آمار دقیق کلیک‌ها</span> را مشاهده کنید و عملکرد کمپین‌های خود را بهبود دهید.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-xl shadow-teal-500/30 text-lg px-8 py-6 h-auto group">
                  شروع رایگان
                  <Rocket className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-2 text-lg px-8 py-6 h-auto group">
                  مشاهده پلن‌ها
                  <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Shorten Link Box */}
            <div className="mb-16">
              <ShortenLinkBox />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  ۱۰۰۰+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">کاربر فعال</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  ۵۰K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">لینک ساخته شده</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  ۱M+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">کلیک ردیابی شده</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  ۹۹.۹%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Uptime</div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="container mx-auto px-4 py-24">
            <div className="text-center mb-20">
              <Badge className="mb-4 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                ویژگی‌های اصلی
              </Badge>
              <h2 className="mb-4 text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                همه چیز برای مدیریت حرفه‌ای لینک‌ها
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                ابزارهای قدرتمند برای ساخت، مدیریت و ردیابی لینک‌های کوتاه
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover-lift group border-2 border-transparent hover:border-teal-200 dark:hover:border-teal-800 transition-all">
                <CardHeader>
                  <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                    <Link2 className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl dark:text-gray-100">ساخت لینک با UTM</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed dark:text-gray-400">
                    لینک‌های خود را با پارامترهای UTM سفارشی کنید و منبع ترافیک را به راحتی ردیابی کنید.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-lift group border-2 border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-all">
                <CardHeader>
                  <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl dark:text-gray-100">لینک کوتاه مخصوص کمپین</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed dark:text-gray-400">
                    لینک‌های کوتاه و به یاد ماندنی برای هر کمپین بازاریابی خود ایجاد کنید.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-lift group border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                <CardHeader>
                  <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl dark:text-gray-100">داشبورد آمار کلیک‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed dark:text-gray-400">
                    آمار دقیق کلیک‌ها، دستگاه‌ها، مراجع و روندهای زمانی را در یک داشبورد جامع مشاهده کنید.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover-lift group border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all">
                <CardHeader>
                  <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl dark:text-gray-100">امن و قابل اعتماد</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed dark:text-gray-400">
                    داده‌های شما با امنیت بالا نگهداری می‌شوند و دسترسی به لینک‌ها فقط برای شما است.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Advanced Features */}
          <section className="bg-gradient-to-br from-gray-50 to-teal-50/30 dark:from-gray-800 dark:to-gray-900 py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-20">
                <Badge className="mb-4 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  قابلیت‌های پیشرفته
                </Badge>
                <h2 className="mb-4 text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                  ابزارهای حرفه‌ای برای کسب‌وکار شما
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">دامنه اختصاصی</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      از دامنه خود برای لینک‌های کوتاه استفاده کنید
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">آمار پیشرفته</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      گزارش‌های کامل و تحلیل عمیق عملکرد لینک‌ها
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">رمزگذاری لینک</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      لینک‌های خود را با رمز عبور محافظت کنید
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">انقضای خودکار</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      تاریخ انقضا برای لینک‌های موقت تنظیم کنید
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">QR Code</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      تولید خودکار QR Code برای هر لینک
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">API کامل</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      یکپارچه‌سازی با سیستم‌های خود با API قدرتمند
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Section */}
          <section className="container mx-auto px-4 py-24">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div>
                <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  چرا یوتیم کیت؟
                </Badge>
                <h2 className="mb-8 text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                  راه‌حل ایده‌آل برای بازاریابان ایرانی
                </h2>
                <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1" />
                    <p>
                      برای بازاریابان و کسب‌وکارهای ایرانی که می‌خواهند عملکرد کمپین‌های خود را در شبکه‌های اجتماعی مانند اینستاگرام، واتساپ و تلگرام ردیابی کنند.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1" />
                    <p>
                      با استفاده از لینک‌های کوتاه و پارامترهای UTM، می‌توانید به راحتی تشخیص دهید که کدام پست، استوری یا پیام بیشترین ترافیک را به وب‌سایت شما هدایت کرده است.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1" />
                    <p>
                      داشبورد فارسی و رابط کاربری ساده، استفاده از این ابزار را برای همه آسان می‌کند.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-3xl blur-3xl"></div>
                <Card className="relative border-2 border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl dark:text-gray-100">مثال عملی</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">لینک اصلی:</div>
                      <code className="block p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm break-all">
                        https://example.com/product?utm_source=instagram&utm_medium=story&utm_campaign=summer_sale
                      </code>
                    </div>
                    <ArrowRight className="h-6 w-6 text-teal-600 dark:text-teal-400 mx-auto" />
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">لینک کوتاه:</div>
                      <code className="block p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg text-sm text-center font-bold">
                        utmkit.ir/l/abc123
                      </code>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">کلیک‌ها:</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">1,234</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600 dark:text-gray-400">منبع:</span>
                        <span className="font-bold">Instagram Story</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-20">
                <Badge className="mb-4 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                  نظرات کاربران
                </Badge>
                <h2 className="mb-4 text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                  کاربران ما چه می‌گویند؟
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
                {[
                  {
                    name: 'علی احمدی',
                    role: 'مدیر بازاریابی',
                    company: 'شرکت فناوری',
                    content: 'این سرویس واقعاً کار ما را آسان کرده. حالا می‌تونیم دقیقاً ببینیم کدوم پست اینستاگرام بیشترین ترافیک رو آورده.',
                    rating: 5,
                  },
                  {
                    name: 'سارا محمدی',
                    role: 'بازاریاب دیجیتال',
                    company: 'استارتاپ',
                    content: 'داشبورد فارسی و رابط کاربری ساده، استفاده رو برای تیم ما خیلی راحت کرده. پیشنهاد می‌کنم.',
                    rating: 5,
                  },
                  {
                    name: 'رضا کریمی',
                    role: 'مدیر محصول',
                    company: 'E-commerce',
                    content: 'API قدرتمند و آمار دقیق. دقیقاً همون چیزی بود که نیاز داشتیم. کیفیت عالیه!',
                    rating: 5,
                  },
                ].map((testimonial, index) => (
                  <Card key={index} className="border-2 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <CardDescription className="text-base leading-relaxed dark:text-gray-400">
                        "{testimonial.content}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {testimonial.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {testimonial.role} • {testimonial.company}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 py-24">
            <Card className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-500 border-0 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
              <CardContent className="pt-12 pb-12 relative z-10">
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                  <h2 className="text-4xl md:text-5xl font-bold">آماده شروع هستید؟</h2>
                  <p className="text-xl text-teal-50">
                    همین حالا حساب کاربری رایگان خود را ایجاد کنید و لینک‌های خود را به صورت حرفه‌ای مدیریت کنید
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Link href="/auth/register">
                      <Button size="lg" variant="secondary" className="bg-white text-teal-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto shadow-xl">
                        شروع رایگان
                        <Rocket className="mr-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="lg" variant="outline" className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 text-lg px-8 py-6 h-auto backdrop-blur-sm">
                        مشاهده پلن‌ها
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-teal-100 pt-4">
                    بدون نیاز به کارت اعتباری • راه‌اندازی در کمتر از ۲ دقیقه
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                    <Link2 className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">یوتیم کیت</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  پلتفرم حرفه‌ای ساخت لینک کوتاه و ردیابی UTM برای کسب‌وکارهای ایرانی
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">محصول</h5>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">قیمت‌ها</Link></li>
                  <li><Link href="/features" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">ویژگی‌ها</Link></li>
                  <li><Link href="/api-docs" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">API</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">پشتیبانی</h5>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/help" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">راهنما</Link></li>
                  <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">تماس با ما</Link></li>
                  <li><Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">بلاگ</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">قانونی</h5>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">حریم خصوصی</Link></li>
                  <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">قوانین</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>© ۱۴۰۴ یوتیم کیت. تمام حقوق محفوظ است.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
