import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mfaCode: { label: 'MFA Code', type: 'text' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Attempt:', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing email or password')
          throw new Error('Email and password required')
        }

        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          console.log('[AUTH] User not found')
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          console.log('[AUTH] Bad password')
          throw new Error('Invalid email or password')
        }

        // Simulated MFA: accept any 6 digits
        if (!credentials.mfaCode || credentials.mfaCode.length !== 6) {
          console.log('[AUTH] Bad MFA code')
          throw new Error('MFA code must be 6 digits')
        }

        console.log('[AUTH] Success:', user.email)

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: '/login',
    error: '/login',   // ← send auth errors back to login page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,   // ← enables detailed logging
}