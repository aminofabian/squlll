"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Shield, 
  Eye, 
  EyeOff,
  Loader2,
  KeyRound
} from "lucide-react"
import { toast } from 'sonner'
import { cn } from "@/lib/utils"

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
  }
}

function TeacherSignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const subdomain = params.subdomain as string
  const teacherSignup = params['teacher-signup'] as string

  // Validate the route synchronously
  const tokenParam = searchParams.get('token')
  const isValidTokenFormat = /^[A-Za-z0-9+/]+=*$/.test(teacherSignup) && teacherSignup.length > 20
  const hasValidToken = tokenParam || isValidTokenFormat
  
  // Redirect immediately if invalid
  useEffect(() => {
    if (!hasValidToken) {
      router.replace(`/school/${subdomain}/not-found`)
    }
  }, [hasValidToken, router, subdomain])

  // Don't render anything if not a valid route
  if (!hasValidToken) {
    return <div className="min-h-screen bg-gray-50"></div> // Show blank page while redirecting
  }

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<AcceptInvitationResponse | null>(null)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState<string | null>(tokenParam || teacherSignup)

  const form = useForm<TeacherSignupFormValues>({
    resolver: zodResolver(teacherSignupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

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

    try {
      const response = await fetch('/api/auth/accept-teacher-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Teacher invitation acceptance failed')
      }

      if (result.success) {
        const acceptData = {
          message: result.message,
          user: result.user,
          tokens: result.tokens,
          teacher: result.teacher
        }
        setSuccess(acceptData)
        
        // Store tokens in localStorage for client-side access
        localStorage.setItem('accessToken', acceptData.tokens.accessToken)
        localStorage.setItem('refreshToken', acceptData.tokens.refreshToken)
        
        toast.success("Welcome aboard!", {
          description: `Account activated successfully for ${acceptData.user.name}`
        })
        
        // Redirect to teacher dashboard within the same subdomain after 3 seconds
        setTimeout(() => {
          router.push(`/teacher`)
        }, 3000)
      } else {
        throw new Error('No response data received')
      }
    } catch (error) {
      console.error('Teacher signup error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { test: (pass: string) => pass.length >= 8, text: "At least 8 characters" },
    { test: (pass: string) => /[A-Z]/.test(pass), text: "One uppercase letter" },
    { test: (pass: string) => /[a-z]/.test(pass), text: "One lowercase letter" },
    { test: (pass: string) => /[0-9]/.test(pass), text: "One number" },
    { test: (pass: string) => /[^A-Za-z0-9]/.test(pass), text: "One special character" },
  ]

  const password = form.watch("password")
  const passwordStrength = getPasswordStrength(password)

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200 dark:border-green-800 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-green-800 dark:text-green-200">
              Welcome to the Team!
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              Your teacher account has been successfully activated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Account Details
              </p>
              <p className="text-green-700 dark:text-green-300">
                <strong>Name:</strong> {success.user.name}
              </p>
              <p className="text-green-700 dark:text-green-300">
                <strong>Email:</strong> {success.user.email}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to your dashboard...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2">
            Complete Your Signup
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Set up your password to activate your teacher account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Token Status */}
          {token && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
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
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-200">Signup Failed</AlertTitle>
              <AlertDescription className="text-red-600 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                                             <div className="relative">
                         <Input
                           type={showPassword ? "text" : "password"}
                           placeholder="Create a secure password"
                           className={cn(
                             "pr-10 pl-10 h-11",
                             form.formState.errors.password && "border-red-500"
                           )}
                           disabled={isLoading}
                           onFocus={() => setPasswordFocused(true)}
                           {...field}
                           onBlur={() => {
                             field.onBlur()
                             setPasswordFocused(false)
                           }}
                         />
                        <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    
                    {/* Password strength indicator */}
                    {(passwordFocused || password) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            Password strength
                          </span>
                          <span className={cn(
                            "text-xs font-medium",
                            passwordStrength <= 2 && "text-red-600",
                            passwordStrength === 3 && "text-yellow-600",
                            passwordStrength === 4 && "text-blue-600",
                            passwordStrength === 5 && "text-green-600"
                          )}>
                            {getStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              getStrengthColor(passwordStrength)
                            )}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Password requirements */}
                    {(passwordFocused || password) && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Password requirements:
                        </p>
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200",
                              req.test(password) 
                                ? "bg-green-500 scale-110" 
                                : "bg-slate-300 dark:bg-slate-600"
                            )}>
                              {req.test(password) && (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className={cn(
                              "text-xs transition-colors duration-200",
                              req.test(password) 
                                ? "text-green-600 dark:text-green-400" 
                                : "text-slate-500 dark:text-slate-400"
                            )}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className={cn(
                            "pr-10 pl-10 h-11",
                            form.formState.errors.confirmPassword && "border-red-500"
                          )}
                          disabled={isLoading}
                          {...field}
                        />
                        <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading || !token}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Activating Account...
                  </>
                ) : (
                  "Activate Teacher Account"
                )}
              </Button>
            </form>
          </Form>

          {/* Help text */}
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Having trouble? Contact your school administrator for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TeacherSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <TeacherSignupContent />
    </Suspense>
  )
}
