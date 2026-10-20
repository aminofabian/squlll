'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthRecoveryShell } from '@/components/auth/AuthRecoveryShell'

const inputClass =
  'h-12 rounded-[2px] border-[#14201b]/15 bg-[#fcfaf4] text-[0.875rem] shadow-none placeholder:text-[#14201b]/30 focus-visible:border-[#1c3d32] focus-visible:ring-2 focus-visible:ring-[#1c3d32]/10'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setMessage(data.message)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthRecoveryShell
      kicker="Password recovery"
      title="Reset access."
      description="Enter the email on your school account and we'll send a link to choose a new password."
    >
      {message ? (
        <div>
          <div className="border-l-2 border-[#a98a55] pl-5">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-[#7c857d]">
              Instructions sent
            </p>
            <p className="mt-2 text-[0.875rem] leading-[1.7] text-[#3f4a43]">{message}</p>
          </div>

          <p className="mt-6 text-[0.75rem] leading-relaxed text-[#7c857d]">
            Check your inbox and spam folder. The link expires after one hour — if
            you didn&apos;t request it, you can safely ignore the email.
          </p>

          <Link href="/login" className="mk-btn mk-btn--ink mt-8 h-12 w-full">
            Back to sign in
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
              htmlFor="email"
              className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]"
            >
              Work email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@schoolname.ac.ke"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mk-btn mk-btn--ink h-12 w-full disabled:cursor-not-allowed disabled:bg-[#14201b]/20 disabled:text-[#14201b]/40"
          >
            {isLoading ? 'Sending…' : 'Send reset instructions'}
            {isLoading ? null : <ArrowRight className="mk-arrow h-3.5 w-3.5" aria-hidden />}
          </button>

          <p className="pt-2 text-[0.6875rem] leading-relaxed text-[#7c857d]">
            For security, reset requests are logged and the link is valid for one
            hour. If you didn&apos;t request this, no action is needed.
          </p>
        </form>
      )}
    </AuthRecoveryShell>
  )
}
