'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'
import type { HomepageConfig } from '@/lib/types/homepage-config'
import {
  SchoolAuthShell,
  authFieldClass,
  authLabelClass,
  authPrimaryButtonClass,
} from '../(pages)/components/homepage/SchoolAuthShell'

export default function ForgotPasswordContent({
  config,
  schoolName,
  logoUrl,
  tagline,
}: {
  config: HomepageConfig
  schoolName: string
  logoUrl?: string
  tagline?: string
}) {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SchoolAuthShell
      config={config}
      schoolName={schoolName}
      logoUrl={logoUrl}
      tagline={tagline}
      eyebrow="Account recovery"
      title="Reset your password"
      description={`Enter the email for your ${schoolName} account and we'll send reset instructions.`}
      footer={
        <Link
          href="/login"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Back to sign in
        </Link>
      }
    >
      {message ? (
        <div className="space-y-4">
          <div className="border-2 border-emerald-600/30 bg-emerald-50 p-3.5 text-sm text-emerald-900">
            <p className="font-semibold">Request sent</p>
            <p className="mt-1">{message}</p>
          </div>
          <p className="text-sm text-[var(--school-ink)]/60">
            Check your inbox and spam folder. The link expires in one hour.
          </p>
          <Button asChild className={authPrimaryButtonClass(config)}>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="border-2 border-red-500/30 bg-red-50 p-3.5 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className={authLabelClass(config)}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@school.edu"
              className={authFieldClass(config)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={authPrimaryButtonClass(config)}
          >
            {isLoading ? 'Sending…' : 'Send reset instructions'}
          </Button>
        </form>
      )}
    </SchoolAuthShell>
  )
}
