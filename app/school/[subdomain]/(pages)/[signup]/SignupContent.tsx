'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  CheckCircle2,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { HomepageConfig } from '@/lib/types/homepage-config'
import {
  SchoolAuthShell,
  authFieldClass,
  authLabelClass,
  authPrimaryButtonClass,
} from '../components/homepage/SchoolAuthShell'

const signupSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

interface AcceptInvitationResponse {
  message: string
  user: { id: string; name: string; email: string }
  tokens: { accessToken: string; refreshToken: string }
  staff?: { id: string; name: string; role: string }
  teacher?: { id: string; name: string }
}

type SignupType = 'staff' | 'teacher'

function isValidInviteToken(value: string | undefined | null) {
  return Boolean(
    value &&
      value !== 'signup' &&
      /^[A-Za-z0-9+/]+=*$/.test(value) &&
      value.length > 20,
  )
}

export default function SignupContent({
  config,
  schoolName,
  subdomain,
  signupSegment,
  logoUrl,
  tagline,
}: {
  config: HomepageConfig
  schoolName: string
  subdomain: string
  signupSegment: string
  logoUrl?: string
  tagline?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token')
  const tokenFromPath = isValidInviteToken(signupSegment)
    ? signupSegment
    : null
  const hasValidToken = Boolean(tokenParam || tokenFromPath)

  const [signupType, setSignupType] = useState<SignupType>('teacher')
  const [isDetectingType, setIsDetectingType] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<AcceptInvitationResponse | null>(null)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token] = useState<string | null>(tokenParam || tokenFromPath)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!hasValidToken) {
      setIsDetectingType(false)
      return
    }
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      setSignupType(
        path.includes('staff') || path.includes('admin') ? 'staff' : 'teacher',
      )
    }
    setIsDetectingType(false)
  }, [hasValidToken])

  useEffect(() => {
    if (!hasValidToken) {
      router.replace(`/school/${subdomain}/not-found`)
    }
  }, [hasValidToken, router, subdomain])

  const password = form.watch('password')
  const passwordStrength = (() => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  })()

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  const passwordRequirements = [
    { test: (pass: string) => pass.length >= 8, text: 'At least 8 characters' },
    { test: (pass: string) => /[A-Z]/.test(pass), text: 'One uppercase letter' },
    { test: (pass: string) => /[a-z]/.test(pass), text: 'One lowercase letter' },
    { test: (pass: string) => /[0-9]/.test(pass), text: 'One number' },
    {
      test: (pass: string) => /[^A-Za-z0-9]/.test(pass),
      text: 'One special character',
    },
  ]

  async function onSubmit(data: SignupFormValues) {
    if (!token) {
      setError(
        'Missing invitation token. Please use the link from your invitation email.',
      )
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint =
        signupType === 'staff'
          ? '/api/auth/accept-staff-invitation'
          : '/api/auth/accept-teacher-invitation'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error) {
          let errorMessage = result.error
          if (result.code) errorMessage += ` (${result.code})`
          if (result.details && Array.isArray(result.details)) {
            const detailMessages = result.details
              .map((detail: { message?: string }) => detail.message)
              .filter(Boolean)
            if (detailMessages.length > 0) {
              errorMessage += `\n\nDetails:\n${detailMessages.join('\n')}`
            }
          }
          throw new Error(errorMessage)
        }
        throw new Error(`${signupType} invitation acceptance failed`)
      }

      const acceptData: AcceptInvitationResponse =
        signupType === 'staff'
          ? result
          : {
              message: result.message,
              user: result.user,
              tokens: result.tokens,
              teacher: result.teacher,
            }

      setSuccess(acceptData)
      localStorage.setItem('accessToken', acceptData.tokens.accessToken)
      localStorage.setItem('refreshToken', acceptData.tokens.refreshToken)

      toast.success('Welcome aboard!', {
        description: `Account activated successfully for ${acceptData.user.name}`,
      })

      setTimeout(() => {
        const currentOrigin = window.location.origin
        const currentHost = window.location.host
        let targetUrl: string

        if (currentOrigin.includes('localhost')) {
          targetUrl = `http://${subdomain}.localhost:3001`
        } else {
          const domainParts = currentHost.split('.')
          if (domainParts.length >= 2) {
            const mainDomain = domainParts.slice(1).join('.')
            targetUrl = `https://${subdomain}.${mainDomain}`
          } else {
            targetUrl = `https://${subdomain}.squal.co.ke`
          }
        }

        window.location.href =
          signupType === 'staff'
            ? `${targetUrl}/staff`
            : `${targetUrl}/teacher`
      }, 3000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An error occurred during signup')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasValidToken) {
    return <div className="min-h-screen bg-[var(--school-paper)]" />
  }

  if (isDetectingType) {
    return (
      <SchoolAuthShell
        config={config}
        schoolName={schoolName}
        logoUrl={logoUrl}
        tagline={tagline}
        eyebrow="Invitation"
        title="Checking your invite…"
        description="One moment while we prepare your account setup."
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-[var(--school-ink)]/70">
            Detecting invitation type…
          </p>
        </div>
      </SchoolAuthShell>
    )
  }

  if (success) {
    return (
      <SchoolAuthShell
        config={config}
        schoolName={schoolName}
        logoUrl={logoUrl}
        tagline={tagline}
        eyebrow="You're in"
        title={
          signupType === 'staff' ? 'Welcome to the team' : 'Welcome to the faculty'
        }
        description={
          signupType === 'staff'
            ? 'Your staff account has been activated.'
            : 'Your teacher account has been activated.'
        }
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-sm text-[var(--school-ink)]/70">
            Welcome, <span className="font-semibold">{success.user.name}</span>.
          </p>
          <div className="border-2 border-[var(--school-ink)]/10 bg-white/60 p-4 text-left text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <KeyRound className="h-4 w-4 text-primary" />
              Login credentials
            </div>
            <p className="text-[var(--school-ink)]/60">Email</p>
            <p className="ah-mono mb-2 break-all font-mono text-sm">
              {success.user.email}
            </p>
            <p className="text-xs text-[var(--school-ink)]/50">
              Save your password securely — you&apos;ll need it to sign in.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--school-ink)]/60">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Redirecting to your dashboard…
          </div>
        </div>
      </SchoolAuthShell>
    )
  }

  return (
    <SchoolAuthShell
      config={config}
      schoolName={schoolName}
      logoUrl={logoUrl}
      tagline={tagline}
      eyebrow="Invitation"
      title={
        signupType === 'staff' ? 'Staff account setup' : 'Teacher account setup'
      }
      description={
        signupType === 'staff'
          ? `Complete your ${schoolName} staff account to access the school system.`
          : `Complete your ${schoolName} teacher account to access your teaching dashboard.`
      }
      footer={
        <p className="text-xs text-[var(--school-ink)]/50">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </a>
        </p>
      }
    >
      <div className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {error?.includes('expired') && (
          <Alert className="border-amber-300 bg-amber-50 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <AlertTitle>What to do next</AlertTitle>
            <AlertDescription>
              Your invitation link has expired. Contact your school administrator
              for a new invitation.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={authLabelClass(config)}>
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className={cn(authFieldClass(config), 'pr-10')}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={authLabelClass(config)}>
                    Confirm password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className={cn(authFieldClass(config), 'pr-10')}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {passwordFocused && password && (
              <div className="space-y-3 rounded-md border border-[var(--school-ink)]/10 bg-white/50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Password strength</span>
                  <span className="font-medium">
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        level <= passwordStrength
                          ? getStrengthColor(passwordStrength)
                          : 'bg-[var(--school-ink)]/10',
                      )}
                    />
                  ))}
                </div>
                <ul className="space-y-1">
                  {passwordRequirements.map((requirement) => (
                    <li
                      key={requirement.text}
                      className={cn(
                        'flex items-center gap-2 text-xs',
                        requirement.test(password)
                          ? 'text-emerald-700'
                          : 'text-[var(--school-ink)]/45',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          requirement.test(password)
                            ? 'bg-emerald-500'
                            : 'bg-[var(--school-ink)]/20',
                        )}
                      />
                      {requirement.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              className={authPrimaryButtonClass(config)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up account…
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Complete setup
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </SchoolAuthShell>
  )
}
