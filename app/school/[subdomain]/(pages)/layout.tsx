'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { SchoolSidebar, SCHOOL_SIDEBAR_WIDTH, SCHOOL_SIDEBAR_MIN_WIDTH } from '@/components/dashboard/SchoolSidebar'
import { getLayoutSchoolName } from '@/lib/schoolLogo'
import { Toaster } from "sonner"
import { debugAuth } from '@/lib/utils'
import { TermsDropdown } from './components/TermsDropdown'
import { TermProvider } from './contexts/TermContext'
import { SchoolNavbar } from './components/SchoolNavbar'
import { SchoolMobileBottomNav } from './components/SchoolMobileBottomNav'
import {
  getTenantIdFromCookies,
  isSchoolOnboardingComplete,
} from '@/lib/utils/school-onboarding'

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
  const router = useRouter()
  const subdomain = params.subdomain as string
  const [schoolName, setSchoolName] = useState('School Dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
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
    if (isSignupPage || isConfigLoading || isConfigured) {
      return;
    }
    router.replace('/setup');
  }, [isSignupPage, isConfigLoading, isConfigured, router]);

  useEffect(() => {
    if (isSignupPage || isConfigLoading || !isConfigured || !isMounted) {
      return;
    }
    const tenantId = getTenantIdFromCookies();
    if (!isSchoolOnboardingComplete(tenantId)) {
      router.replace('/onboarding');
    }
  }, [isSignupPage, isConfigLoading, isConfigured, isMounted, router]);

  useEffect(() => {
    // Only show loading state initially, then let the config loading state take over
    if (isMounted) {
      setShouldShowLoading(false)
    }
  }, [isMounted])


  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Default to icon rail (minimized). User can expand for full labels.
  useEffect(() => {
    const handleResize = () => {
      if (isInitialLoad) {
        setIsInitialLoad(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [isInitialLoad])

  useEffect(() => {
    // Fetch school-specific data based on the subdomain
    console.log('Pages Layout - School subdomain:', subdomain)
    
    // Simulate fetching school name from API
    if (subdomain) {
      setSchoolName(getLayoutSchoolName(subdomain))
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
      <div className="flex h-screen bg-[#f5f6f8] dark:bg-slate-950">
        <div
          className="animate-pulse bg-[#f5f6f8] dark:bg-slate-900"
          style={{ width: SCHOOL_SIDEBAR_MIN_WIDTH }}
        >
          <div className="p-4 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col bg-white dark:bg-slate-950">
          <div className="h-14 animate-pulse border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="h-full px-6 flex items-center justify-between">
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-slate-950" />
        </div>
      </div>
    )
  }

  // If configured, show layout with sidebar
  const showSidebarPanel = !isSidebarMinimized || isMobileSidebarOpen

  return (
    <TermProvider>
      <div className="flex h-screen bg-[#f5f6f8] dark:bg-slate-950">
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
        fixed top-0 bottom-0 left-0 z-50 transform transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        width: showSidebarPanel ? SCHOOL_SIDEBAR_WIDTH : SCHOOL_SIDEBAR_MIN_WIDTH,
      }}
      >
        
        <SchoolSidebar 
          subdomain={subdomain} 
          schoolName={schoolName} 
          isMinimized={!showSidebarPanel}
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />
      </div>
      
      {/* Main content — white canvas beside the rail */}
      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-950">
        {/* Header */}
        <SchoolNavbar
          userName={userName}
          userRole={userRole}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        
        {/* Main content area with scrolling */}
        <main className="flex-1 overflow-auto bg-white pb-[calc(4.75rem+env(safe-area-inset-bottom))] dark:bg-slate-950 lg:pb-0">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
          <SchoolMobileBottomNav />
        </div>
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