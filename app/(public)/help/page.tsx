import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { HelpCircle, Book, MessageCircle, Mail, Search, Code } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function HelpPage() {
  const faqs = [
    {
      question: 'چگونه لینک کوتاه بسازم؟',
      answer: 'برای ساخت لینک کوتاه، به صفحه "ساخت لینک جدید" بروید، لینک اصلی خود را وارد کنید و در صورت نیاز پارامترهای UTM را تنظیم کنید. سپس روی دکمه "ساخت لینک" کلیک کنید.',
    },
    {
      question: 'پارامترهای UTM چیست؟',
      answer: 'پارامترهای UTM به شما کمک می‌کنند تا منبع ترافیک وب‌سایت خود را ردیابی کنید. این پارامترها شامل utm_source (منبع)، utm_medium (رسانه)، utm_campaign (کمپین)، utm_term (کلمه کلیدی) و utm_content (محتوای تبلیغ) هستند.',
    },
    {
      question: 'چگونه می‌توانم آمار کلیک‌های لینک خود را ببینم؟',
      answer: 'برای مشاهده آمار، به صفحه "لینک‌های من" بروید و روی دکمه "جزئیات" در کنار لینک مورد نظر کلیک کنید. در صفحه جزئیات می‌توانید آمار کامل کلیک‌ها، توزیع بر اساس دستگاه، مرجع و روند زمانی را مشاهده کنید.',
    },
    {
      question: 'آیا می‌توانم لینک‌های خود را دسته‌بندی کنم؟',
      answer: 'بله، می‌توانید دسته‌بندی‌های مختلف ایجاد کنید و لینک‌های خود را در آن‌ها سازماندهی کنید. برای این کار به صفحه "تنظیمات" > "دسته‌بندی‌ها" بروید.',
    },
    {
      question: 'چگونه می‌توانم لینک‌های خود را export کنم؟',
      answer: 'این قابلیت فقط در پلن‌های پایه و حرفه‌ای در دسترس است. پس از ارتقا پلن، می‌توانید از دکمه "Export CSV" در صفحه لینک‌ها استفاده کنید.',
    },
    {
      question: 'آیا می‌توانم دامنه اختصاصی استفاده کنم؟',
      answer: 'بله، استفاده از دامنه اختصاصی در پلن‌های پایه (۱ دامنه) و حرفه‌ای (چند دامنه) امکان‌پذیر است. برای اطلاعات بیشتر به صفحه "قیمت‌ها" مراجعه کنید.',
    },
    {
      question: 'چگونه می‌توانم از API استفاده کنم؟',
      answer: 'دسترسی API در پلن‌های پایه و حرفه‌ای در دسترس است. پس از ورود به حساب کاربری، می‌توانید API Key خود را از تنظیمات دریافت کنید. برای مستندات کامل به صفحه "مستندات API" مراجعه کنید.',
    },
    {
      question: 'آیا می‌توانم لینک‌ها را با رمز عبور محافظت کنم؟',
      answer: 'بله، در هنگام ساخت یا ویرایش لینک می‌توانید یک رمز عبور تنظیم کنید. در این صورت، کاربران برای دسترسی به لینک باید رمز عبور را وارد کنند.',
    },
    {
      question: 'چگونه می‌توانم تاریخ انقضا برای لینک تنظیم کنم؟',
      answer: 'در فرم ساخت یا ویرایش لینک، می‌توانید تاریخ انقضا را تنظیم کنید. پس از انقضا، لینک دیگر فعال نخواهد بود.',
    },
    {
      question: 'آیا می‌توانم لینک‌ها را به صورت دسته‌ای import کنم؟',
      answer: 'بله، می‌توانید فایل CSV حاوی لینک‌های خود را در صفحه "لینک‌های من" آپلود کنید. فرمت CSV باید شامل ستون‌های originalUrl، title، utmSource، utmMedium و utmCampaign باشد.',
    },
  ]

  const guides = [
    {
      title: 'شروع سریع',
      description: 'راهنمای گام به گام برای شروع استفاده از سرویس',
      icon: Book,
      href: '#',
    },
    {
      title: 'استفاده از UTM',
      description: 'آموزش کامل استفاده از پارامترهای UTM برای ردیابی',
      icon: HelpCircle,
      href: '#',
    },
    {
      title: 'API Documentation',
      description: 'مستندات کامل API برای توسعه‌دهندگان',
      icon: Code,
      href: '/api-docs',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">
              راهنما و پشتیبانی
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            پاسخ سوالات خود را پیدا کنید یا با تیم پشتیبانی ما تماس بگیرید
          </p>
        </div>

        {/* Search */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="جستجو در راهنما..."
                className="pr-12 text-lg h-14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Guides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">راهنماهای سریع</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {guides.map((guide, index) => {
              const Icon = guide.icon
              return (
                <Link key={index} href={guide.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="dark:text-gray-100">{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">سوالات متداول</h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-right text-gray-900 dark:text-gray-100">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-right text-gray-700 dark:text-gray-300">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <CardTitle className="dark:text-gray-100">پشتیبانی تیکت</CardTitle>
              </div>
              <CardDescription>
                برای پلن‌های پایه و حرفه‌ای
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                از طریق سیستم تیکت می‌توانید با تیم پشتیبانی در ارتباط باشید.
              </p>
              <Link href="/tickets/new">
                <Button variant="outline" className="w-full">
                  ارسال تیکت
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <CardTitle className="dark:text-gray-100">تماس با ما</CardTitle>
              </div>
              <CardDescription>
                برای سوالات عمومی و پیشنهادات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ایمیل: <a href="mailto:support@utmkit.ir" className="text-teal-600 dark:text-teal-400 hover:underline">support@utmkit.ir</a>
              </p>
              <a href="mailto:support@utmkit.ir">
                <Button variant="outline" className="w-full">
                  ارسال ایمیل
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

