import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 شروع seed کردن دیتابیس...')

  // ایجاد کاربر ادمین
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'مدیر سیستم',
      role: 'ADMIN',
      plan: 'PRO',
    },
  })

  console.log('✅ کاربر ادمین ایجاد شد:', admin.email, '(رمز: admin123)')

  // ایجاد کاربر تست
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'کاربر تست',
      role: 'USER',
    },
  })

  console.log('✅ کاربر تست ایجاد شد:', user.email)

  // ایجاد چند لینک نمونه
  const links = [
    {
      userId: user.id,
      originalUrl: 'https://example.com/product',
      shortCode: 'abc123',
      title: 'لینک محصول اصلی',
      utmSource: 'instagram',
      utmMedium: 'story',
      utmCampaign: 'summer-sale',
    },
    {
      userId: user.id,
      originalUrl: 'https://example.com/about',
      shortCode: 'xyz789',
      title: 'صفحه درباره ما',
      utmSource: 'whatsapp',
      utmMedium: 'message',
      utmCampaign: 'winter-promo',
      utmContent: 'banner-top',
    },
    {
      userId: user.id,
      originalUrl: 'https://example.com/contact',
      shortCode: 'def456',
      title: 'تماس با ما',
      utmSource: 'telegram',
      utmMedium: 'channel',
      utmCampaign: 'newsletter',
    },
  ]

  for (const linkData of links) {
    const link = await prisma.link.upsert({
      where: { shortCode: linkData.shortCode },
      update: {},
      create: linkData,
    })

    console.log('✅ لینک ایجاد شد:', link.shortCode)

    // ایجاد کلیک‌های نمونه برای هر لینک
    const clickCount = Math.floor(Math.random() * 20) + 5 // 5 تا 25 کلیک
    const clicks = []
    
    for (let i = 0; i < clickCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30) // در 30 روز گذشته
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - daysAgo)
      createdAt.setHours(Math.floor(Math.random() * 24))
      createdAt.setMinutes(Math.floor(Math.random() * 60))

      const deviceTypes = ['MOBILE', 'DESKTOP', 'TABLET', 'UNKNOWN']
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]

      clicks.push({
        linkId: link.id,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: deviceType === 'MOBILE' 
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referer: i % 3 === 0 ? 'https://instagram.com' : i % 3 === 1 ? 'https://whatsapp.com' : null,
        deviceType,
        os: deviceType === 'MOBILE' ? 'iOS' : 'Windows',
        browser: 'Chrome',
        createdAt,
      })
    }

    await prisma.click.createMany({
      data: clicks,
    })

    console.log(`✅ ${clickCount} کلیک نمونه برای لینک ${link.shortCode} ایجاد شد`)
  }

  console.log('🎉 Seed با موفقیت انجام شد!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ خطا در seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

