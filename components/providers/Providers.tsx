'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import GlobalNavigation from '@/components/layout/GlobalNavigation'
import { usePathname } from 'next/navigation'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Add padding only for dashboard/admin pages, not for public pages
  const isDashboardPage = pathname?.startsWith('/dashboard') || 
                         pathname?.startsWith('/links') || 
                         pathname?.startsWith('/settings') || 
                         pathname?.startsWith('/tickets') ||
                         pathname?.startsWith('/admin')
  
  return (
    <SessionProvider>
      <ThemeProvider>
        <GlobalNavigation />
        <div className={isDashboardPage ? "lg:pr-64 min-h-screen" : ""}>
          {isDashboardPage ? (
            <div className="p-4 lg:p-6">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}

