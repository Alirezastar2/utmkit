import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔗 در حال اضافه کردن لینک تست...')

  // پیدا کردن کاربر تست
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  })

  if (!user) {
    console.error('❌ کاربر تست یافت نشد. لطفاً ابتدا seed را اجرا کنید.')
    process.exit(1)
  }

  // ایجاد لینک تست برای cloudmahan.com
  const testLink = await prisma.link.upsert({
    where: { shortCode: 'cloudmahan' },
    update: {},
    create: {
      userId: user.id,
      originalUrl: 'https://cloudmahan.com/cart.php?a=confproduct&i=0',
      shortCode: 'cloudmahan',
      title: 'لینک تست - سرور مجازی ابر ماهان',
      utmSource: 'telegram',
      utmMedium: 'channel',
      utmCampaign: 'vps-promotion-2024',
      utmContent: 'test-link',
    },
  })

  console.log('✅ لینک تست با موفقیت ایجاد شد!')
  console.log(`📎 لینک کوتاه: https://utmkit.ir/l/${testLink.shortCode}`)
  console.log(`🔗 لینک اصلی: ${testLink.originalUrl}`)
  console.log(`📊 UTM Source: ${testLink.utmSource}`)
  console.log(`📊 UTM Medium: ${testLink.utmMedium}`)
  console.log(`📊 UTM Campaign: ${testLink.utmCampaign}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ خطا:', e)
    await prisma.$disconnect()
    process.exit(1)
  })


