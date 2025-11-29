import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import LinkForm from '@/components/links/LinkForm'

export default async function EditLinkPage({
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
      category: true,
    },
  })

  if (!link) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ویرایش لینک</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          ویرایش اطلاعات و تنظیمات لینک
        </p>
      </div>

      <LinkForm link={link} />
    </div>
  )
}

