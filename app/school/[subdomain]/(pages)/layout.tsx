'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { SchoolSidebar } from '@/components/dashboard/SchoolSidebar'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Menu, 
  ChevronDown,
  Calendar,
  Plus,
  GraduationCap,
  Users,
  UserPlus,
  BookOpen,
  ClipboardList,
  School,
  X
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Toaster } from "sonner"

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [schoolName, setSchoolName] = useState('School Dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState('Administrator')
  const [userName, setUserName] = useState('John Doe')

  const searchParams = useSearchParams()
  const router = useRouter()

  const getCurrentKenyanTerm = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // JavaScript months are 0-based

    // Kenyan School Terms:
    // Term 1: January - March
    // Term 2: May - July
    // Term 3: September - November
    let term = ''
    if (month >= 1 && month <= 3) {
      term = `Term 1, ${year}`
    } else if (month >= 5 && month <= 7) {
      term = `Term 2, ${year}`
    } else if (month >= 9 && month <= 11) {
      term = `Term 3, ${year}`
    } else {
      // During holidays, show the upcoming term
      if (month === 4) term = `Term 2, ${year}`
      if (month === 8) term = `Term 3, ${year}`
      if (month === 12) term = `Term 1, ${year + 1}`
    }
    return term
  }

  const [currentTerm, setCurrentTerm] = useState(getCurrentKenyanTerm())

  useEffect(() => {
    // Check for URL parameters from registration
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const schoolUrl = searchParams.get('schoolUrl')
    const subdomainUrl = searchParams.get('subdomainUrl')
    const accessToken = searchParams.get('accessToken')
    const isNewRegistration = searchParams.get('newRegistration') === 'true'

    // If this is a new registration, store the data in cookies
    if (isNewRegistration && userId && email) {
      console.log('New registration detected, storing user data in cookies')
      
      // Store user data in cookies (30 day expiry)
      document.cookie = `userId=${userId}; max-age=${60 * 60 * 24 * 30}; path=/`
      document.cookie = `email=${email}; max-age=${60 * 60 * 24 * 30}; path=/`
      
      if (schoolUrl) {
        document.cookie = `schoolUrl=${schoolUrl}; max-age=${60 * 60 * 24 * 30}; path=/`
      }
      
      if (subdomainUrl) {
        document.cookie = `subdomainUrl=${subdomainUrl}; max-age=${60 * 60 * 24 * 30}; path=/`
      }
      
      if (accessToken) {
        document.cookie = `accessToken=${accessToken}; max-age=${60 * 60 * 24 * 30}; path=/`
      }
      
      // Remove parameters from URL to prevent sharing sensitive data
      router.replace(`/`)
    }

    // Fetch school-specific data based on the subdomain
    console.log('School subdomain:', subdomain)
    
    // Simulate fetching school name from API
    if (subdomain) {
      // This would normally be an API call
      const formattedName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1) + ' School'
      setSchoolName(formattedName)
    }

    // Update term when component mounts and every day at midnight
    const timer = setInterval(() => {
      setCurrentTerm(getCurrentKenyanTerm())
    }, 86400000) // 24 hours

    return () => clearInterval(timer)
  }, [subdomain, searchParams, router])

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const newItemOptions = [
    {
      title: 'New Class',
      icon: BookOpen,
      description: 'Create a new class or section',
      action: () => {/* Add navigation logic */}
    },
    {
      title: 'New Teacher',
      icon: GraduationCap,
      description: 'Add a new teacher to the system',
      action: () => {/* Add navigation logic */}
    },
    {
      title: 'New Student',
      icon: UserPlus,
      description: 'Register a new student',
      action: () => {/* Add navigation logic */}
    },
    {
      title: 'New Subject',
      icon: ClipboardList,
      description: 'Add a new subject or course',
      action: () => {/* Add navigation logic */}
    },
    {
      title: 'New Department',
      icon: School,
      description: 'Create a new department',
      action: () => {/* Add navigation logic */}
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" closeButton richColors />
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <SchoolSidebar subdomain={subdomain} schoolName={schoolName} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-white to-gray-50 border-b shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>

            <div className="hidden md:flex items-center space-x-2 min-w-[240px]">
              <div className="flex items-center space-x-2 bg-primary/5 px-3 py-1.5 rounded-md">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{currentTerm}</span>
                <ChevronDown className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px]">
                  <DropdownMenuLabel>Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {newItemOptions.map((option, index) => {
                    const Icon = option.icon
                    return (
                      <DropdownMenuItem
                        key={index}
                        className="flex items-center space-x-2 py-2"
                        onClick={option.action}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{option.title}</span>
                          <span className="text-xs text-gray-500">{option.description}</span>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start">
                    <span className="font-medium">New Student Registration</span>
                    <span className="text-sm text-gray-500">Sarah Johnson has submitted enrollment forms</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start">
                    <span className="font-medium">Attendance Alert</span>
                    <span className="text-sm text-gray-500">3 students marked absent in Class 10A</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                    <Avatar className="h-8 w-8 ring-2 ring-gray-100">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-gray-500">{userRole}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>School Settings</DropdownMenuItem>
                  <DropdownMenuItem>Help & Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main content area with scrolling */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}