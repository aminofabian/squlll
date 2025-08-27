'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
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
  X,
  PanelLeftOpen,
  PanelLeftClose
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
import { debugAuth } from '@/lib/utils'

// Loading component for Suspense fallback
function LayoutLoading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r animate-pulse">
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b animate-pulse">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex-1 bg-gray-50"></div>
      </div>
    </div>
  )
}

// Main layout component that uses useSearchParams
function SchoolLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const subdomain = params.subdomain as string
  const [schoolName, setSchoolName] = useState('School Dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Check if this is a signup page - don't fetch school config for signup pages
  const isSignupPage = pathname?.includes('/signup') || pathname?.includes('/login')
  
  // For signup pages, render minimal layout without authentication checks
  if (isSignupPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Toaster position="top-right" closeButton richColors />
        {children}
      </div>
    )
  }
  
  // Check if school is configured - but only for non-signup pages
  const { data: config, isLoading: isConfigLoading } = useSchoolConfig(!isSignupPage)
  const isConfigured = config && config.selectedLevels && config.selectedLevels.length > 0

  // Add a state to track if we're in a loading state that should show the loading UI
  const [shouldShowLoading, setShouldShowLoading] = useState(true)

  useEffect(() => {
    // Only show loading state initially, then let the config loading state take over
    if (isMounted) {
      setShouldShowLoading(false)
    }
  }, [isMounted])

  const getCurrentKenyanTerm = () => {
    // Use a fixed date for server-side rendering to prevent hydration issues
    const now = new Date('2024-01-15') // Fixed date
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
    setIsMounted(true)
  }, [])

  // Handle responsive sidebar state based on screen size for 11-inch devices
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (isInitialLoad) {
        // On initial load, default to minimized on 11-inch and medium devices (768px - 1200px)
        // 11-inch devices are typically around 820-834px width
        if (width >= 768 && width < 1200) {
          setIsSidebarMinimized(true)
        }
        setIsInitialLoad(false)
      } else {
        // On subsequent resizes, auto-adjust based on screen size
        // Keep sidebar minimized for 11-inch devices and smaller tablets/laptops
        if (width >= 768 && width < 1200) {
          setIsSidebarMinimized(true)
        } else if (width >= 1200) {
          setIsSidebarMinimized(false)
        }
        // Keep current state on small devices (< 768px) as sidebar behavior is different
      }
    }

    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Call once on mount to handle initial state
    handleResize()

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [isInitialLoad])

  useEffect(() => {
    // Fetch school-specific data based on the subdomain
    console.log('Pages Layout - School subdomain:', subdomain)
    
    // Simulate fetching school name from API
    if (subdomain) {
      // This would normally be an API call
      const formattedName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1) + ' School'
      setSchoolName(formattedName)
    }

    // Read user information from cookies
    const getUserFromCookies = () => {
      if (typeof window === 'undefined') return
      
      const cookieValue = `; ${document.cookie}`
      const getCookie = (name: string) => {
        const parts = cookieValue.split(`; ${name}=`)
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift() || null
        }
        return null
      }
      
      const userNameFromCookie = getCookie('userName')
      const userRoleFromCookie = getCookie('userRole')
      
      if (userNameFromCookie) {
        setUserName(decodeURIComponent(userNameFromCookie))
      }
      if (userRoleFromCookie) {
        setUserRole(decodeURIComponent(userRoleFromCookie))
      }
    }

    getUserFromCookies()

    // Update term when component mounts and every day at midnight
    const timer = setInterval(() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      let term = ''
      if (month >= 1 && month <= 3) {
        term = `Term 1, ${year}`
      } else if (month >= 5 && month <= 7) {
        term = `Term 2, ${year}`
      } else if (month >= 9 && month <= 11) {
        term = `Term 3, ${year}`
      } else {
        if (month === 4) term = `Term 2, ${year}`
        if (month === 8) term = `Term 3, ${year}`
        if (month === 12) term = `Term 1, ${year + 1}`
      }
      setCurrentTerm(term)
    }, 86400000) // 24 hours

    return () => clearInterval(timer)
  }, [subdomain])

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') {
      return 'U' // Default initial for unknown user
    }
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

  // Progress indicator state (hardcoded for now)
  const completedSteps = 2;
  const totalSteps = 5;

  // Progress steps definition
  const progressSteps = [
    { label: 'Set up classes', icon: BookOpen },
    { label: 'Set up students', icon: UserPlus },
    { label: 'Set up teachers', icon: GraduationCap },
    { label: 'Set up subjects', icon: ClipboardList },
    { label: 'School details', icon: School },
  ];
  const currentStepIndex = Math.min(completedSteps, progressSteps.length - 1);
  const currentStep = progressSteps[currentStepIndex];

  // ProgressIndicator component (themed for school management, blends with navbar)
  const ProgressIndicator = () => (
    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border-2 border-primary/20 px-3 py-1 mr-4 h-12">
      <div className="relative flex items-center justify-center w-9 h-9 mr-2">
        <svg className="w-9 h-9" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="rgb(241 245 249)" // slate-100
            strokeWidth="4"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 18}
            strokeDashoffset={2 * Math.PI * 18 * (1 - completedSteps / totalSteps)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s' }}
          />
        </svg>
        <span className="absolute text-[13px] font-mono font-bold text-primary select-none">
          {completedSteps}/{totalSteps}
        </span>
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1 text-[14px] font-mono font-semibold text-primary leading-tight">
          {currentStep.icon && <currentStep.icon className="w-4 h-4 mr-1 text-primary" />}
          {currentStep.label}
        </div>
        <div className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-tight">Finish all steps to unlock all features</div>
      </div>
    </div>
  );

  // If not configured, show full-width layout without sidebar
  if (!isConfigured && !isConfigLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Toaster position="top-right" closeButton richColors />
        {children}
      </div>
    )
  }

  // Show loading state until mounted or while config is loading
  if (!isMounted || shouldShowLoading || isConfigLoading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-64 bg-white dark:bg-slate-900 border-r-2 border-primary/20 animate-pulse">
          <div className="p-4 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white dark:bg-slate-900 border-b-2 border-primary/20 animate-pulse">
            <div className="h-full px-6 flex items-center justify-between">
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900"></div>
        </div>
      </div>
    )
  }

  // If configured, show layout with sidebar
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
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
        fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r-2 border-primary/20 transform transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarMinimized ? 'w-16' : 'w-64'}
      `}>
        
        <SchoolSidebar 
          subdomain={subdomain} 
          schoolName={schoolName} 
          isMinimized={isSidebarMinimized}
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b-2 border-primary/20 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="md:hidden border-primary/20 hover:bg-primary/5 transition-all duration-200"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu className="h-4 w-4 text-primary" />
            </Button>
            
            {/* Desktop sidebar toggle button */}
            <Button 
              variant="outline" 
              size="icon" 
              className="hidden md:flex border-primary/20 hover:bg-primary/5 transition-all duration-200"
              onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
              title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
              {isSidebarMinimized ? (
                <PanelLeftOpen className="h-4 w-4 text-primary" />
              ) : (
                <PanelLeftClose className="h-4 w-4 text-primary" />
              )}
            </Button>

            <div className="hidden md:flex items-center space-x-2 min-w-[240px]">
              <div className="flex items-center space-x-2 bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary/10 transition-all duration-200">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-mono font-medium text-primary">{currentTerm}</span>
                <ChevronDown className="h-4 w-4 text-primary" />
              </div>
            </div>
            {/* Progress Indicator Section */}
            <div className="hidden md:block">
              <ProgressIndicator />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="space-x-2 border-primary/20 hover:bg-primary/5 transition-all duration-200">
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm">New</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px] border-2 border-primary/20 bg-white dark:bg-slate-800">
                  <DropdownMenuLabel className="font-mono text-xs uppercase tracking-wide text-primary">Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  {newItemOptions.map((option, index) => {
                    const Icon = option.icon
                    return (
                                        <DropdownMenuItem
                    key={index}
                    className="flex items-center space-x-2 py-2 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                    onClick={option.action}
                  >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-mono font-medium">{option.title}</span>
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{option.description}</span>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/5 transition-all duration-200 relative">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px] border-2 border-primary/20 bg-white dark:bg-slate-800">
                  <DropdownMenuLabel className="font-mono text-xs uppercase tracking-wide text-primary">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem className="flex flex-col items-start hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                    <span className="font-mono font-medium">New Student Registration</span>
                    <span className="text-sm font-mono text-slate-600 dark:text-slate-400">Sarah Johnson has submitted enrollment forms</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                    <span className="font-mono font-medium">Attendance Alert</span>
                    <span className="text-sm font-mono text-slate-600 dark:text-slate-400">3 students marked absent in Class 10A</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 border-primary/20 hover:bg-primary/5 transition-all duration-200">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-mono font-medium">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-mono font-medium">{userName || 'User'}</span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{userRole || 'Member'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] border-2 border-primary/20 bg-white dark:bg-slate-800">
                  <DropdownMenuLabel className="font-mono text-xs uppercase tracking-wide text-primary">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem className="font-mono hover:bg-primary/5 transition-all duration-200 cursor-pointer">Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem className="font-mono hover:bg-primary/5 transition-all duration-200 cursor-pointer">School Settings</DropdownMenuItem>
                  <DropdownMenuItem className="font-mono hover:bg-primary/5 transition-all duration-200 cursor-pointer">Help & Support</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem className="font-mono text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-mono font-medium">{getInitials(userName || 'User')}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-2 border-primary/20 bg-white dark:bg-slate-800">
                  <DropdownMenuItem className="font-mono hover:bg-primary/5 transition-all duration-200 cursor-pointer">Profile</DropdownMenuItem>
                  <DropdownMenuItem className="font-mono hover:bg-primary/5 transition-all duration-200 cursor-pointer">Settings</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem className="font-mono text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer">Log out</DropdownMenuItem>
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

// Main export with Suspense boundary
export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LayoutLoading />}>
      <SchoolLayoutContent>
        {children}
      </SchoolLayoutContent>
    </Suspense>
  )
}