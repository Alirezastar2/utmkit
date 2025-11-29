import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.role === 'ADMIN'
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('دسترسی غیرمجاز: فقط ادمین‌ها می‌توانند به این بخش دسترسی داشته باشند')
  }
  return true
}





