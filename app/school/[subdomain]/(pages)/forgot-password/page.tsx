"use client"

import { AuthWrapper } from "@/components/auth/AuthFormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

// Admin Logo Component for Forgot Password
function AdminLogo() {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-2xl">
          <div className="text-white font-mono font-bold text-xl tracking-wider">GA</div>
        </div>
        <div className="cabsolute -top-2 -right-1 w-4 h-4 bg-amber-500 border-2 border-background"></div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-12">
          <AdminLogo />
          
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-600 text-xs font-mono tracking-wide text-amber-600 dark:text-amber-400 uppercase">
              Password Recovery
            </div>
            
            <h1 className="text-3xl font-mono font-bold tracking-wide uppercase">
              <span className="text-slate-900 dark:text-slate-100">RESET</span>
              <span className="text-custom-blue">ACCESS</span>
              <span className="text-slate-600 dark:text-slate-400 block text-lg mt-2">Account Recovery Portal</span>
            </h1>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Enter your email address to receive password reset instructions
            </p>
          </div>
        </div>

        {/* Forgot Password Form */}
        <div className="relative">
          <AuthWrapper 
            title="Password Recovery Request" 
            description="We'll send reset instructions to your registered email"
          >
            {message ? (
              <div className="space-y-6">
                <div className="p-4 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded">
                  <div className="font-medium mb-2">✅ Request Sent</div>
                  <div>{message}</div>
                </div>
                
                <div className="text-center space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">
                    Next Steps
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Check your email inbox and spam folder for the password reset link. 
                    The link will expire in 1 hour for security purposes.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    href="/login"
                    className="block w-full text-center py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-sm uppercase tracking-wide border border-slate-300 dark:border-slate-600"
                  >
                    ← Back to Login
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
                  <Label htmlFor="email" className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Administrator Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your registered email address"
                    className="h-12 border-2 border-slate-300 dark:border-slate-600 focus:border-slate-500 font-mono bg-slate-50 dark:bg-slate-900 placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-8 bg-amber-600 hover:bg-amber-700 text-white font-mono tracking-wide uppercase text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Sending Reset Link...' : 'Send Reset Instructions'}
                </Button>

                <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6">
                  <div className="text-center space-y-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">
                      Security Information
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Password reset requests are logged for security. The reset link will be valid for 1 hour only.
                      If you didn't request this, you can safely ignore this action.
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
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-950 border-2 border-amber-200 dark:border-amber-800">
              <div className="w-3 h-3 bg-amber-500"></div>
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                RECOVERY MODE
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