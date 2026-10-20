'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthRecoveryShell } from '@/components/auth/AuthRecoveryShell'
import { SqulWordmark } from '@/components/brand/SqulMark'

const inputClass =
  'h-12 rounded-[2px] border-[#14201b]/15 bg-[#fcfaf4] text-[0.875rem] shadow-none placeholder:text-[#14201b]/30 focus-visible:border-[#1c3d32] focus-visible:ring-2 focus-visible:ring-[#1c3d32]/10'

function ResetPasswordLoading() {
  return (
    <div className="onboarding-flow flex min-h-screen flex-col items-center justify-center bg-[#f7f4ec]">
      <SqulWordmark markSize={30} />
      <div className="mt-8 flex items-center gap-2.5 text-[0.625rem] uppercase tracking-[0.18em] text-[#7c857d]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Preparing your reset…
      </div>
    </div>
  )
}

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setMessage(data.message)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthRecoveryShell
      kicker="New password"
      title="Choose a new password."
      description="Pick something you haven't used before — at least eight characters, ideally with a number and a symbol."
    >
      {!token ? (
        <div>
          <div className="border-l-2 border-[#a04a3a] pl-5">
            <p className="text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
              Link expired
            </p>
            <p className="mt-2 text-[0.875rem] leading-[1.7] text-[#3f4a43]">
              {error || 'This reset link is invalid or has expired.'}
            </p>
          </div>
          <Link href="/forgot-password" className="mk-btn mk-btn--ink mt-8 h-12 w-full">
            Request a new link
            <ArrowRight className="mk-arrow h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link href="/login" className="mk-link mt-6">
            Back to sign in
          </Link>
        </div>
      ) : message ? (
        <div>
          <div className="border-l-2 border-[#a98a55] pl-5">
            <p className="text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
              Password updated
            </p>
            <p className="mt-2 text-[0.875rem] leading-[1.7] text-[#3f4a43]">{message}</p>
          </div>
          <p className="mt-6 text-[0.75rem] leading-relaxed text-[#7c857d]">
            You&apos;ll be taken to sign in in a few seconds. Use your new password
            on every device from now on.
          </p>
          <Link href="/login" className="mk-btn mk-btn--ink mt-8 h-12 w-full">
            Continue to sign in
            <ArrowRight className="mk-arrow h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="border-l-2 border-[#a04a3a] py-1 pl-4 text-[0.8125rem] leading-relaxed text-[#8a3a2c]"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]"
            >
              New password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]"
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <ul className="border-t border-[#14201b]/10 pt-4">
            {[
              'At least 8 characters',
              'A mix of letters, numbers and symbols',
              'Nothing you have used before',
            ].map((rule) => (
              <li
                key={rule}
                className="flex items-baseline gap-2.5 py-1 text-[0.6875rem] leading-relaxed text-[#7c857d]"
              >
                <span className="h-[3px] w-[3px] shrink-0 translate-y-[-2px] rounded-full bg-[#a98a55]" />
                {rule}
              </li>
            ))}
          </ul>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="mk-btn mk-btn--ink h-12 w-full disabled:cursor-not-allowed disabled:bg-[#14201b]/20 disabled:text-[#14201b]/40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              <>
                Update password
                <ArrowRight className="mk-arrow h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </button>

          <p className="pt-1 text-[0.6875rem] leading-relaxed text-[#7c857d]">
            After updating, you&apos;ll need to sign in again on every device.
            This action is logged for security.
          </p>
        </form>
      )}
    </AuthRecoveryShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
