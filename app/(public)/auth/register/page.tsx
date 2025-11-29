'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type PlanType } from '@/lib/plans'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('FREE')

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && ['FREE', 'BASIC', 'PRO'].includes(planParam)) {
      setSelectedPlan(planParam as PlanType)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan: selectedPlan }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'خطایی در ثبت‌نام رخ داد')
        return
      }

      // Redirect to login
      router.push('/auth/login?registered=true')
    } catch (err) {
      setError('خطایی رخ داد. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 border-gray-200/60 dark:border-gray-700/60">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            ایجاد حساب کاربری
          </CardTitle>
          <CardDescription className="text-base">
            برای شروع، لطفاً اطلاعات خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300 font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">نام</Label>
              <Input
                id="name"
                type="text"
                placeholder="نام شما"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                placeholder="حداقل ۶ کاراکتر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">قبلاً ثبت‌نام کرده‌اید؟ </span>
            <Link href="/auth/login" className="text-primary hover:underline">
              وارد شوید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">در حال بارگذاری...</div>}>
      <RegisterForm />
    </Suspense>
  )
}

