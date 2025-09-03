"use client"

import { AuthWrapper } from "@/components/auth/AuthFormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useState, useEffect, Suspense } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Info, User, Mail, Building2, KeyRound, RefreshCw, Globe2, ArrowLeft, ArrowRight, Loader2, GraduationCap, Shield, Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
    <AuthWrapper title="Loading...">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-slate-500">Preparing signup form...</p>
      </div>
    </AuthWrapper>
  )
}

const inputStyles = {
  base: `h-12 w-full bg-white border-0 px-4 pl-11 text-slate-900 
    ring-1 ring-inset ring-gray-200
    placeholder:text-gray-400 
    focus:ring-2 focus:ring-inset focus:ring-[#246a59]
    transition-all duration-300 ease-out
    hover:ring-[#246a59]/20`,
  icon: `absolute left-3 top-4 h-4 w-4 text-[#246a59]/60
    transition-all duration-300 ease-out
    group-focus-within:text-[#246a59]
    group-hover:text-[#246a59]/80`,
  label: `text-slate-900 text-[16px] leading-loose mb-3 block relative z-10 font-medium
    flex items-center gap-2
    before:content-[''] before:w-1.5 before:h-1.5 before:bg-[#246a59]/80 before:rounded-sm before:transition-all before:duration-300
    group-focus-within:before:scale-110 group-focus-within:before:bg-[#246a59]`,
  error: "text-sm text-red-500 mt-2 pl-4 border-l-2 border-red-500/30",
  container: `group relative mt-2`,
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

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    if (strength <= 4) return "bg-blue-500"
    return "bg-green-500"
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
      <AuthWrapper title="Account Activated">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2">
              Welcome to the Team!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your teacher account has been successfully activated
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-4">
              Account Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {success.user.name}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {success.user.email}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Role:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  Teacher
                </span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-wide mb-3">
              Next Steps
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Complete your teacher profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Explore your class assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Set up your timetable</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Redirecting to your dashboard in a few seconds...
            </p>
            <Button
              onClick={() => {
                const subdomain = success.teacher?.tenant?.subdomain
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
              }}
              className="w-full bg-primary hover:bg-primary-dark text-white"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper title="Complete Signup">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2">
            Complete Your Signup
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Set up your password to activate your teacher account
          </p>
        </div>

        {/* Token Status */}
        {token && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Invitation Verified
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Your invitation token has been validated successfully
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-200">Signup Failed</AlertTitle>
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className={inputStyles.formItem}>
                  <FormLabel className={inputStyles.label}>
                    <KeyRound className="h-4 w-4" />
                    Password
                  </FormLabel>
                  <div className={inputStyles.container}>
                    <div className="relative">
                      <KeyRound className={inputStyles.icon} />
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className={cn(inputStyles.base, "pr-12")}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={(e) => {
                            setPasswordFocused(false);
                            field.onBlur();
                          }}
                          value={field.value}
                          onChange={field.onChange}
                          name={field.name}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-4 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {passwordFocused && password && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Password Strength
                          </span>
                          <span className={cn("text-xs font-medium", 
                            passwordStrength <= 2 ? "text-red-600" :
                            passwordStrength <= 3 ? "text-yellow-600" :
                            passwordStrength <= 4 ? "text-blue-600" : "text-green-600"
                          )}>
                            {getStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full transition-all duration-300", getStrengthColor(passwordStrength))}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <div className={cn("flex items-center gap-2", password.length >= 8 ? "text-green-600" : "")}>
                            <div className={cn("w-1 h-1 rounded-full", password.length >= 8 ? "bg-green-500" : "bg-gray-300")} />
                            At least 8 characters
                          </div>
                          <div className={cn("flex items-center gap-2", /[A-Z]/.test(password) ? "text-green-600" : "")}>
                            <div className={cn("w-1 h-1 rounded-full", /[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300")} />
                            One uppercase letter
                          </div>
                          <div className={cn("flex items-center gap-2", /[a-z]/.test(password) ? "text-green-600" : "")}>
                            <div className={cn("w-1 h-1 rounded-full", /[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300")} />
                            One lowercase letter
                          </div>
                          <div className={cn("flex items-center gap-2", /[0-9]/.test(password) ? "text-green-600" : "")}>
                            <div className={cn("w-1 h-1 rounded-full", /[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300")} />
                            One number
                          </div>
                          <div className={cn("flex items-center gap-2", /[^A-Za-z0-9]/.test(password) ? "text-green-600" : "")}>
                            <div className={cn("w-1 h-1 rounded-full", /[^A-Za-z0-9]/.test(password) ? "bg-green-500" : "bg-gray-300")} />
                            One special character
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage className={inputStyles.error} />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className={inputStyles.formItem}>
                  <FormLabel className={inputStyles.label}>
                    <Shield className="h-4 w-4" />
                    Confirm Password
                  </FormLabel>
                  <div className={inputStyles.container}>
                    <div className="relative">
                      <Shield className={inputStyles.icon} />
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className={cn(inputStyles.base, "pr-12")}
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-4 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>
                  <FormMessage className={inputStyles.error} />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !token}
              className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-medium transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Activating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Complete Teacher Signup
                </div>
              )}
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Having trouble? Contact your school administrator for assistance.
          </p>
        </div>
      </div>
    </AuthWrapper>
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