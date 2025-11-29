import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Key, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Code className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">
              مستندات API
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            از API ما برای یکپارچه‌سازی یوتیم کیت با سیستم‌های خود استفاده کنید
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              فقط در پلن‌های پایه و حرفه‌ای
            </Badge>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-8 border-2 border-teal-500 dark:border-teal-400">
          <CardHeader>
            <CardTitle className="text-2xl dark:text-gray-100">شروع سریع</CardTitle>
            <CardDescription>
              برای استفاده از API، ابتدا باید API Key خود را از تنظیمات دریافت کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100">
                <code>{`// مثال: ساخت لینک جدید
POST /api/v1/links
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "originalUrl": "https://example.com",
  "title": "لینک تست",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "summer_sale"
}`}</code>
              </pre>
            </div>
            <div className="flex gap-3">
              <Link href="/auth/login">
                <Button>ورود برای دریافت API Key</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline">مشاهده پلن‌ها</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Key className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-2xl dark:text-gray-100">احراز هویت</CardTitle>
            </div>
            <CardDescription>
              تمام درخواست‌های API نیاز به API Key دارند
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              برای استفاده از API، باید API Key خود را در header درخواست‌ها ارسال کنید:
            </p>
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100">
                <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
              </pre>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>نکته امنیتی:</strong> API Key خود را محرمانه نگه دارید و هرگز آن را در کدهای frontend قرار ندهید.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Endpoints</h2>

          {/* Create Link */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      POST
                    </Badge>
                    <CardTitle className="dark:text-gray-100">ساخت لینک جدید</CardTitle>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-400">
                    /api/v1/links
                  </code>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Request Body:</h4>
                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{`{
  "originalUrl": "string (required)",
  "title": "string (optional)",
  "shortCode": "string (optional)",
  "utmSource": "string (optional)",
  "utmMedium": "string (optional)",
  "utmCampaign": "string (optional)",
  "utmTerm": "string (optional)",
  "utmContent": "string (optional)"
}`}</code>
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Response:</h4>
                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{`{
  "id": "clx123...",
  "originalUrl": "https://example.com",
  "shortCode": "abc123",
  "shortUrl": "https://yoursite.com/l/abc123",
  "title": "لینک تست",
  "createdAt": "2024-01-01T00:00:00Z"
}`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Get Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      GET
                    </Badge>
                    <CardTitle className="dark:text-gray-100">دریافت لیست لینک‌ها</CardTitle>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-400">
                    /api/v1/links
                  </code>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Query Parameters:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">page</code> - شماره صفحه (پیش‌فرض: 1)</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">limit</code> - تعداد در هر صفحه (پیش‌فرض: 20)</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">search</code> - جستجو در عنوان یا URL</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Get Link Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      GET
                    </Badge>
                    <CardTitle className="dark:text-gray-100">دریافت جزئیات لینک</CardTitle>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-400">
                    /api/v1/links/:id
                  </code>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                جزئیات کامل یک لینک شامل آمار کلیک‌ها را برمی‌گرداند.
              </p>
            </CardContent>
          </Card>

          {/* Update Link */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                      PATCH
                    </Badge>
                    <CardTitle className="dark:text-gray-100">به‌روزرسانی لینک</CardTitle>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-400">
                    /api/v1/links/:id
                  </code>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                تمام فیلدها اختیاری هستند. فقط فیلدهایی که می‌خواهید تغییر دهید را ارسال کنید.
              </p>
            </CardContent>
          </Card>

          {/* Delete Link */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      DELETE
                    </Badge>
                    <CardTitle className="dark:text-gray-100">حذف لینک</CardTitle>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-400">
                    /api/v1/links/:id
                  </code>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                لینک و تمام آمار مرتبط با آن حذف می‌شود.
              </p>
            </CardContent>
          </Card>

          {/* Get Link Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      GET
                    </Badge>
                    <CardTitle className="dark:text-gray-100">دریافت آمار لینک</CardTitle>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-400">
                    /api/v1/links/:id/stats
                  </code>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                آمار کامل کلیک‌ها شامل توزیع بر اساس دستگاه، مرجع، تاریخ و غیره.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Codes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl dark:text-gray-100">کدهای خطا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">400</Badge>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Bad Request</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">درخواست نامعتبر یا داده‌های ناقص</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">401</Badge>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Unauthorized</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">API Key نامعتبر یا منقضی شده</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">403</Badge>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Forbidden</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">دسترسی به این قابلیت نیاز به پلن بالاتر دارد</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">404</Badge>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Not Found</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">لینک یا منبع یافت نشد</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">500</Badge>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Internal Server Error</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">خطای سرور</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl dark:text-gray-100">محدودیت نرخ درخواست</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>پلن پایه:</strong> ۱۰۰ درخواست در دقیقه
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>پلن حرفه‌ای:</strong> ۱۰۰۰ درخواست در دقیقه
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-900 dark:text-yellow-300">
                  در صورت رسیدن به حد مجاز، پاسخ <code className="bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded">429 Too Many Requests</code> دریافت خواهید کرد.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">آماده شروع هستید؟</h3>
              <p className="text-teal-50">
                برای دریافت API Key و شروع استفاده از API، وارد حساب کاربری خود شوید
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/auth/login">
                  <Button variant="secondary" size="lg">
                    ورود به حساب کاربری
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    مشاهده پلن‌ها
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


