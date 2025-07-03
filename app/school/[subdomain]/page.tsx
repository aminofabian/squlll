'use client'

import { useSchoolConfig } from '../../../lib/hooks/useSchoolConfig'
import { SchoolTypeSetup } from '../components/schooltype'
import { SchoolHomepage } from './(pages)/components/SchoolHomepage'
import { ClassHeader } from './(pages)/components/ClassCard'
import { useEffect, useState } from 'react'

export default function SchoolHome() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [shouldLoadConfig, setShouldLoadConfig] = useState(false)
  
  // Only load school config after authentication is confirmed
  const { data: config, isLoading, error } = useSchoolConfig(shouldLoadConfig)

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = () => {
      console.log('SchoolHome - Starting authentication check...')
      try {
        // Check if access token exists in cookies
        const cookies = document.cookie.split(';')
        const accessToken = cookies.find(cookie => 
          cookie.trim().startsWith('accessToken=')
        )
        
        console.log('SchoolHome - Access token in cookies:', !!accessToken)
        
        if (accessToken) {
          console.log('SchoolHome - User is authenticated, enabling config loading')
          setIsAuthenticated(true)
          setShouldLoadConfig(true) // Enable config loading
        } else {
          // Check if we have authentication data in URL parameters (new registration)
          const urlParams = new URLSearchParams(window.location.search)
          const hasAuthParams = urlParams.get('accessToken') || urlParams.get('newRegistration')
          
          console.log('SchoolHome - Has auth params:', !!hasAuthParams)
          
          if (hasAuthParams) {
            console.log('SchoolHome - New registration detected, waiting for cookies...')
            // Wait a bit longer for the layout to process the authentication data
            setTimeout(() => {
              const updatedCookies = document.cookie.split(';')
              const updatedAccessToken = updatedCookies.find(cookie => 
                cookie.trim().startsWith('accessToken=')
              )
              
              console.log('SchoolHome - After timeout, access token:', !!updatedAccessToken)
              
              if (updatedAccessToken) {
                console.log('SchoolHome - Authentication successful, enabling config loading')
                setIsAuthenticated(true)
                setShouldLoadConfig(true) // Enable config loading
              } else {
                console.log('SchoolHome - Authentication failed after timeout')
                setIsAuthenticated(false)
              }
              setIsCheckingAuth(false)
            }, 2000) // Wait 2 seconds for cookies to be set
            return
          } else {
            console.log('SchoolHome - No authentication found')
            setIsAuthenticated(false)
          }
        }
      } catch (error) {
        console.error('SchoolHome - Error checking authentication:', error)
        setIsAuthenticated(false)
      }
      
      setIsCheckingAuth(false)
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
  
  console.log('SchoolHome - Auth state:', {
    isCheckingAuth,
    isAuthenticated,
    shouldLoadConfig,
    hasError: !!error,
    isAuthError,
    hasConfig: !!config
  })
  
  // If there's an auth error or no config data, show the setup flow
  // This handles new registrations or schools that haven't been configured yet
  const shouldShowSetup = isAuthError || !config || (config && (!config.selectedLevels || config.selectedLevels.length === 0))

  // If user is not authenticated and we have an auth error, show login prompt
  // But only if we're not still checking authentication
  if (isAuthError && !isAuthenticated && !isCheckingAuth) {
    // Check if this is a new registration
    const urlParams = new URLSearchParams(window.location.search)
    const isNewRegistration = urlParams.get('newRegistration') === 'true' || urlParams.get('accessToken')
    
    if (isNewRegistration) {
      // For new registrations, show a loading state while authentication is being processed
      return (
        <main className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Setting up your school
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we configure your school portal...
              </p>
            </div>
          </div>
        </main>
      )
    }
    
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

  if (shouldShowSetup && !isCheckingAuth) {
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
  if (error && !isAuthError && !isCheckingAuth) {
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
  if (!isCheckingAuth) {
    return <SchoolHomepage />
  }
  
  // Fallback loading state
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-4 text-sm text-gray-500">
        Finalizing setup...
      </p>
    </main>
  )
}
