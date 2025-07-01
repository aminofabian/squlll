"use client"

import { AuthWrapper } from "@/components/auth/AuthFormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"

// Admin Logo Component for Reset Password
function AdminLogo() {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-2xl">
          <div className="text-white font-mono font-bold text-xl tracking-wider">GA</div>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-background"></div>
      </div>
    </div>
  )
}

// Loading component to show while suspense is loading
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue mx-auto"></div>
        <p className="mt-4 text-slate-500">Loading...</p>
      </div>
    </div>
  )
}

// Component that uses useSearchParams - wrapped in Suspense
function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [token, setToken] = useState("")
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Invalid or missing reset token. Please request a new password reset.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (!token && !error) {
    return <ResetPasswordLoading />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-12">
          <AdminLogo />
          
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-600 text-xs font-mono tracking-wide text-blue-600 dark:text-blue-400 uppercase">
              Password Reset
            </div>
            
            <h1 className="text-3xl font-mono font-bold tracking-wide uppercase">
              <span className="text-slate-900 dark:text-slate-100">NEW</span>
              <span className="text-custom-blue">PASSWORD</span>
              <span className="text-slate-600 dark:text-slate-400 block text-lg mt-2">Secure Access Recovery</span>
            </h1>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Enter your new password to regain access to your account
            </p>
          </div>
        </div>

        {/* Reset Password Form */}
        <div className="relative">
          <AuthWrapper 
            title="Set New Password" 
            description="Choose a strong password for your administrator account"
          >
            {message ? (
              <div className="space-y-6">
                <div className="p-4 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded">
                  <div className="font-medium mb-2">✅ Password Reset Successful</div>
                  <div>{message}</div>
                </div>
                
                <div className="text-center space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">
                    Redirecting...
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    You will be automatically redirected to the login page in a few seconds.
                    You can now sign in with your new password.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    href="/login"
                    className="block w-full text-center py-3 px-4 bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-sm uppercase tracking-wide border border-emerald-300 dark:border-emerald-600"
                  >
                    Continue to Login →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    New Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your new secure password"
                    className="h-12 border-2 border-slate-300 dark:border-slate-600 focus:border-slate-500 font-mono bg-slate-50 dark:bg-slate-900 placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Confirm Password
                  </Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm your new password"
                    className="h-12 border-2 border-slate-300 dark:border-slate-600 focus:border-slate-500 font-mono bg-slate-50 dark:bg-slate-900 placeholder:text-slate-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wide mb-2">
                    Password Requirements
                  </p>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <li>• Minimum 8 characters</li>
                    <li>• Use a combination of letters, numbers, and symbols</li>
                    <li>• Avoid common passwords and personal information</li>
                  </ul>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full h-12 mt-8 bg-blue-600 hover:bg-blue-700 text-white font-mono tracking-wide uppercase text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </Button>

                <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6">
                  <div className="text-center space-y-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">
                      Security Notice
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      After updating your password, you will need to sign in again on all devices.
                      This action will be logged for security purposes.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/login"
                    className="block w-full text-center py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-sm uppercase tracking-wide border border-slate-300 dark:border-slate-600"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}
          </AuthWrapper>
          
          {/* System Status */}
          <div className="absolute -top-3 -right-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800">
              <div className="w-3 h-3 bg-blue-500"></div>
              <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                RESET MODE
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              SQUL Admin v2.1.0
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <Link 
              href="/docs" 
              className="text-xs font-mono text-custom-blue hover:text-custom-blue/80 uppercase tracking-wide"
            >
              System Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
} 