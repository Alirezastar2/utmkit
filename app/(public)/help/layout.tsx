import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

const faqs = [
  {
    question: 'چگونه لینک کوتاه بسازم؟',
    answer: 'برای ساخت لینک کوتاه، به صفحه "ساخت لینک جدید" بروید، لینک اصلی خود را وارد کنید و در صورت نیاز پارامترهای UTM را تنظیم کنید.',
  },
  {
    question: 'پارامترهای UTM چیست؟',
    answer: 'پارامترهای UTM به شما کمک می‌کنند تا منبع ترافیک وب‌سایت خود را ردیابی کنید.',
  },
  {
    question: 'چگونه می‌توانم آمار کلیک‌های لینک خود را ببینم؟',
    answer: 'برای مشاهده آمار، به صفحه "لینک‌های من" بروید و روی دکمه "جزئیات" در کنار لینک مورد نظر کلیک کنید.',
  },
]

export const metadata: Metadata = genMeta({
  title: 'راهنما و پشتیبانی',
  description: 'راهنمای کامل استفاده از یوتیم کیت، سوالات متداول، آموزش UTM tracking و پشتیبانی.',
  keywords: ['راهنما', 'پشتیبانی', 'سوالات متداول', 'FAQ', 'آموزش', 'help'],
  url: '/help',
})

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}

