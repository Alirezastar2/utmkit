import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ExternalLink, Download } from 'lucide-react'
import LinksTable from '@/components/links/LinksTable'
import BulkImport from '@/components/links/BulkImport'
import { canExport } from '@/lib/plan-checks'

export default async function LinksPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const [links, categories, userCanExport] = await Promise.all([
    prisma.link.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { clicks: true },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.category.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
    }),
    canExport(session.user.id),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">لینک‌های من</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            مدیریت و مشاهده تمام لینک‌های شما
          </p>
        </div>
        <div className="flex gap-3">
          {userCanExport ? (
            <a href="/api/links/export?format=csv" download>
              <Button variant="outline">
                <Download className="ml-2 h-4 w-4" />
                Export CSV
              </Button>
            </a>
          ) : (
            <Link href="/pricing">
              <Button variant="outline" title="این قابلیت فقط در پلن‌های پایه و حرفه‌ای در دسترس است">
                <Download className="ml-2 h-4 w-4" />
                Export CSV
                <span className="mr-2 text-xs text-orange-600">(نیاز به ارتقا)</span>
              </Button>
            </Link>
          )}
          <Link href="/links/new">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              ساخت لینک جدید
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <BulkImport />
        <LinksTable links={links} categories={categories} />
      </div>
    </div>
  )
}

