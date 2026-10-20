"use client"

import { AuthRecoveryShell } from "@/components/auth/AuthRecoveryShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useState, useEffect, Suspense } from "react"
import { KeyRound, Loader2, Shield, Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils"
import { toast } from 'sonner'

// Form validation schema for teacher signup
const teacherSignupSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type TeacherSignupFormValues = z.infer<typeof teacherSignupSchema>

interface AcceptInvitationResponse {
  message: string
  user: {
    id: string
    name: string
    email: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
  teacher: {
    id: string
    name: string
    tenant?: {
      id: string
      subdomain: string
      schoolName: string
    }
  }
}

// Loading component for Suspense fallback
function SignupLoading() {
  return (
    <div className="onboarding-flow flex min-h-screen flex-col items-center justify-center bg-[#f7f4ec]">
      <Loader2 className="h-5 w-5 animate-spin text-[#1c3d32]" />
      <p className="mt-4 text-[0.625rem] uppercase tracking-[0.18em] text-[#7c857d]">
        Preparing your invitation…
      </p>
    </div>
  )
}

const inputStyles = {
  base: `h-12 w-full rounded-[2px] border border-[#14201b]/15 bg-[#fcfaf4] px-4 pl-10
    text-[0.875rem] text-[#14201b] shadow-none
    placeholder:text-[#14201b]/30
    focus:border-[#1c3d32] focus:ring-2 focus:ring-[#1c3d32]/10
    transition-colors duration-200`,
  icon: `pointer-events-none absolute left-3 top-4 h-3.5 w-3.5 text-[#7c857d]`,
  label: `mb-2 flex items-center gap-2 text-[0.625rem] font-medium uppercase
    tracking-[0.14em] text-[#4d574f]`,
  error: "mt-2 text-[0.6875rem] text-[#a04a3a]",
  container: `relative mt-2`,
  formItem: `mb-6`,
}

function TeacherSignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<AcceptInvitationResponse | null>(null)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<TeacherSignupFormValues>({
    resolver: zodResolver(teacherSignupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Extract token from URL on component mount
  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Invalid invitation link. Please check your email for the correct signup link.")
    }
  }, [searchParams.get('token')])

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  async function onSubmit(data: TeacherSignupFormValues) {
    if (!token) {
      setError("Missing invitation token. Please use the link from your invitation email.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Removed GraphQL mutation - now using REST API endpoint

    try {
      const response = await fetch('/api/auth/accept-teacher-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Teacher invitation acceptance failed')
      }

      if (result.success) {
        setSuccess(result)
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', result.tokens.accessToken)
        localStorage.setItem('refreshToken', result.tokens.refreshToken)
        
        toast.success("Welcome aboard!", {
          description: `Account activated successfully for ${result.user.name}`
        })
        
        // Redirect to school's teacher portal after 3 seconds
        setTimeout(() => {
          const subdomain = result.teacher?.tenant?.subdomain
          if (subdomain) {
            // Redirect to the school's teacher portal
            const isProd = window.location.hostname !== 'localhost'
            const baseUrl = isProd 
              ? `https://${subdomain}.squl.co.ke` 
              : `http://${subdomain}.localhost:3001`
            window.location.href = `${baseUrl}/teacher`
          } else {
            // Fallback to generic teacher route if no subdomain available
            router.push('/teacher')
          }
        }, 3000)
      } else {
        throw new Error('No response data received')
      }
    } catch (err) {
      console.error('Teacher signup error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  const password = form.watch("password")
  const passwordStrength = getPasswordStrength(password || "")

  if (success) {
    return (
      <AuthRecoveryShell
        kicker="Teacher invitation"
        title="You're in."
        description="Your teacher account is active. Continue to your school workspace to see classes, timetable and messages."
      >
        <div className="border-y border-[#14201b]/10">
          {[
            ['Name', success.user.name],
            ['Email', success.user.email],
            ['School', success.teacher?.tenant?.schoolName ?? 'Your school'],
            ['Role', 'Teacher'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 border-b border-[#14201b]/8 py-3 last:border-b-0"
            >
              <span className="text-[0.625rem] uppercase tracking-[0.12em] text-[#7c857d]">
                {label}
              </span>
              <span className="truncate text-right text-[0.8125rem] font-medium text-[#14201b]">
                {value}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[0.75rem] leading-relaxed text-[#7c857d]">
          Taking you to your dashboard in a few seconds…
        </p>

        <Button
          onClick={() => {
            const subdomain = success.teacher?.tenant?.subdomain
            if (subdomain) {
              const isProd = window.location.hostname !== 'localhost'
              const baseUrl = isProd
                ? `https://${subdomain}.squl.co.ke`
                : `http://${subdomain}.localhost:3001`
              window.location.href = `${baseUrl}/teacher`
            } else {
              router.push('/teacher')
            }
          }}
          className="mt-6 h-12 w-full rounded-[2px] bg-[#14201b] text-[0.8125rem] font-medium text-[#f7f4ec] shadow-none hover:bg-[#1c3d32]"
        >
          Continue to dashboard
        </Button>
      </AuthRecoveryShell>
    )
  }

  return (
    <AuthRecoveryShell
      kicker="Teacher invitation"
      title="Activate your account."
      description="Set a password to join your school's workspace. Your invitation link has been verified."
    >
      {error && (
        <div
          role="alert"
          className="mb-6 border-l-2 border-[#a04a3a] py-1 pl-4 text-[0.8125rem] leading-relaxed text-[#8a3a2c]"
        >
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className={inputStyles.formItem}>
                <FormLabel className={inputStyles.label}>
                  <KeyRound className="h-3 w-3" />
                  Password
                </FormLabel>
                <div className={inputStyles.container}>
                  <div className="relative">
                    <KeyRound className={inputStyles.icon} />
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className={cn(inputStyles.base, 'pr-12')}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={(e) => {
                          setPasswordFocused(false)
                          field.onBlur()
                        }}
                        value={field.value}
                        onChange={field.onChange}
                        name={field.name}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-4 h-4 w-4 text-[#7c857d] transition-colors hover:text-[#14201b]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  {passwordFocused && password && (
                    <div className="mt-3 border border-[#14201b]/10 bg-[#efeadd] p-3.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[0.625rem] uppercase tracking-[0.12em] text-[#4d574f]">
                          Strength
                        </span>
                        <span
                          className={cn(
                            'text-[0.625rem] font-medium uppercase tracking-[0.1em]',
                            passwordStrength <= 2
                              ? 'text-[#a04a3a]'
                              : passwordStrength <= 3
                                ? 'text-[#a98a55]'
                                : 'text-[#1c3d32]',
                          )}
                        >
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className="h-px w-full bg-[#14201b]/10">
                        <div
                          className={cn(
                            'h-px transition-all duration-200',
                            passwordStrength <= 2
                              ? 'bg-[#a04a3a]'
                              : passwordStrength <= 3
                                ? 'bg-[#a98a55]'
                                : 'bg-[#1c3d32]',
                          )}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <ul className="mt-3 space-y-1">
                        {[
                          ['At least 8 characters', password.length >= 8],
                          ['One uppercase letter', /[A-Z]/.test(password)],
                          ['One lowercase letter', /[a-z]/.test(password)],
                          ['One number', /[0-9]/.test(password)],
                          ['One special character', /[^A-Za-z0-9]/.test(password)],
                        ].map(([label, met]) => (
                          <li
                            key={label as string}
                            className={cn(
                              'flex items-center gap-2 text-[0.6875rem]',
                              met ? 'text-[#1c3d32]' : 'text-[#7c857d]',
                            )}
                          >
                            <span
                              className={cn(
                                'h-[3px] w-[3px] rounded-full',
                                met ? 'bg-[#1c3d32]' : 'bg-[#14201b]/25',
                              )}
                            />
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <FormMessage className={inputStyles.error} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className={inputStyles.formItem}>
                <FormLabel className={inputStyles.label}>
                  <Shield className="h-3 w-3" />
                  Confirm password
                </FormLabel>
                <div className={inputStyles.container}>
                  <div className="relative">
                    <Shield className={inputStyles.icon} />
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        className={cn(inputStyles.base, 'pr-12')}
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-4 h-4 w-4 text-[#7c857d] transition-colors hover:text-[#14201b]"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
                <FormMessage className={inputStyles.error} />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading || !token}
            className="h-12 w-full rounded-[2px] bg-[#14201b] text-[0.8125rem] font-medium text-[#f7f4ec] shadow-none transition-colors duration-200 hover:bg-[#1c3d32] disabled:bg-[#14201b]/20 disabled:text-[#14201b]/40"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating…
              </span>
            ) : (
              'Activate account'
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-8 border-t border-[#14201b]/10 pt-5 text-[0.6875rem] leading-relaxed text-[#7c857d]">
        Having trouble? Ask your school administrator for a fresh invitation, or{' '}
        <Link href="/login" className="text-[#14201b] underline decoration-[#14201b]/25 underline-offset-4">
          sign in
        </Link>
        .
      </p>
    </AuthRecoveryShell>
  )
}

// Main page component with Suspense boundary
export default function TeacherSignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <TeacherSignupForm />
    </Suspense>
  )
}