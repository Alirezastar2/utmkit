import { prisma } from '@/lib/prisma'
import { checkPlanFeature, type PlanType } from '@/lib/plans'

export async function getUserPlan(userId: string): Promise<PlanType> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })
  return (user?.plan || 'FREE') as PlanType
}

export async function canExport(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  return checkPlanFeature(plan, 'pdfExport')
}

export async function canUseAPI(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  return checkPlanFeature(plan, 'apiAccess')
}

export async function canUseCustomDomain(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  return checkPlanFeature(plan, 'customDomain')
}

export async function hasAdvancedAnalytics(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  return checkPlanFeature(plan, 'advancedAnalytics')
}






