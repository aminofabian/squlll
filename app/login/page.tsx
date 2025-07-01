"use client"

import { AuthWrapper } from "@/components/auth/AuthFormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

// Admin Logo Component for Login
function AdminLogo() {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-2xl">
          <div className="text-white font-mono font-bold text-xl tracking-wider">GA</div>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background"></div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed')
      }

      // Redirect based on user role
      if (data.membership?.role === 'ADMIN') {
        router.push('/dashboard')
      } else {
        // Redirect to appropriate subdomain for teachers/students
        if (data.subdomainUrl) {
          window.location.href = `https://${data.subdomainUrl}`
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign in')
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
            <div className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-mono tracking-wide text-slate-600 dark:text-slate-400 uppercase">
              Restricted Access
            </div>
            
            <h1 className="text-3xl font-mono font-bold tracking-wide uppercase">
              <span className="text-slate-900 dark:text-slate-100">GAME</span>
              <span className="text-custom-blue">API</span>
              <span className="text-slate-600 dark:text-slate-400 block text-lg mt-2">Administration Portal</span>
            </h1>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Enter your administrator credentials to access the control panel
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="relative">
          <AuthWrapper 
            title="System Authentication" 
            description="This system is restricted to authorized personnel only"
          >
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
                  placeholder="Enter your admin email"
                  className="h-12 border-2 border-slate-300 dark:border-slate-600 focus:border-slate-500 font-mono bg-slate-50 dark:bg-slate-900 placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Access Code
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your secure password"
                  className="h-12 border-2 border-slate-300 dark:border-slate-600 focus:border-slate-500 font-mono bg-slate-50 dark:bg-slate-900 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input 
                    id="remember" 
                    type="checkbox" 
                    className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                  />
                  <Label htmlFor="remember" className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Remember Session
                  </Label>
                </div>
                
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-mono text-custom-blue hover:text-custom-blue/80 uppercase tracking-wide"
                >
                  Reset Access
                </Link>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-8 bg-slate-900 hover:bg-slate-800 text-white font-mono tracking-wide uppercase text-sm disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Authenticate & Access'}
              </Button>

              <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6">
                <div className="text-center space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">
                    Security Notice
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    This system is monitored. Unauthorized access attempts will be logged and investigated.
                    All activities are tracked for security and compliance purposes.
                  </p>
                </div>
              </div>
            </form>
          </AuthWrapper>
          
          {/* System Status */}
          <div className="absolute -top-3 -right-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-200 dark:border-emerald-800">
              <div className="w-3 h-3 bg-emerald-500"></div>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                SECURE CONNECTION
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