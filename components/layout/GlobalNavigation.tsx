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
  MessageSquare,
  Home,
  DollarSign,
  HelpCircle,
  ArrowUp,
  Crown,
  Bot
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme/ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import PlanBadge from '@/components/plans/PlanBadge'

const dashboardNavigation = [
  { name: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { name: 'لینک‌های من', href: '/links', icon: Link2 },
  { name: 'ساخت لینک جدید', href: '/links/new', icon: Plus },
  { name: 'چت بات', href: '/chat', icon: Bot },
  { name: 'تیکت‌های پشتیبانی', href: '/tickets', icon: MessageSquare },
  { name: 'تنظیمات', href: '/settings', icon: Settings },
]

const publicNavigation = [
  { name: 'خانه', href: '/', icon: Home },
  { name: 'قیمت‌ها', href: '/pricing', icon: DollarSign },
  { name: 'راهنما', href: '/help', icon: HelpCircle },
  { name: 'API', href: '/api-docs', icon: Link2 },
]

export default function GlobalNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  const navigation = session ? dashboardNavigation : publicNavigation
  const isAuthenticated = !!session
  
  // Check if it's a dashboard page
  const isDashboardPage = pathname?.startsWith('/dashboard') || 
                         pathname?.startsWith('/links') || 
                         pathname?.startsWith('/settings') || 
                         pathname?.startsWith('/tickets') ||
                         pathname?.startsWith('/admin')

  // For dashboard pages, show sidebar
  if (isDashboardPage) {
    return (
      <>
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
            <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                یوتیم کیت
              </h1>
            </Link>
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
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
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

            {/* Admin Link - Only for authenticated admins */}
            {isAuthenticated && (session?.user as any)?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group',
                  pathname?.startsWith('/admin')
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:translate-x-[-4px]'
                )}
              >
                <Shield className={cn(
                  "h-5 w-5 transition-transform",
                  pathname?.startsWith('/admin') ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                )} />
                پنل مدیریت
              </Link>
            )}

            {/* Upgrade Plan Link - Only for authenticated users who don't have PRO plan */}
            {isAuthenticated && (session?.user as any)?.plan !== 'PRO' && (
              <Link
                href={(session?.user as any)?.plan === 'FREE' ? '/payment?plan=BASIC' : '/payment?plan=PRO'}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 dark:border-teal-400/20 hover:from-teal-500/20 hover:to-cyan-500/20'
                )}
              >
                <Crown className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span className="text-teal-700 dark:text-teal-300 font-semibold">ارتقا پلن</span>
                <ArrowUp className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-auto" />
              </Link>
            )}

            {/* Pricing Link - For public users */}
            {!isAuthenticated && (
              <Link
                href="/pricing"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group',
                  pathname === '/pricing'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30 scale-[1.02]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:translate-x-[-4px]'
                )}
              >
                <DollarSign className={cn(
                  "h-5 w-5 transition-transform",
                  pathname === '/pricing' ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400"
                )} />
                قیمت‌ها
              </Link>
            )}
          </nav>

          {/* User Section / Auth Section */}
          <div className="border-t border-gray-200/60 dark:border-gray-700/60 p-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {session.user?.name || session.user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.user?.email}
                    </p>
                    <div className="mt-1">
                      <PlanBadge plan={(session.user as any)?.plan || 'FREE'} />
                    </div>
                  </div>
                </div>
                {(session?.user as any)?.plan !== 'PRO' && (
                  <Link href={(session?.user as any)?.plan === 'FREE' ? '/payment?plan=BASIC' : '/payment?plan=PRO'}>
                    <Button
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Crown className="h-4 w-4 ml-2" />
                      ارتقا پلن
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  variant="outline"
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  خروج
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/login" onClick={() => setSidebarOpen(false)}>
                  <Button variant="outline" className="w-full">
                    ورود
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setSidebarOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                    ثبت‌نام
                  </Button>
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 ml-2" />
                  حالت روشن
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 ml-2" />
                  حالت تاریک
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
      </button>
    </>
    )
  }

  // For public pages, show top header
  return (
    <>
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Top Header */}
      <header className="border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              یوتیم کیت
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {publicNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
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

            {/* Auth Buttons - Desktop */}
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost">ورود</Button>
                </Link>
                <Link href="/auth/register" className="hidden sm:block">
                  <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30">
                    شروع کنید
                  </Button>
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    داشبورد
                  </Button>
                </Link>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {publicNavigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              {!isAuthenticated ? (
                <div className="pt-4 space-y-2 border-t border-gray-200/60 dark:border-gray-700/60 mt-4">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      ورود
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                      ثبت‌نام
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 space-y-2 border-t border-gray-200/60 dark:border-gray-700/60 mt-4">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      داشبورد
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    variant="outline"
                    className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4 ml-2" />
                    خروج
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

