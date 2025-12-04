import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// بررسی وجود NEXTAUTH_SECRET
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set in environment variables')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'ایمیل', type: 'email' },
        password: { label: 'رمز عبور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('لطفاً ایمیل و رمز عبور را وارد کنید')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, name: true, plan: true, role: true },
        })

        if (!user) {
          throw new Error('ایمیل یا رمز عبور اشتباه است')
        }

        const fullUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!fullUser) {
          throw new Error('ایمیل یا رمز عبور اشتباه است')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, fullUser.password)

        if (!isPasswordValid) {
          throw new Error('ایمیل یا رمز عبور اشتباه است')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan || 'FREE',
          role: user.role || 'USER',
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = (user as any).plan || 'FREE'
        token.role = (user as any).role || 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).plan = token.plan || 'FREE'
        ;(session.user as any).role = token.role || 'USER'
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // فعال‌سازی debug در development
}

