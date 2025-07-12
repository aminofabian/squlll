"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { GraduationCap, Shield, BookOpen, Users, Building2, Star, ArrowRight, Globe } from "lucide-react"
import { debugAuth, checkAuthStatus } from "@/lib/utils"

// School Logo Component matching homepage design
function SchoolLogo({ schoolName }: { schoolName: string }) {
  const initials = schoolName.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)
  
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative">
        {/* Main logo container matching homepage */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary-light to-primary-dark border-3 border-white shadow-lg flex items-center justify-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white/10"></div>
          
          {/* Main building icon */}
          <Building2 className="h-10 w-10 text-white z-10 relative" />
          
          {/* Educational elements */}
          <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 border border-yellow-500 flex items-center justify-center z-20">
            <BookOpen className="h-2.5 w-2.5 text-primary-dark" />
          </div>
          
          {/* Academic excellence indicator */}
          <div className="absolute bottom-1 left-1 w-3 h-3 bg-white border border-primary-dark flex items-center justify-center z-20">
            <Star className="h-1.5 w-1.5 text-primary fill-current" />
          </div>
        </div>
        
        {/* School name abbreviation overlay */}
        <div className="absolute -bottom-2 -right-1 w-6 h-6 bg-primary-dark border-2 border-white flex items-center justify-center text-xs font-black text-white">
          {initials.toUpperCase()}
        </div>
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

      // Debug: Log the response data
      console.log('Login response:', data)

      // Debug: Check if cookies are set
      setTimeout(() => {
        console.log('=== Login Success Debug ===')
        debugAuth()
        const authStatus = checkAuthStatus()
        console.log('Auth status after login:', authStatus)
        console.log('=== End Login Debug ===')
      }, 100)

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
          window.location.href = `http://${userSubdomain}.${baseUrl}/staff-portal`
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header matching homepage */}
      <nav className="bg-white border-b-4 border-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="relative">
                  {/* Main logo container with gradient background */}
                  <div className="w-14 h-14 bg-gradient-to-br from-primary via-primary-light to-primary-dark border-3 border-white shadow-lg flex items-center justify-center relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-white/10"></div>
                    
                    {/* Main building icon */}
                    <Building2 className="h-7 w-7 text-white z-10 relative" />
                    
                    {/* Educational elements */}
                    <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 border border-yellow-500 flex items-center justify-center z-20">
                      <BookOpen className="h-2.5 w-2.5 text-primary-dark" />
                    </div>
                    
                    {/* Academic excellence indicator */}
                    <div className="absolute bottom-1 left-1 w-3 h-3 bg-white border border-primary-dark flex items-center justify-center z-20">
                      <Star className="h-1.5 w-1.5 text-primary fill-current" />
                    </div>
                  </div>
                  
                  {/* School name abbreviation overlay */}
                  <div className="absolute -bottom-2 -right-1 w-6 h-6 bg-primary-dark border-2 border-white flex items-center justify-center text-xs font-black text-white">
                    {schoolName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                </div>
                
                <div className="ml-4">
                  <span className="text-lg font-black text-gray-900 tracking-tight block leading-tight">
                    {schoolName.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-tight">
                    Excellence in Education
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-6 py-2">
                  <Link href={`/`}>
                    <Globe className="w-4 h-4 mr-2" />
                    BACK TO HOME
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section matching homepage */}
      <section className="bg-primary border-b-4 border-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white border-4 border-primary-dark px-6 py-3">
                <span className="text-primary font-bold text-lg flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  SCHOOL COMMUNITY PORTAL
                </span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-wider">
              WELCOME TO
            </h1>
            <h2 className="text-3xl md:text-5xl font-black text-yellow-400 mb-8 leading-tight tracking-wider border-4 border-yellow-400 inline-block px-8 py-4">
              {schoolName.toUpperCase()}
            </h2>
            
            <p className="text-xl md:text-2xl text-green-100 mb-12 max-w-4xl mx-auto leading-relaxed font-semibold">
              TEACHERS, STUDENTS, PARENTS & STAFF - ACCESS YOUR PERSONALIZED PORTAL. SIGN IN TO CONTINUE YOUR EDUCATIONAL JOURNEY.
            </p>
          </div>
        </div>
      </section>

      {/* Login Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          {/* Login Form Card */}
          <Card className="w-full border-4 border-primary shadow-2xl bg-white">
            <CardHeader className="text-center pb-6 border-b-4 border-primary">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-primary border-2 border-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-gray-900 tracking-wider">
                COMMUNITY SIGN IN
              </CardTitle>
              <CardDescription className="text-gray-600 font-semibold text-lg">
                Teachers, Students, Parents & Staff - Enter your credentials
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 border-4 border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 font-semibold">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {error}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your school email"
                      className="h-14 pl-12 border-4 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white rounded-xl transition-all duration-200 font-semibold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter your password"
                      className="h-14 pl-12 border-4 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white rounded-xl transition-all duration-200 font-semibold"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Shield className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      id="remember" 
                      type="checkbox" 
                      className="w-4 h-4 border-2 border-gray-300 bg-white rounded focus:ring-2 focus:ring-primary/20"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 font-semibold">
                      Remember me
                    </Label>
                  </div>
                  
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:text-primary-dark font-bold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-black py-4 text-lg border-4 border-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      SIGNING IN...
                    </div>
                  ) : (
                                      <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    ACCESS SCHOOL PORTAL
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  )}
                </Button>
              </form>

              {/* Help section */}
              <div className="pt-6 border-t-4 border-gray-300">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm font-black text-gray-900 uppercase tracking-wider">
                    <GraduationCap className="w-5 h-5" />
                    Need Help?
                  </div>
                  <p className="text-sm text-gray-600 font-semibold leading-relaxed">
                    Contact your school administrator for account access. 
                    Available for Teachers, Students, Parents & Staff.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border-4 border-gray-300 rounded-full shadow-sm">
              <div className="text-xs text-gray-500 font-bold">
                SQUL School Portal v2.1.0
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link 
                href="/help" 
                className="text-xs text-primary hover:text-primary-dark font-bold transition-colors"
              >
                Help & Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 