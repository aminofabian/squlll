"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { GraduationCap, Shield, BookOpen, Users } from "lucide-react"

// School Logo Component with creative styling
function SchoolLogo({ schoolName }: { schoolName: string }) {
  const initials = schoolName.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)
  
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative group">
        {/* Main logo container with gradient and glow effect */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/25">
          <div className="text-white font-bold text-2xl tracking-wider">
            {initials}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full border-4 border-white shadow-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute -top-4 -left-4 w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute -top-2 -right-6 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse delay-300"></div>
        <div className="absolute -bottom-3 -left-6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  )
}

export default function SchoolLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [schoolName, setSchoolName] = useState("School Portal")
  const router = useRouter()
  const params = useParams()
  const subdomain = params.subdomain as string

  useEffect(() => {
    if (subdomain) {
      const formattedName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1) + ' School'
      setSchoolName(formattedName)
    }
  }, [subdomain])

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
        body: JSON.stringify({ 
          email, 
          password,
          subdomain
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed')
      }

      // Redirect based on user role to their specific school subdomain
      const role = data.membership?.role
      const userSubdomain = data.subdomainUrl?.split('.')[0] || subdomain // Extract subdomain from response or fallback to current
      
      // Get the current hostname to determine the base URL
      const currentHost = window.location.hostname
      const baseUrl = currentHost.includes('localhost') ? 'localhost:3000' : 'squl.co.ke'
      
      switch (role) {
        case 'SCHOOL_ADMIN':
          window.location.href = `http://${userSubdomain}.${baseUrl}/dashboard`
          break
        case 'TEACHER':
          window.location.href = `http://${userSubdomain}.${baseUrl}/teacher`
          break
        case 'STUDENT':
          window.location.href = `http://${userSubdomain}.${baseUrl}/student`
          break
        case 'PARENT':
          window.location.href = `http://${userSubdomain}.${baseUrl}/parent`
          break
        case 'STAFF':
          window.location.href = `http://${userSubdomain}.${baseUrl}/staff`
          break
        default:
          // Fallback to dashboard for unknown roles
          window.location.href = `http://${userSubdomain}.${baseUrl}/dashboard`
          break
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <SchoolLogo schoolName={schoolName} />
          
          <div className="space-y-4">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 shadow-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              School Portal Access
            </div>
            
            {/* School title */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                {schoolName}
              </h1>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                Learning Management System
              </p>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to access your personalized learning environment
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="w-full border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your school email"
                    className="h-12 pl-12 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    className="h-12 pl-12 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input 
                    id="remember" 
                    type="checkbox" 
                    className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 rounded focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">
                    Remember me
                  </Label>
                </div>
                
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Sign In to Portal
                  </div>
                )}
              </Button>
            </form>

            {/* Help section */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                  Need Help?
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Contact your school administrator for account access. 
                  Technical support available 24/7.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              SQUL School Portal v2.1.0
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <Link 
              href="/help" 
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Help & Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 