import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.nameEn,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#14b8a6',
    orientation: 'portrait',
    // آیکون‌ها موقتاً حذف شدند تا خطای 404 ایجاد نشود
    // برای اضافه کردن آیکون‌ها، فایل‌های icon-192x192.png و icon-512x512.png را در پوشه public قرار دهید
    // سپس این بخش را uncomment کنید:
    // icons: [
    //   {
    //     src: '/icon-192x192.png',
    //     sizes: '192x192',
    //     type: 'image/png',
    //     purpose: 'any',
    //   },
    //   {
    //     src: '/icon-512x512.png',
    //     sizes: '512x512',
    //     type: 'image/png',
    //     purpose: 'any',
    //   },
    // ],
    lang: 'fa',
    dir: 'rtl',
    categories: ['business', 'productivity', 'utilities'],
  }
}

