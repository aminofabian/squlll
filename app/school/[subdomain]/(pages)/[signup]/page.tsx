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
  UserPlus, 
  GraduationCap,
  Shield, 
  Eye, 
  EyeOff,
  Loader2,
  KeyRound
} from "lucide-react"
import { toast } from 'sonner'
import { cn } from "@/lib/utils"

// Form validation schema for signup
const signupSchema = z.object({
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

type SignupFormValues = z.infer<typeof signupSchema>

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
  staff?: {
    id: string
    name: string
    role: string
  }
  teacher?: {
    id: string
    name: string
  }
}

type SignupType = 'staff' | 'teacher'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const subdomain = params.subdomain as string
  const signupToken = params.signup as string

  // Validate the route synchronously
  const tokenParam = searchParams.get('token')
  // Check if signupToken is actually a token (not the literal "signup" string)
  const isSignupTokenValid = signupToken && signupToken !== 'signup' && /^[A-Za-z0-9+/]+=*$/.test(signupToken) && signupToken.length > 20
  const hasValidToken = tokenParam || isSignupTokenValid
  
  // Determine signup type based on token or URL pattern
  const determineSignupType = async (): Promise<SignupType> => {
    const token = tokenParam || (isSignupTokenValid ? signupToken : null)
    if (!token) return 'teacher' // fallback
    
    try {
      // Test both endpoints to see which one accepts the token
      // We'll use a simple password to test the token validity
      const testPassword = "TestPassword123!"
      
      // Test teacher invitation first
      const teacherResponse = await fetch('/api/auth/accept-teacher-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: testPassword })
      })
      
      if (teacherResponse.ok) {
        const teacherData = await teacherResponse.json()
        if (teacherData.error && !teacherData.error.includes('Password')) {
          // Token is valid for teacher but password is wrong (which is expected)
          return 'teacher'
        }
      }
      
      // Test staff invitation
      const staffResponse = await fetch('/api/auth/accept-staff-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: testPassword })
      })
      
      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        if (staffData.error && !staffData.error.includes('Password')) {
          // Token is valid for staff but password is wrong (which is expected)
          return 'staff'
        }
      }
      
      // If we can't determine, default to teacher
      return 'teacher'
    } catch (error) {
      console.error('Error determining signup type:', error)
      return 'teacher' // fallback to teacher
    }
  }

  const [signupType, setSignupType] = useState<SignupType>('teacher')
  const [isDetectingType, setIsDetectingType] = useState(true)
  
  // Determine signup type on component mount
  useEffect(() => {
    const detectType = async () => {
      setIsDetectingType(true)
      try {
        const detectedType = await determineSignupType()
        setSignupType(detectedType)
      } catch (error) {
        console.error('Error detecting signup type:', error)
        setSignupType('teacher') // fallback
      } finally {
        setIsDetectingType(false)
      }
    }
    
    if (hasValidToken) {
      detectType()
    } else {
      setIsDetectingType(false)
    }
  }, [hasValidToken])

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

  // Show loading state while detecting signup type
  if (isDetectingType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-blue-200 dark:border-blue-800 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-blue-800 dark:text-blue-200">
              Detecting Invitation Type
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Please wait while we determine your invitation type...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<AcceptInvitationResponse | null>(null)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState<string | null>(tokenParam || (isSignupTokenValid ? signupToken : null))

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
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

  async function onSubmit(data: SignupFormValues) {
    if (!token) {
      setError("Missing invitation token. Please use the link from your invitation email.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = signupType === 'staff' 
        ? '/api/auth/accept-staff-invitation'
        : '/api/auth/accept-teacher-invitation'

      console.log('Submitting to endpoint:', endpoint, 'with signup type:', signupType)

      const response = await fetch(endpoint, {
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
        throw new Error(result.error || `${signupType} invitation acceptance failed`)
      }

      // Handle different response formats
      let acceptData: AcceptInvitationResponse
      if (signupType === 'staff') {
        acceptData = result
      } else {
        // Teacher response format
        acceptData = {
          message: result.message,
          user: result.user,
          tokens: result.tokens,
          teacher: result.teacher
        }
      }

      setSuccess(acceptData)
      
      // Store tokens in localStorage for client-side access
      localStorage.setItem('accessToken', acceptData.tokens.accessToken)
      localStorage.setItem('refreshToken', acceptData.tokens.refreshToken)
      
      toast.success("Welcome aboard!", {
        description: `Account activated successfully for ${acceptData.user.name}`
      })
      
      // Redirect to appropriate dashboard after 3 seconds
      setTimeout(() => {
        const redirectPath = signupType === 'staff' ? '/staff' : '/teacher'
        router.push(redirectPath)
      }, 3000)
    } catch (error) {
      console.error(`${signupType} signup error:`, error)
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

  const getIcon = () => {
    return signupType === 'staff' ? <UserPlus className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />
  }

  const getTitle = () => {
    return signupType === 'staff' ? 'Staff Account Setup' : 'Teacher Account Setup'
  }

  const getDescription = () => {
    return signupType === 'staff' 
      ? 'Complete your staff account setup to access the school management system'
      : 'Complete your teacher account setup to access your teaching dashboard'
  }

  const getSuccessTitle = () => {
    return signupType === 'staff' ? 'Welcome to the Team!' : 'Welcome to the Faculty!'
  }

  const getSuccessDescription = () => {
    return signupType === 'staff'
      ? 'Your staff account has been successfully activated'
      : 'Your teacher account has been successfully activated'
  }

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
              {getSuccessTitle()}
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              {getSuccessDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, <span className="font-semibold">{success.user.name}</span>!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Redirecting you to your dashboard...
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-blue-800 dark:text-blue-200">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pr-10"
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

              {/* Password Strength Indicator */}
              {passwordFocused && password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password Strength:</span>
                    <span className={cn(
                      "font-medium",
                      passwordStrength <= 2 ? "text-red-600" :
                      passwordStrength <= 3 ? "text-yellow-600" :
                      passwordStrength <= 4 ? "text-blue-600" : "text-green-600"
                    )}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-2 flex-1 rounded-full transition-colors",
                          level <= passwordStrength 
                            ? getStrengthColor(passwordStrength)
                            : "bg-gray-200 dark:bg-gray-700"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {passwordFocused && password && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password Requirements:
                  </p>
                  <div className="space-y-1">
                    {passwordRequirements.map((requirement, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-2 text-sm",
                          requirement.test(password)
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          requirement.test(password)
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        )} />
                        {requirement.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up account...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By completing this setup, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
} 