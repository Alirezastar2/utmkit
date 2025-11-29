import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import LinkDetailStats from '@/components/links/LinkDetailStats'
import QRCodeDisplay from '@/components/links/QRCodeDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import Link from 'next/link'
import { ArrowRight, Edit, Clock, Lock } from 'lucide-react'
import { buildFinalUrl } from '@/lib/utils'

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const link = await prisma.link.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      _count: {
        select: { clicks: true },
      },
    },
  })

  if (!link) {
    notFound()
  }

  const shortUrl = `${process.env.NEXTAUTH_URL || 'https://utmkit.ir'}/l/${link.shortCode}`
  const finalUrl = buildFinalUrl(link.originalUrl, {
    utmSource: link.utmSource,
    utmMedium: link.utmMedium,
    utmCampaign: link.utmCampaign,
    utmTerm: link.utmTerm,
    utmContent: link.utmContent,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {link.title || 'جزئیات لینک'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">مشاهده آمار و اطلاعات لینک</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/links/${id}/edit`}>
            <Button variant="outline">
              <Edit className="ml-2 h-4 w-4" />
              ویرایش
            </Button>
          </Link>
          <Link href="/links">
            <Button variant="outline">
              <ArrowRight className="ml-2 h-4 w-4" />
              بازگشت به لیست
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Alerts */}
      {link.expiresAt && new Date(link.expiresAt) < new Date() && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-300">لینک منقضی شده</p>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  این لینک در تاریخ {new Date(link.expiresAt).toLocaleDateString('fa-IR')} منقضی شده است
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!link.isActive && (
        <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-gray-400 dark:bg-gray-600" />
              <p className="font-semibold text-gray-900 dark:text-gray-100">لینک غیرفعال است</p>
            </div>
          </CardContent>
        </Card>
      )}

      {link.password && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="font-semibold text-blue-900 dark:text-blue-300">لینک با رمز عبور محافظت شده است</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات لینک</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                لینک کوتاه:
              </label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 text-sm">
                  {shortUrl}
                </code>
                <CopyButton text={shortUrl} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                لینک اصلی:
              </label>
              <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-400">
                {link.originalUrl}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                لینک نهایی (با UTM):
              </label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 text-sm break-all">
                  {finalUrl}
                </code>
                <CopyButton text={finalUrl} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                تعداد کلیک‌ها:
              </label>
              <p className="mt-1 text-lg font-bold text-primary">
                {link._count.clicks}
              </p>
            </div>
            {link.title && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  عنوان:
                </label>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{link.title}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>پارامترهای UTM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {link.utmSource && (
              <div>
                <span className="text-sm font-medium">utm_source: </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{link.utmSource}</span>
              </div>
            )}
            {link.utmMedium && (
              <div>
                <span className="text-sm font-medium">utm_medium: </span>
                <span className="text-sm text-gray-600">{link.utmMedium}</span>
              </div>
            )}
            {link.utmCampaign && (
              <div>
                <span className="text-sm font-medium">utm_campaign: </span>
                <span className="text-sm text-gray-600">
                  {link.utmCampaign}
                </span>
              </div>
            )}
            {link.utmTerm && (
              <div>
                <span className="text-sm font-medium">utm_term: </span>
                <span className="text-sm text-gray-600">{link.utmTerm}</span>
              </div>
            )}
            {link.utmContent && (
              <div>
                <span className="text-sm font-medium">utm_content: </span>
                <span className="text-sm text-gray-600">
                  {link.utmContent}
                </span>
              </div>
            )}
            {!link.utmSource &&
              !link.utmMedium &&
              !link.utmCampaign &&
              !link.utmTerm &&
              !link.utmContent && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  پارامتر UTM تنظیم نشده است
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      {/* QR Code and Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <QRCodeDisplay shortCode={link.shortCode} title={link.title} />
        <LinkDetailStats linkId={id} />
      </div>
    </div>
  )
}

