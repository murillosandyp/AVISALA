'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const urlError = searchParams.get('error')

  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/check-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok || !data.valid) {
        throw new Error(data.message || 'Invalid email or password')
      }

      setStep('mfa')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleMFA(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      mfaCode,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FFFDF5] p-4">
      <Card className="w-full max-w-md p-8 border-[#E2DBD0] shadow-lg bg-[#FFFDF5]">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#FFFDF5] rounded-full p-2 mb-3 shadow-sm border border-[#E2DBD0]">
            <Image
              src="/logo.png"
              alt="Mi Casa De Cagsawa Guest House logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#103713]">
            Mi Casa De Cagsawa
          </h1>
          <p className="text-sm text-[#628B35] mt-1 tracking-widest font-semibold">
            ADMIN PANEL
          </p>
        </div>

        {(error || urlError) && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm"
          >
            {error || `Authentication error: ${urlError}`}
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentials} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email" className="text-[#103713]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@micasa.com"
                required
                autoComplete="email"
                autoFocus
                className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#103713]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#628B35] hover:bg-[#4f7029] text-[#FFFDF5] focus-visible:ring-[#103713]"
              disabled={loading}
            >
              {loading ? 'Checking…' : 'Continue'}
            </Button>

            <p className="text-xs text-[#103713]/60 text-center mt-4">
              Demo: admin@micasa.com / Admin@123
            </p>
          </form>
        ) : (
          <form onSubmit={handleMFA} className="space-y-4" noValidate>
            <div className="text-center mb-2">
              <p className="text-sm text-[#103713]">
                Enter the 6-digit code from your authenticator app
              </p>
              <p className="text-xs text-[#103713]/60 mt-1">
                (Demo: enter any 6 digits, e.g. <strong>123456</strong>)
              </p>
            </div>

            <div>
              <Label htmlFor="mfa" className="text-[#103713]">
                MFA Code
              </Label>
              <Input
                id="mfa"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                autoFocus
                className="text-center text-2xl tracking-widest border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
                aria-describedby="mfa-help"
              />
              <span id="mfa-help" className="sr-only">
                Enter any six digit code. This is a simulated MFA for the
                prototype.
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#628B35] hover:bg-[#4f7029] text-[#FFFDF5]"
              disabled={loading || mfaCode.length !== 6}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-[#103713]"
              onClick={() => {
                setStep('credentials')
                setMfaCode('')
                setError('')
              }}
            >
              Back
            </Button>
          </form>
        )}
      </Card>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5] text-[#103713]">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}