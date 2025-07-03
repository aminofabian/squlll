'use client'

import { useSchoolConfig } from '../../../lib/hooks/useSchoolConfig'
import { SchoolTypeSetup } from '../components/schooltype'
import { SchoolHomepage } from './(pages)/components/SchoolHomepage'
import { ClassHeader } from './(pages)/components/ClassCard'
import { useEffect, useState } from 'react'

export default function SchoolHome() {
  const { data: config, isLoading, error } = useSchoolConfig()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if access token exists in cookies
        const cookies = document.cookie.split(';')
        const accessToken = cookies.find(cookie => 
          cookie.trim().startsWith('accessToken=')
        )
        
        if (accessToken) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  // Show loading state while checking auth or loading config
  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-gray-500">
          {isCheckingAuth ? 'Checking authentication...' : 'Loading school configuration...'}
        </p>
      </main>
    )
  }

  // Check if this is a 401 error (no authentication) or no configuration exists
  const errorMessage = error instanceof Error ? error.message : (error || '')
  const isAuthError = error && (
    errorMessage.includes('401') || 
    errorMessage.includes('Unauthorized') || 
    errorMessage.includes('Authentication required') ||
    errorMessage.includes('School not found or access denied')
  )
  
  // If there's an auth error or no config data, show the setup flow
  // This handles new registrations or schools that haven't been configured yet
  const shouldShowSetup = isAuthError || !config || (config && (!config.selectedLevels || config.selectedLevels.length === 0))

  // If user is not authenticated and we have an auth error, show login prompt
  if (isAuthError && !isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be logged in to access this school portal.
            </p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = '/login'} 
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
            >
              Sign In
            </button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => window.location.href = '/register'} 
                className="text-primary hover:underline"
              >
                Contact your school administrator
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (shouldShowSetup) {
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

  // Show other errors (not auth related)
  if (error && !isAuthError) {
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

  // If configured, show the homepage
  return <SchoolHomepage />
}
