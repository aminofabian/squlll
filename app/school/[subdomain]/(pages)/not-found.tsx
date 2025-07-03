'use client'

import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home, 
  ArrowLeft, 
  School, 
  Users, 
  GraduationCap, 
  BookOpen,
  Search,
  Settings,
  UserCheck,
  ClipboardList
} from 'lucide-react'

export default function SchoolNotFound() {
  const router = useRouter()
  const params = useParams()
  const subdomain = params.subdomain as string

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push(`/not-found`)
  }

  const quickLinks = [
    {
      title: 'Dashboard',
      description: 'Go to school dashboard',
      icon: Home,
      href: `/`,
    },
    {
      title: 'Students',
      description: 'Manage students',
      icon: Users,
      href: `/students`,
    },
    {
      title: 'Teachers',
      description: 'Manage teachers',
      icon: GraduationCap,
      href: `/teachers`,
    },
    {
      title: 'Classes',
      description: 'View classes',
      icon: BookOpen,
      href: `/classes`,
    },
    {
      title: 'Exams',
      description: 'Manage exams',
      icon: ClipboardList,
      href: `/exams`,
    },
    {
      title: 'Staff',
      description: 'Manage staff',
      icon: UserCheck,
      href: `/staff`,
    },
    {
      title: 'Settings',
      description: 'School settings',
      icon: Settings,
      href: `/settings`,
    },
  ]

  const schoolName = subdomain ? `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} School` : 'School'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
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
                  {schoolName}
                </span>
              </div>
            </div>

            {/* Main Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                Sorry, we couldn't find the page you're looking for in {schoolName}.
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
                Go to Dashboard
              </Button>
            </div>

            {/* Quick Links */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Quick Links for {schoolName}
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickLinks.slice(0, 4).map((link) => (
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
              
              {/* Additional Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {quickLinks.slice(4).map((link) => (
                  <Button
                    key={link.title}
                    variant="ghost"
                    onClick={() => router.push(link.href)}
                    className="flex items-center gap-3 h-auto p-3 text-left hover:bg-primary/5"
                  >
                    <link.icon className="w-4 h-4 text-primary flex-shrink-0" />
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
                If you continue to experience issues, please contact your school administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 