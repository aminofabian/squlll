'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home, 
  ArrowLeft, 
  School, 
  Users, 
  GraduationCap, 
  BookOpen,
  Search
} from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const quickLinks = [
    {
      title: 'Home',
      description: 'Go to main page',
      icon: Home,
      href: '/',
    },
    {
      title: 'Dashboard',
      description: 'Access dashboard',
      icon: School,
      href: '/dashboard',
    },
    {
      title: 'Login',
      description: 'Sign in to your account',
      icon: Users,
      href: '/login',
    },
    {
      title: 'Register',
      description: 'Create new account',
      icon: GraduationCap,
      href: '/register',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            {/* 404 Number */}
            <div className="mb-6">
              <div className="text-8xl font-bold text-primary/20 mb-2">
                404
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <School className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Squl Platform
                </span>
              </div>
            </div>

            {/* Main Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                Sorry, we couldn't find the page you're looking for.
              </p>
              <p className="text-gray-500 text-sm">
                The page may have been moved, deleted, or you may have entered an incorrect URL.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button onClick={handleGoHome} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
            </div>

            {/* Quick Links */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Quick Links
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickLinks.map((link) => (
                  <Button
                    key={link.title}
                    variant="ghost"
                    onClick={() => router.push(link.href)}
                    className="flex flex-col items-center gap-2 h-auto p-4 text-center hover:bg-primary/5"
                  >
                    <link.icon className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {link.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {link.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Support Text */}
            <div className="mt-8 pt-6 border-t">
              <p className="text-xs text-gray-500">
                If you continue to experience issues, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 