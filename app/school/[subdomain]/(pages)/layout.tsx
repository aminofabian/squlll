'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { SchoolSidebar } from '@/components/dashboard/SchoolSidebar'
import { Toaster } from "sonner"
import { debugAuth } from '@/lib/utils'
import { TermsDropdown } from './components/TermsDropdown'
import { TermProvider } from './contexts/TermContext'
import { SchoolNavbar } from './components/SchoolNavbar'

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
  }, [subdomain])

  // Get initials for avatar

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
    <TermProvider>
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
        <SchoolNavbar
          userName={userName}
          userRole={userRole}
          isSidebarMinimized={isSidebarMinimized}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onToggleSidebarMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />
        
        {/* Main content area with scrolling */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
    </TermProvider>
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