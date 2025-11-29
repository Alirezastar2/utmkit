export type PlanType = 'FREE' | 'BASIC' | 'PRO'

export interface PlanFeatures {
  unlimitedLinks: boolean
  customDomain: boolean
  customDomainCount: number
  apiAccess: boolean
  advancedAnalytics: boolean
  pdfExport: boolean
  excelExport: boolean
  whiteLabel: boolean
  prioritySupport: boolean
  supportType: 'documentation' | 'ticket' | 'priority'
}

export interface Plan {
  id: PlanType
  name: string
  nameFa: string
  price: number
  priceYearly: number
  features: PlanFeatures
  description: string
}

export const PLANS: Record<PlanType, Plan> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    nameFa: 'رایگان',
    price: 0,
    priceYearly: 0,
    features: {
      unlimitedLinks: true,
      customDomain: false,
      customDomainCount: 0,
      apiAccess: false,
      advancedAnalytics: false,
      pdfExport: false,
      excelExport: false,
      whiteLabel: false,
      prioritySupport: false,
      supportType: 'documentation',
    },
    description: 'برای شروع و تست سرویس',
  },
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    nameFa: 'پایه',
    price: 75000,
    priceYearly: 810000, // 10% discount
    features: {
      unlimitedLinks: true,
      customDomain: true,
      customDomainCount: 1,
      apiAccess: true,
      advancedAnalytics: true,
      pdfExport: true,
      excelExport: true,
      whiteLabel: false,
      prioritySupport: false,
      supportType: 'ticket',
    },
    description: 'برای کسب‌وکارهای کوچک و متوسط',
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    nameFa: 'حرفه‌ای',
    price: 249000,
    priceYearly: 2541600, // 15% discount
    features: {
      unlimitedLinks: true,
      customDomain: true,
      customDomainCount: 999, // Unlimited
      apiAccess: true,
      advancedAnalytics: true,
      pdfExport: true,
      excelExport: true,
      whiteLabel: true,
      prioritySupport: true,
      supportType: 'priority',
    },
    description: 'برای کسب‌وکارهای بزرگ و تیم‌ها',
  },
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price)
}

export function checkPlanFeature(userPlan: PlanType, feature: keyof PlanFeatures): boolean {
  const value = PLANS[userPlan].features[feature]
  return typeof value === 'boolean' ? value : false
}

