'use client'

import { useSchoolConfig } from '../../../lib/hooks/useSchoolConfig'
import { SchoolTypeSetup } from '../components/schooltype'
import { SchoolHomepage } from './(pages)/components/SchoolHomepage'
import { ClassHeader } from './(pages)/components/ClassCard'
import { useEffect, useState } from 'react'

export default function SchoolHome() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [hasAuthData, setHasAuthData] = useState<boolean | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Only load school config if we have authentication data
  const { data: config, isLoading, error } = useSchoolConfig(hasAuthData === true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check for cookies or query parameters on component mount
  useEffect(() => {
    if (!isClient) return
    
    const checkAuthData = () => {
      console.log('SchoolHome - Checking for authentication data...')
      
      // Ensure we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('SchoolHome - Not in browser environment, skipping auth check')
        setHasAuthData(false)
        setUserRole(null)
        return
      }
      
      try {
        // Check if access token exists in cookies (even if expired)
        const cookies = document.cookie.split(';')
        console.log('SchoolHome - All cookies:', document.cookie)
        
        const accessToken = cookies.find(cookie => 
          cookie.trim().startsWith('accessToken=')
        )
        
        // Check for role in cookies
        const roleCookie = cookies.find(cookie => 
          cookie.trim().startsWith('role=')
        )
        
        console.log('SchoolHome - Access token in cookies:', !!accessToken)
        console.log('SchoolHome - Access token value:', accessToken)
        console.log('SchoolHome - Role cookie:', roleCookie)
        
        // Extract role value
        let role = null
        if (roleCookie) {
          role = roleCookie.split('=')[1]?.trim()
          console.log('SchoolHome - User role:', role)
        }
        
        // Set user role
        setUserRole(role)
        
        // Set hasAuthData to true if we have any auth data (even expired token)
        if (accessToken || role) {
          console.log('SchoolHome - Found authentication data')
          setHasAuthData(true)
        } else {
          console.log('SchoolHome - No authentication data found')
          setHasAuthData(false)
        }
        
      } catch (error) {
        console.error('SchoolHome - Error checking authentication data:', error)
        setHasAuthData(false)
        setUserRole(null)
      }
    }

    checkAuthData()
  }, [isClient])

  // Show loading state while checking auth data or loading config
  if (hasAuthData === null || (hasAuthData === true && isLoading)) {
    console.log('SchoolHome - Showing loading state:', { hasAuthData, isLoading })
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-gray-500">
          {hasAuthData === null ? 'Checking authentication...' : 'Loading school configuration...'}
        </p>
      </main>
    )
  }

  // If no authentication data, show SchoolHomepage
  if (hasAuthData === false) {
    console.log('SchoolHome - No auth data, showing SchoolHomepage')
    console.log('SchoolHome - Final state:', { hasAuthData, userRole, isLoading, error, config: !!config })
    // Create a minimal config for public access
    const publicConfig = {
      id: 'public',
      selectedLevels: [],
      tenant: {
        id: 'public',
        schoolName: 'School Portal',
        subdomain: 'public'
      }
    }
    return <SchoolHomepage config={publicConfig} />
  }

  // If we have authentication data but there's an error loading config
  if (error) {
    console.log('SchoolHome - Error loading config:', error)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  // If we have authentication data, check if user is admin
  if (hasAuthData === true) {
    console.log('SchoolHome - Has auth data, checking role:', userRole)
    console.log('SchoolHome - Final state:', { hasAuthData, userRole, isLoading, error, config: !!config })
    
    // If user is admin, show SchoolTypeSetup
    if (userRole === 'admin') {
      console.log('SchoolHome - User is admin, showing SchoolTypeSetup')
      return (
        <main className="flex min-h-screen flex-col">
          <div className="flex-1">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              <ClassHeader />
            </div>
            <SchoolTypeSetup />
          </div>
        </main>
      )
    }
    
    // If user is not admin but has config, show SchoolHomepage
    if (config) {
      console.log('SchoolHome - User is not admin, showing SchoolHomepage with config')
      return <SchoolHomepage config={config} />
    }
    
    // If user is not admin and no config, show public SchoolHomepage
    console.log('SchoolHome - User is not admin, showing public SchoolHomepage')
    const publicConfig = {
      id: 'public',
      selectedLevels: [],
      tenant: {
        id: 'public',
        schoolName: 'School Portal',
        subdomain: 'public'
      }
    }
    return <SchoolHomepage config={publicConfig} />
  }


  
  // Fallback loading state
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-4 text-sm text-gray-500">
        Loading school configuration...
      </p>
    </main>
  )
}
