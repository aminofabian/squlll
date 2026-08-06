'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react'
import { debugAuth, checkAuthStatus } from '@/lib/utils'
import { getPostLoginPath, schoolPortalUrl } from '@/lib/auth/post-login-navigation'
import type { HomepageConfig } from '@/lib/types/homepage-config'
import {
  SchoolAuthShell,
  authFieldClass,
  authLabelClass,
  authPrimaryButtonClass,
} from '../(pages)/components/homepage/SchoolAuthShell'

export default function SchoolLoginContent({
  config,
  schoolName,
  subdomain,
  logoUrl,
  tagline,
}: {
  config: HomepageConfig
  schoolName: string
  subdomain: string
  logoUrl?: string
  tagline?: string
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [registeredBanner, setRegisteredBanner] = useState(false)
  const submitInFlight = useRef(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setRegisteredBanner(true)
    }
    const emailFromQuery = searchParams.get('email')
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitInFlight.current) return

    submitInFlight.current = true
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, subdomain }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed')
      }

      if (data.accessToken) {
        try {
          localStorage.setItem('accessToken', data.accessToken)
        } catch {
          /* ignore */
        }
      }

      setTimeout(() => {
        debugAuth()
        checkAuthStatus()
      }, 100)

      const role = data.membership?.role
      const userSubdomain =
        data.tenantSubdomain ||
        data.subdomainUrl?.split('.')[0] ||
        subdomain
      const schoolConfigured = data.schoolConfigured !== false
      const nextPath = getPostLoginPath(role, schoolConfigured)

      window.location.href = schoolPortalUrl(userSubdomain, nextPath)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during sign in',
      )
    } finally {
      submitInFlight.current = false
      setIsLoading(false)
    }
  }

  return (
    <SchoolAuthShell
      config={config}
      schoolName={schoolName}
      logoUrl={logoUrl}
      tagline={tagline}
      eyebrow="Community portal"
      title="Sign in"
      description={`Teachers, students, parents, and staff — access your ${schoolName} portal.`}
      footer={
        <p className="text-xs text-[var(--school-ink)]/50">
          Need an account? Ask your school administrator for an invitation.
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {registeredBanner && (
          <div className="flex items-start gap-2 border-2 border-emerald-600/30 bg-emerald-50 p-3.5 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your school account is ready. Sign in with the email and password
              you just created.
            </span>
          </div>
        )}
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className={authLabelClass(config)}>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={authFieldClass(config)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <Label
            htmlFor="remember"
            className="text-sm font-normal text-[var(--school-ink)]/70"
          >
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={authPrimaryButtonClass(config)}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Access portal
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </SchoolAuthShell>
  )
}
