'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Link2, 
  Plus, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme/ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import PlanBadge from '@/components/plans/PlanBadge'

  const navigation = [
    { name: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
    { name: 'لینک‌های من', href: '/links', icon: Link2 },
    { name: 'ساخت لینک جدید', href: '/links/new', icon: Plus },
    { name: 'تیکت‌های پشتیبانی', href: '/tickets', icon: MessageSquare },
    { name: 'تنظیمات', href: '/settings', icon: Settings },
  ]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-64 transform bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-l border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 px-6 bg-gradient-to-l from-teal-50/50 dark:from-teal-900/20 to-transparent">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                یوتیم کیت
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30 scale-[1.02]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:translate-x-[-4px]'
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Admin Link */}
          {(session?.user as any)?.role === 'ADMIN' && (
            <div className="px-4 pb-4">
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group',
                  pathname.startsWith('/admin')
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:translate-x-[-4px]'
                )}
              >
                <Shield className={cn(
                  "h-5 w-5 transition-transform",
                  pathname.startsWith('/admin') ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                )} />
                پنل مدیریت
              </Link>
            </div>
          )}

          {/* User info */}
          <div className="border-t border-gray-200/60 dark:border-gray-700/60 p-4 bg-gradient-to-t from-gray-50/50 dark:from-gray-800/50 to-transparent">
            <div className="mb-3 px-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">کاربر</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {session?.user?.name || session?.user?.email}
              </div>
              {session?.user && (
                <div className="mt-2">
                  <PlanBadge plan={(session.user as any).plan || 'FREE'} />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              <LogOut className="ml-2 h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pr-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 shadow-sm shadow-gray-100/50 dark:shadow-gray-900/50 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium hidden sm:block">
              {session?.user?.email}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

